import React from 'react';
import './ScheduleReports.css';

const ScheduledReports = ({ schedules, onDelete, onEdit, onRunNow }) => {
  const getFrequencyIcon = (frequency) => {
    const icons = {
      daily: '📅',
      weekly: '📆',
      monthly: '📅',
      quarterly: '📊'
    };
    return icons[frequency] || '⏰';
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="status-badge active">✅ Active</span>;
    }
    return <span className="status-badge paused">⏸️ Paused</span>;
  };

  const getReportTypeIcon = (type) => {
    const icons = {
      attendance: '📊',
      computers: '🖥️',
      maintenance: '🔧',
      equipment: '📦'
    };
    return icons[type] || '📋';
  };

  if (!schedules || schedules.length === 0) {
    return (
      <div className="scheduled-reports-empty">
        <div className="empty-icon">⏰</div>
        <h3>No Scheduled Reports</h3>
        <p>Create your first scheduled report to automate report generation</p>
      </div>
    );
  }

  return (
    <div className="scheduled-reports">
      {schedules.map((schedule) => (
        <div key={schedule.id} className="schedule-card">
          <div className="schedule-header">
            <div className="schedule-icon">{getReportTypeIcon(schedule.reportType)}</div>
            <div className="schedule-info">
              <h3>{schedule.name}</h3>
              <p>{schedule.description}</p>
            </div>
            {getStatusBadge(schedule.status)}
          </div>

          <div className="schedule-details">
            <div className="detail-row">
              <span className="detail-label">Report Type:</span>
              <span className="detail-value">{schedule.reportType}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Frequency:</span>
              <span className="detail-value">
                {schedule.frequency === 'weekly' && `Every ${schedule.dayOfWeek}`}
                {schedule.frequency === 'monthly' && `Day ${schedule.dayOfMonth} of month`}
                {schedule.frequency === 'daily' && 'Daily'}
                {schedule.frequency === 'quarterly' && 'Quarterly'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Time:</span>
              <span className="detail-value">{schedule.time}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Format:</span>
              <span className="detail-value">{schedule.format?.toUpperCase()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Recipients:</span>
              <span className="detail-value">{schedule.recipients?.join(', ')}</span>
            </div>
            {schedule.lastRun && (
              <div className="detail-row">
                <span className="detail-label">Last Run:</span>
                <span className="detail-value">{new Date(schedule.lastRun).toLocaleString()}</span>
              </div>
            )}
            {schedule.nextRun && (
              <div className="detail-row">
                <span className="detail-label">Next Run:</span>
                <span className="detail-value">{new Date(schedule.nextRun).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="schedule-actions">
            <button className="action-btn run" onClick={() => onRunNow(schedule.id)}>
              ▶️ Run Now
            </button>
            <button className="action-btn edit" onClick={() => onEdit(schedule)}>
              ✏️ Edit
            </button>
            <button className="action-btn delete" onClick={() => onDelete(schedule.id)}>
              🗑️ Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduledReports;