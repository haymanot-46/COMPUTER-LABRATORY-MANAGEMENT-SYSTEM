// frontend/src/components/computers/ComputerGrid.jsx
import React from 'react';

const ComputerGrid = ({ computers, onView, onEdit, onDelete, onStatusChange }) => {
  const getStatusConfig = (status) => {
    const configs = {
      available: { class: 'status-available', icon: '✅', text: 'Available' },
      'in-use': { class: 'status-in-use', icon: '🔧', text: 'In Use' },
      maintenance: { class: 'status-maintenance', icon: '⚠️', text: 'Maintenance' },
      damaged: { class: 'status-damaged', icon: '❌', text: 'Damaged' }
    };
    return configs[status] || configs.available;
  };

  if (computers.length === 0) {
    return (
      <div className="computer-grid-empty">
        <div className="empty-icon">🖥️</div>
        <h3>No Computers Found</h3>
        <p>No computers match your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="computer-grid">
      {computers.map(computer => {
        const statusConfig = getStatusConfig(computer.status);
        return (
          <div key={computer.id} className="computer-card">
            <div className="card-header">
              <div className="computer-icon">🖥️</div>
              <div className={`status-badge ${statusConfig.class}`}>
                {statusConfig.icon} {statusConfig.text}
              </div>
            </div>
            
            <div className="card-body">
              <h3 className="computer-name">{computer.name}</h3>
              <div className="computer-details">
                <div className="detail-item">
                  <span className="detail-label">Model:</span>
                  <span>{computer.model || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Lab:</span>
                  <span>{computer.lab || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Specs:</span>
                  <span>{computer.cpu} / {computer.ram}</span>
                </div>
              </div>
            </div>
            
            <div className="card-actions">
              <button className="action-btn view" onClick={() => onView(computer)}>👁️ View</button>
              {onEdit && <button className="action-btn edit" onClick={() => onEdit(computer)}>✏️ Edit</button>}
              {onStatusChange && (
                <select className="status-select" value={computer.status} onChange={(e) => onStatusChange(computer.id, e.target.value)}>
                  <option value="available">✅ Available</option>
                  <option value="in-use">🔧 In Use</option>
                  <option value="maintenance">⚠️ Maintenance</option>
                  <option value="damaged">❌ Damaged</option>
                </select>
              )}
              {onDelete && <button className="action-btn delete" onClick={() => onDelete(computer.id)}>🗑️ Delete</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ComputerGrid; // ADD THIS DEFAULT EXPORT