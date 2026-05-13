// frontend/src/components/schedules/ScheduleList.jsx
import React from 'react';
import './ScheduleList.css';

const ScheduleList = ({ schedules, onView, onEdit, onCancel, userRole }) => {
  const getStatusBadge = (status) => {
    const badges = {
      approved: { class: 'status-approved', icon: '✅', text: 'Approved' },
      pending: { class: 'status-pending', icon: '⏳', text: 'Pending' },
      rejected: { class: 'status-rejected', icon: '❌', text: 'Rejected' },
      cancelled: { class: 'status-cancelled', icon: '🚫', text: 'Cancelled' },
      completed: { class: 'status-completed', icon: '✓', text: 'Completed' }
    };
    return badges[status] || badges.pending;
  };

  const canEdit = (schedule) => {
    return schedule.status === 'pending' && 
           (userRole === 'teacher' || userRole === 'lab_manager');
  };

  const canCancel = (schedule) => {
    return schedule.status !== 'cancelled' && 
           schedule.status !== 'completed' &&
           new Date(schedule.date) > new Date();
  };

  if (schedules.length === 0) {
    return (
      <div className="schedule-list-empty">
        <div className="empty-icon">📅</div>
        <h3>No Schedules Found</h3>
        <p>No schedules match your criteria.</p>
      </div>
    );
  }

  return (
    <div className="schedule-list">
      <div className="schedule-grid">
        {schedules.map((schedule) => {
          const statusBadge = getStatusBadge(schedule.status);
          return (
            <div key={schedule.id} className="schedule-card">
              <div className="schedule-header">
                <div className="schedule-title">
                  <h3>{schedule.title}</h3>
                  <span className={`status-badge ${statusBadge.class}`}>
                    {statusBadge.icon} {statusBadge.text}
                  </span>
                </div>
              </div>
              
              <div className="schedule-body">
                <div className="schedule-details">
                  <div className="detail-item">
                    <span className="detail-icon">🔬</span>
                    <span>{schedule.lab}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <span>{schedule.date}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">⏰</span>
                    <span>{schedule.startTime} - {schedule.endTime}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">👨‍🏫</span>
                    <span>{schedule.instructor}</span>
                  </div>
                  {schedule.course && (
                    <div className="detail-item">
                      <span className="detail-icon">📚</span>
                      <span>{schedule.course}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="schedule-footer">
                <div className="schedule-actions">
                  <button className="action-btn view" onClick={() => onView(schedule)}>
                    👁️ View
                  </button>
                  {canEdit(schedule) && onEdit && (
                    <button className="action-btn edit" onClick={() => onEdit(schedule)}>
                      ✏️ Edit
                    </button>
                  )}
                  {canCancel(schedule) && onCancel && (
                    <button className="action-btn cancel" onClick={() => onCancel(schedule)}>
                      🗑️ Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleList