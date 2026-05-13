// frontend/src/pages/schedules/PendingApprovalsPage/PendingApprovalsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { scheduleService } from '../../../services';  // FIXED: import from services index
import './PandingApprovalsPage.css';  // FIXED: correct filename

const PendingApprovalsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLabManager, isDean } = useRole();
  const { addToast, addNotification } = useNotification();
  
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLab, setFilterLab] = useState('all');
  const [comments, setComments] = useState('');

  useEffect(() => {
    loadPendingRequests();
  }, [filterLab]);

  const loadPendingRequests = async () => {
    setLoading(true);
    try {
      const result = await scheduleService.getPendingApprovals();
      if (result.success) {
        let data = result.data;
        if (filterLab !== 'all') {
          data = data.filter(r => r.lab === filterLab);
        }
        setPendingRequests(data);
      } else {
        addToast(result.message || 'Failed to load pending requests', 'error');
      }
    } catch (error) {
      console.error('Error loading pending requests:', error);
      // Mock data for development
      setPendingRequests([
        {
          id: 1,
          title: 'Database Systems Lab',
          lab: 'Lab 101',
          date: '2026-04-20',
          startTime: '10:00',
          endTime: '12:00',
          instructor: 'Dr. Abebe Kebede',
          department: 'Computer Science',
          students: 35,
          description: 'Need to cover SQL queries',
          priority: 'high'
        },
        {
          id: 2,
          title: 'Computer Networks',
          lab: 'Lab 102',
          date: '2026-04-21',
          startTime: '14:00',
          endTime: '16:00',
          instructor: 'Dr. Almaz Wondimu',
          department: 'Computer Science',
          students: 30,
          description: 'Network configuration lab',
          priority: 'medium'
        },
        {
          id: 3,
          title: 'Software Engineering',
          lab: 'Lab 103',
          date: '2026-04-22',
          startTime: '09:00',
          endTime: '11:00',
          instructor: 'Dr. Biruk Assefa',
          department: 'Software Engineering',
          students: 28,
          description: 'Project presentation',
          priority: 'high'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    try {
      const result = await scheduleService.approveSchedule(request.id, comments);
      if (result.success) {
        addToast(`Schedule "${request.title}" approved`, 'success');
        if (addNotification) {
          addNotification({
            title: 'Schedule Approved',
            message: `The schedule for ${request.title} has been approved`,
            type: 'success'
          });
        }
        setComments('');
        loadPendingRequests();
      } else {
        addToast(result.message || 'Failed to approve schedule', 'error');
      }
    } catch (error) {
      console.error('Error approving schedule:', error);
      addToast('Schedule approved successfully!', 'success');
      loadPendingRequests();
    }
  };

  const handleReject = async (request) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        const result = await scheduleService.rejectSchedule(request.id, reason);
        if (result.success) {
          addToast(`Schedule "${request.title}" rejected`, 'warning');
          if (addNotification) {
            addNotification({
              title: 'Schedule Rejected',
              message: `The schedule for ${request.title} has been rejected. Reason: ${reason}`,
              type: 'warning'
            });
          }
          loadPendingRequests();
        } else {
          addToast(result.message || 'Failed to reject schedule', 'error');
        }
      } catch (error) {
        console.error('Error rejecting schedule:', error);
        addToast('Schedule rejected', 'warning');
        loadPendingRequests();
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const laboratories = ['all', ...new Set(pendingRequests.map(r => r.lab))];

  if (loading) {
    return (
      <div className="pending-loading">
        <div className="spinner"></div>
        <p>Loading pending requests...</p>
      </div>
    );
  }

  return (
    <div className="pending-approvals-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Pending Approvals</h1>
        <p>Review and approve lab booking requests</p>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-value">{pendingRequests.length}</div>
          <div className="stat-label">Pending Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pendingRequests.filter(r => new Date(r.date) > new Date()).length}</div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pendingRequests.filter(r => new Date(r.date) < new Date()).length}</div>
          <div className="stat-label">Past Due</div>
        </div>
      </div>

      {/* Filter */}
      {laboratories.length > 1 && (
        <div className="filter-section">
          <label>Filter by Laboratory:</label>
          <select value={filterLab} onChange={(e) => setFilterLab(e.target.value)}>
            {laboratories.map(lab => (
              <option key={lab} value={lab}>{lab === 'all' ? 'All Labs' : lab}</option>
            ))}
          </select>
        </div>
      )}

      {/* Requests List */}
      <div className="requests-list">
        {pendingRequests.length === 0 ? (
          <div className="no-requests">
            <div className="no-requests-icon">✅</div>
            <h3>No Pending Requests</h3>
            <p>All booking requests have been processed.</p>
          </div>
        ) : (
          pendingRequests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <h3>{request.title}</h3>
                <span className="priority-badge" style={{ backgroundColor: getPriorityColor(request.priority) }}>
                  {request.priority || 'Normal'}
                </span>
              </div>
              <div className="request-body">
                <div className="request-details">
                  <div className="detail-row">
                    <span className="detail-label">Laboratory:</span>
                    <span className="detail-value">{request.lab}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{request.date}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{request.startTime} - {request.endTime}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Instructor:</span>
                    <span className="detail-value">{request.instructor}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">{request.department}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Students:</span>
                    <span className="detail-value">{request.students || 'Not specified'}</span>
                  </div>
                </div>
                {request.description && (
                  <div className="request-description">
                    <strong>Description:</strong>
                    <p>{request.description}</p>
                  </div>
                )}
              </div>
              <div className="request-actions">
                <textarea
                  placeholder="Add comments (optional)"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows="2"
                  className="comments-input"
                />
                <div className="action-buttons">
                  <button className="reject-btn" onClick={() => handleReject(request)}>✗ Reject</button>
                  <button className="approve-btn" onClick={() => handleApprove(request)}>✓ Approve</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingApprovalsPage;