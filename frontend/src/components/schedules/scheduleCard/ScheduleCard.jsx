import React from 'react';
import './ScheduleCard.css';

const ScheduleCard = ({ schedule, onView, onEdit, onCancel, userRole }) => {
  const getStatusConfig = (status) => {
    const configs = {
      approved: { icon: '✅', color: '#2e7d32', bg: '#e8f5e9', label: 'Approved' },
      pending: { icon: '⏳', color: '#856404', bg: '#fff3cd', label: 'Pending' },
      rejected: { icon: '❌', color: '#c62828', bg: '#ffebee', label: 'Rejected' },
      cancelled: { icon: '🚫', color: '#666', bg: '#f5f5f5', label: 'Cancelled' }
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(schedule.status);
  const canEdit = userRole === 'teacher' && schedule.status === 'pending';
  const canCancel = (userRole === 'teacher' || userRole === 'dean') && schedule.status === 'approved';

  return (
    <div className="schedule-card">
      <div className="card-header">
        <h3>{schedule.title}</h3>
        <span className="status-badge" style={{ background: statusConfig.bg, color: statusConfig.color }}>{statusConfig.icon} {statusConfig.label}</span>
      </div>
      <div className="card-body">
        <div className="detail-row"><span className="detail-icon">🏢</span><span>{schedule.lab}</span></div>
        <div className="detail-row"><span className="detail-icon">📅</span><span>{schedule.date}</span></div>
        <div className="detail-row"><span className="detail-icon">⏰</span><span>{schedule.startTime} - {schedule.endTime}</span></div>
        <div className="detail-row"><span className="detail-icon">👨‍🏫</span><span>{schedule.instructor}</span></div>
      </div>
      <div className="card-actions">
        <button className="action-btn view" onClick={() => onView(schedule)}>👁️ View</button>
        {canEdit && <button className="action-btn edit" onClick={() => onEdit(schedule)}>✏️ Edit</button>}
        {canCancel && <button className="action-btn cancel" onClick={() => onCancel(schedule)}>🚫 Cancel</button>}
      </div>
    </div>
  );
};

export default ScheduleCard;