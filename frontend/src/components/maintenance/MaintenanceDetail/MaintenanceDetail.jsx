import React from 'react';
import './MaintenanceDetail.css';

const MaintenanceDetail = ({ request, onClose, onEdit, onAssign, onComplete }) => {
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

  const getCategoryLabel = (category) => {
    const labels = {
      hardware: '🔧 Hardware Issue',
      software: '💻 Software Issue',
      network: '🌐 Network Issue',
      peripheral: '🖱️ Peripheral Issue',
      other: '📌 Other'
    };
    return labels[category] || '📌 Other';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="maintenance-detail-modal">
      <div className="detail-modal-overlay" onClick={onClose}></div>
      <div className="detail-modal-content">
        <div className="detail-modal-header">
          <h2>Maintenance Request #{request.id}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="detail-modal-body">
          <div className="detail-section">
            <div className="detail-badges">
              <span className="priority-badge" style={{ backgroundColor: priorityConfig.color }}>
                {priorityConfig.icon} {priorityConfig.label} Priority
              </span>
              <span className="status-badge" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
                {statusConfig.icon} {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h3>📋 Request Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Title:</span>
                <span className="detail-value">{request.title}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{getCategoryLabel(request.category)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Computer:</span>
                <span className="detail-value">{request.computerName || `Computer #${request.computerId}`}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Laboratory:</span>
                <span className="detail-value">{request.lab || 'Not Assigned'}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{request.description}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>👤 Reporter Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Reported By:</span>
                <span className="detail-value">{request.reportedBy}</span>
              </div>
              {request.contactEmail && (
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{request.contactEmail}</span>
                </div>
              )}
              {request.contactPhone && (
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{request.contactPhone}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-label">Reported Date:</span>
                <span className="detail-value">{formatDate(request.createdAt)}</span>
              </div>
            </div>
          </div>

          {request.assignedTo && (
            <div className="detail-section">
              <h3>👨‍🔧 Assignment Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Assigned To:</span>
                  <span className="detail-value">{request.assignedTo}</span>
                </div>
                {request.assignedDate && (
                  <div className="detail-item">
                    <span className="detail-label">Assigned Date:</span>
                    <span className="detail-value">{formatDate(request.assignedDate)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {request.completedDate && (
            <div className="detail-section">
              <h3>✅ Completion Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Completed Date:</span>
                  <span className="detail-value">{formatDate(request.completedDate)}</span>
                </div>
                {request.resolution && (
                  <div className="detail-item full-width">
                    <span className="detail-label">Resolution:</span>
                    <span className="detail-value">{request.resolution}</span>
                  </div>
                )}
                {request.partsUsed && request.partsUsed.length > 0 && (
                  <div className="detail-item full-width">
                    <span className="detail-label">Parts Used:</span>
                    <span className="detail-value">{request.partsUsed.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {request.images && request.images.length > 0 && (
            <div className="detail-section">
              <h3>📸 Attached Images</h3>
              <div className="images-grid">
                {request.images.map((image, index) => (
                  <img key={index} src={image} alt={`Attachment ${index + 1}`} className="attached-image" />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="detail-modal-actions">
          <button className="action-btn edit" onClick={() => onEdit(request)}>
            ✏️ Edit Request
          </button>
          {request.status === 'pending' && (
            <button className="action-btn assign" onClick={() => onAssign(request)}>
              👤 Assign Technician
            </button>
          )}
          {request.status === 'in-progress' && (
            <button className="action-btn complete" onClick={() => onComplete(request)}>
              ✅ Mark Complete
            </button>
          )}
          <button className="action-btn close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDetail;