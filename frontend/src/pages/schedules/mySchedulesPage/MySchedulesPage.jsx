// frontend/src/pages/schedules/MySchedulesPage/MySchedulesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { scheduleService } from '../../../services';
import { ScheduleList, ScheduleDetail } from '../../../components/schedules';
import './MySchedulesPage.css';

const MySchedulesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isTeacher, isStudent, isDean, isLabManager } = useRole();
  const { addToast, addNotification } = useNotification();
  
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    loadSchedules();
  }, [filterStatus]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const result = await scheduleService.getMySchedules();
      if (result && result.success) {
        let data = result.data;
        if (filterStatus !== 'all') {
          data = data.filter(s => s.status === filterStatus);
        }
        setSchedules(data);
      } else {
        addToast(result?.message || 'Failed to load schedules', 'error');
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      addToast('Failed to load schedules', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDetail(true);
  };

  const handleEditSchedule = (schedule) => {
    // Only allow editing if status is pending
    if (schedule.status === 'pending') {
      navigate('/book-lab', { state: { schedule } });
    } else {
      addToast('Only pending schedules can be edited', 'warning');
    }
  };

  const handleCancelSchedule = async (schedule) => {
    if (window.confirm('Are you sure you want to cancel this schedule?')) {
      try {
        const result = await scheduleService.cancelSchedule(schedule.id, 'Cancelled by user');
        if (result && result.success) {
          addToast('Schedule cancelled successfully', 'success');
          if (addNotification) {
            addNotification({
              title: 'Schedule Cancelled',
              message: `Your booking for ${schedule.title} has been cancelled`,
              type: 'warning'
            });
          }
          loadSchedules();
          setShowDetail(false);
        } else {
          addToast(result?.message || 'Failed to cancel schedule', 'error');
        }
      } catch (error) {
        console.error('Error cancelling schedule:', error);
        addToast('Failed to cancel schedule', 'error');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { class: 'badge-approved', icon: '✅', text: 'Approved' },
      pending: { class: 'badge-pending', icon: '⏳', text: 'Pending' },
      rejected: { class: 'badge-rejected', icon: '❌', text: 'Rejected' },
      cancelled: { class: 'badge-cancelled', icon: '🚫', text: 'Cancelled' },
      completed: { class: 'badge-completed', icon: '✓', text: 'Completed' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.icon} {config.text}</span>;
  };

  const calculateStats = () => {
    const total = schedules.length;
    const approved = schedules.filter(s => s.status === 'approved').length;
    const pending = schedules.filter(s => s.status === 'pending').length;
    const rejected = schedules.filter(s => s.status === 'rejected').length;
    const completed = schedules.filter(s => s.status === 'completed').length;
    const upcoming = schedules.filter(s => 
      s.status === 'approved' && new Date(s.date) > new Date()
    ).length;
    
    return { total, approved, pending, rejected, completed, upcoming };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="my-schedules-loading">
        <div className="spinner"></div>
        <p>Loading your schedules...</p>
      </div>
    );
  }

  return (
    <div className="my-schedules-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div>
            <h1>📅 My Schedules</h1>
            <p>View and manage your laboratory bookings</p>
          </div>
        </div>
        <div className="header-right">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 List View
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              📅 Calendar View
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card upcoming">
          <div className="stat-value">{stats.upcoming}</div>
          <div className="stat-label">Upcoming</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Status Filter:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button className="refresh-btn" onClick={loadSchedules}>
          🔄 Refresh
        </button>
      </div>

      {/* Upcoming Schedule Highlight */}
      {stats.upcoming > 0 && (
        <div className="upcoming-highlight">
          <div className="highlight-icon">🎯</div>
          <div className="highlight-info">
            <h3>Upcoming Session</h3>
            <p>
              {schedules.find(s => s.status === 'approved' && new Date(s.date) > new Date())?.title} - 
              {schedules.find(s => s.status === 'approved' && new Date(s.date) > new Date())?.date}
            </p>
          </div>
          <button className="highlight-btn" onClick={() => navigate('/schedule-calendar')}>
            View Calendar →
          </button>
        </div>
      )}

      {/* Schedules List */}
      {viewMode === 'list' ? (
        <ScheduleList
          schedules={schedules}
          onView={handleViewSchedule}
          onEdit={handleEditSchedule}
          onCancel={handleCancelSchedule}
          userRole={user?.role}
        />
      ) : (
        <div className="calendar-mini-view">
          <div className="calendar-header">
            <h3>📅 Calendar View</h3>
            <button onClick={() => navigate('/schedule-calendar')} className="full-calendar-btn">
              Open Full Calendar →
            </button>
          </div>
          <div className="calendar-grid">
            {schedules.slice(0, 6).map(schedule => (
              <div key={schedule.id} className="calendar-event-card" onClick={() => handleViewSchedule(schedule)}>
                <div className="event-date">{schedule.date}</div>
                <div className="event-title">{schedule.title}</div>
                <div className="event-time">{schedule.startTime} - {schedule.endTime}</div>
                <div className="event-lab">🔬 {schedule.lab}</div>
                {getStatusBadge(schedule.status)}
              </div>
            ))}
          </div>
          {schedules.length > 6 && (
            <div className="more-events">
              +{schedules.length - 6} more schedules
            </div>
          )}
        </div>
      )}

      {/* No Schedules */}
      {schedules.length === 0 && (
        <div className="no-schedules">
          <div className="no-schedules-icon">📅</div>
          <h3>No Schedules Found</h3>
          <p>You haven't made any lab bookings yet.</p>
          {(isTeacher() || isDean() || isLabManager()) && (
            <button className="book-now-btn" onClick={() => navigate('/book-lab')}>
              + Book a Lab Now
            </button>
          )}
        </div>
      )}

      {/* Schedule Detail Modal */}
      {showDetail && selectedSchedule && (
        <ScheduleDetail
          schedule={selectedSchedule}
          onClose={() => setShowDetail(false)}
          onEdit={() => handleEditSchedule(selectedSchedule)}
          onCancel={() => handleCancelSchedule(selectedSchedule)}
        />
      )}
    </div>
  );
};

export default MySchedulesPage;