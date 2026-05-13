// frontend/src/pages/schedules/ScheduleCalendarPage/ScheduleCalendarPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import scheduleService from '../../../services/scheduleService';
import { ScheduleCalendar, ScheduleDetail } from '../../../components/schedules';
import './ScheduleCalendarPage.css';

const ScheduleCalendarPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isTeacher, isStudent, isLabManager } = useRole();
  const { addToast, addNotification } = useNotification();
  
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterLab, setFilterLab] = useState('all');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadSchedules();
  }, [currentDate, filterLab]);

  const loadSchedules = async () => {
    setLoading(true);
    
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const filters = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      lab: filterLab !== 'all' ? filterLab : undefined
    };
    
    try {
      const result = await scheduleService.getSchedules(filters);
      if (result.success) {
        setSchedules(result.data || []);
      } else {
        console.warn('Failed to load schedules:', result.message);
        setSchedules([]);
        addToast(result.message || 'Failed to load schedules', 'error');
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      setSchedules([]);
      addToast('Failed to load schedules', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const schedulesForDate = schedules.filter(s => s.date === dateStr);
    if (schedulesForDate.length > 0) {
      setSelectedSchedule(schedulesForDate[0]);
      setShowDetail(true);
    }
  };

  const handleEventClick = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDetail(true);
  };

  const handleExport = async () => {
    try {
      const result = await scheduleService.exportSchedules();
      if (result.success) {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'schedule_calendar.ics');
        document.body.appendChild(link);
        link.click();
        link.remove();
        addToast('Calendar exported successfully', 'success');
      } else {
        addToast('Export failed', 'error');
      }
    } catch (error) {
      console.error('Export error:', error);
      addToast('Export failed', 'error');
    }
  };

  const handleCancelSchedule = async (scheduleId) => {
    try {
      const result = await scheduleService.cancelSchedule(scheduleId, 'Cancelled by user');
      if (result.success) {
        addToast('Schedule cancelled successfully', 'success');
        await loadSchedules();
        setShowDetail(false);
      } else {
        addToast(result.message || 'Failed to cancel schedule', 'error');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      addToast('Failed to cancel schedule', 'error');
    }
  };

  const laboratories = ['all', 'Lab 101', 'Lab 102', 'Lab 103', 'Lab 104', 'Lab 105'];

  if (loading) {
    return (
      <div className="schedule-loading">
        <div className="spinner"></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="schedule-calendar-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Schedule Calendar</h1>
        <button className="export-btn" onClick={handleExport}>📥 Export Calendar</button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Laboratory:</label>
          <select value={filterLab} onChange={(e) => setFilterLab(e.target.value)}>
            {laboratories.map(lab => (
              <option key={lab} value={lab}>{lab === 'all' ? 'All Laboratories' : lab}</option>
            ))}
          </select>
        </div>
        <div className="legend">
          <div className="legend-item"><span className="legend-color approved"></span>Approved</div>
          <div className="legend-item"><span className="legend-color pending"></span>Pending</div>
          <div className="legend-item"><span className="legend-color in-progress"></span>In Progress</div>
          <div className="legend-item"><span className="legend-color completed"></span>Completed</div>
        </div>
      </div>

      {/* Calendar Component */}
      <ScheduleCalendar
        schedules={schedules}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
        viewMode={viewMode}
        onViewChange={setViewMode}
      />

      {/* Schedule Detail Modal */}
      {showDetail && selectedSchedule && (
        <ScheduleDetail
          schedule={selectedSchedule}
          onClose={() => setShowDetail(false)}
          onEdit={() => navigate('/book-lab', { state: { schedule: selectedSchedule } })}
          onCancel={() => handleCancelSchedule(selectedSchedule.id)}
        />
      )}
    </div>
  );
};

export default ScheduleCalendarPage;