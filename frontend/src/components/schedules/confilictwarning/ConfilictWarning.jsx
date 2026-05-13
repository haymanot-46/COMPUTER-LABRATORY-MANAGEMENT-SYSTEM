import React from 'react';
import './ConflictWarning.css';

const ConflictWarning = ({ conflicts, onConfirm, onCancel }) => {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div className="conflict-modal">
      <div className="conflict-overlay" onClick={onCancel}></div>
      <div className="conflict-content">
        <div className="conflict-header">
          <div className="conflict-icon">⚠️</div>
          <h3>Schedule Conflict Detected</h3>
        </div>
        <div className="conflict-body">
          <p>The following conflicts were found:</p>
          <div className="conflicts-list">
            {conflicts.map((conflict, i) => (
              <div key={i} className="conflict-item">
                📅 {conflict.title} on {conflict.date} ({conflict.startTime} - {conflict.endTime})
              </div>
            ))}
          </div>
          <p>Do you still want to proceed?</p>
        </div>
        <div className="conflict-footer">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="confirm-btn" onClick={onConfirm}>Continue Anyway</button>
        </div>
      </div>
    </div>
  );
};

export default ConflictWarning;