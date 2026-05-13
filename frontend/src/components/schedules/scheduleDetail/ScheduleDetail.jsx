// frontend/src/components/schedules/ScheduleDetail.jsx
import React from 'react';
import './ScheduleDetail.css';

const ScheduleDetail = ({ schedule, onClose, onEdit, onCancel }) => {
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

  const statusBadge = getStatusBadge(schedule.status);

  return (
    <div className="schedule-detail-modal" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Schedule Details</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="detail-header">
            <h2>{schedule.title}</h2>
            <span className={`status-badge ${statusBadge.class}`}>
              {statusBadge.icon} {statusBadge.text}
            </span>
          </div>
          
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-icon">🔬</span>
              <div>
                <div className="detail-label">Laboratory</div>
                <div className="detail-value">{schedule.lab}</div>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">📅</span>
              <div>
                <div className="detail-label">Date</div>
                <div className="detail-value">{schedule.date}</div>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">⏰</span>
              <div>
                <div className="detail-label">Time</div>
                <div className="detail-value">{schedule.startTime} - {schedule.endTime}</div>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">👨‍🏫</span>
              <div>
                <div className="detail-label">Instructor</div>
                <div className="detail-value">{schedule.instructor}</div>
              </div>
            </div>
            
            {schedule.course && (
              <div className="detail-item">
                <span className="detail-icon">📚</span>
                <div>
                  <div className="detail-label">Course</div>
                  <div className="detail-value">{schedule.course}</div>
                </div>
              </div>
            )}
            
            {schedule.department && (
              <div className="detail-item">
                <span className="detail-icon">🏛️</span>
                <div>
                  <div className="detail-label">Department</div>
                  <div className="detail-value">{schedule.department}</div>
                </div>
              </div>
            )}
            
            {schedule.students && (
              <div className="detail-item">
                <span className="detail-icon">👥</span>
                <div>
                  <div className="detail-label">Students</div>
                  <div className="detail-value">{schedule.students}</div>
                </div>
              </div>
            )}
          </div>
          
          {schedule.description && (
            <div className="detail-description">
              <strong>Description:</strong>
              <p>{schedule.description}</p>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          {onEdit && schedule.status === 'pending' && (
            <button className="edit-btn" onClick={onEdit}>✏️ Edit</button>
          )}
          {onCancel && schedule.status !== 'cancelled' && schedule.status !== 'completed' && (
            <button className="cancel-btn" onClick={onCancel}>🗑️ Cancel</button>
          )}
          <button className="close-modal-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetail;