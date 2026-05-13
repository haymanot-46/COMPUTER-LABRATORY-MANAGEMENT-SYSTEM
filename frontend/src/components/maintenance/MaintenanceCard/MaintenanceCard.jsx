import React, { useState } from 'react';
import './MaintenanceCard.css';

const MaintenanceCard = ({ request, onView, onUpdate, onAssign, onComplete }) => {
  const [showActions, setShowActions] = useState(false);

  const getPriorityConfig = (priority) => {
    const configs = {
      low: { icon: '🟢', color: '#48bb78', label: 'Low' },
      medium: { icon: '🟠', color: '#ed8936', label: 'Medium' },
      high: { icon: '🔴', color: '#e53e3e', label: 'High' },
      urgent: { icon: '⚠️', color: '#c62828', label: 'Urgent' }
    };
    return configs[priority] || configs.medium;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { icon: '⏳', color: '#856404', bg: '#fff3cd', label: 'Pending' },
      'in-progress': { icon: '🔄', color: '#1565c0', bg: '#e3f2fd', label: 'In Progress' },
      completed: { icon: '✅', color: '#2e7d32', bg: '#e8f5e9', label: 'Completed' },
      cancelled: { icon: '❌', color: '#666', bg: '#f5f5f5', label: 'Cancelled' }
    };
    return configs[status] || configs.pending;
  };

  const priorityConfig = getPriorityConfig(request.priority);
  const statusConfig = getStatusConfig(request.status);

  const getCategoryIcon = (category) => {
    const icons = {
      hardware: '🔧',
      software: '💻',
      network: '🌐',
      peripheral: '🖱️',
      other: '📌'
    };
    return icons[category] || '🔧';
  };

  return (
    <div 
      className="maintenance-card"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="card-header">
        <div className="card-title-section">
          <span className="category-icon">{getCategoryIcon(request.category)}</span>
          <h3 className="request-title">{request.title}</h3>
        </div>
        <div className="card-badges">
          <span className="priority-badge" style={{ backgroundColor: priorityConfig.color }}>
            {priorityConfig.icon} {priorityConfig.label}
          </span>
          <span className="status-badge" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
            {statusConfig.icon} {statusConfig.label}
          </span>
        </div>
      </div>

      <div className="card-body">
        <p className="request-description">{request.description}</p>
        
        <div className="request-details">
          <div className="detail-item">
            <span className="detail-icon">🖥️</span>
            <span className="detail-text">{request.computerName || `Computer #${request.computerId}`}</span>
          </div>
          {request.lab && (
            <div className="detail-item">
              <span className="detail-icon">🏢</span>
              <span className="detail-text">{request.lab}</span>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-icon">👤</span>
            <span className="detail-text">{request.reportedBy}</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">📅</span>
            <span className="detail-text">{new Date(request.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {request.assignedTo && (
          <div className="assigned-info">
            <span className="assigned-icon">👨‍🔧</span>
            <span className="assigned-text">Assigned to: {request.assignedTo}</span>
          </div>
        )}
      </div>

      <div className={`card-actions ${showActions ? 'visible' : ''}`}>
        <button className="card-action view" onClick={() => onView(request)}>
          👁️ View Details
        </button>
        <button className="card-action edit" onClick={() => onUpdate(request)}>
          ✏️ Edit
        </button>
        {request.status === 'pending' && (
          <button className="card-action assign" onClick={() => onAssign(request)}>
            👤 Assign
          </button>
        )}
        {request.status === 'in-progress' && (
          <button className="card-action complete" onClick={() => onComplete(request)}>
            ✅ Complete
          </button>
        )}
      </div>
    </div>
  );
};

export default MaintenanceCard;