import React, { useState } from 'react';
import './ComputerCard.css';
const ComputerCard = ({ computer, onView, onEdit, onDelete, onStatusChange }) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusConfig = (status) => {
    const configs = {
      available: { label: 'Available', icon: '✅', color: '#10b981', bg: '#d1fae5' },
      'in-use': { label: 'In Use', icon: '🔧', color: '#3b82f6', bg: '#dbeafe' },
      maintenance: { label: 'Maintenance', icon: '⚠️', color: '#f59e0b', bg: '#fed7aa' },
      damaged: { label: 'Damaged', icon: '❌', color: '#ef4444', bg: '#fee2e2' }
    };
    return configs[status] || configs.available;
  };

  const statusConfig = getStatusConfig(computer.status);

  return (
    <div 
      className="computer-card"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="card-header">
        <div className="computer-icon">🖥️</div>
        <div className="computer-info">
          <h3 className="computer-name">{computer.name}</h3>
          <div className="computer-id">ID: {computer.id}</div>
        </div>
        <div className="status-badge" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
          <span className="status-icon">{statusConfig.icon}</span>
          <span>{statusConfig.label}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="specs-grid">
          <div className="spec-item">
            <span className="spec-icon">⚙️</span>
            <div className="spec-details">
              <span className="spec-label">CPU</span>
              <span className="spec-value">{computer.cpu || 'Intel Core i5'}</span>
            </div>
          </div>
          <div className="spec-item">
            <span className="spec-icon">💾</span>
            <div className="spec-details">
              <span className="spec-label">RAM</span>
              <span className="spec-value">{computer.ram || '8GB'}</span>
            </div>
          </div>
          <div className="spec-item">
            <span className="spec-icon">📀</span>
            <div className="spec-details">
              <span className="spec-label">Storage</span>
              <span className="spec-value">{computer.storage || '256GB SSD'}</span>
            </div>
          </div>
          <div className="spec-item">
            <span className="spec-icon">🏢</span>
            <div className="spec-details">
              <span className="spec-label">Lab</span>
              <span className="spec-value">{computer.lab || 'Not Assigned'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`card-actions ${showActions ? 'visible' : ''}`}>
        <button className="card-action view" onClick={() => onView(computer)}>👁️ View</button>
        <button className="card-action edit" onClick={() => onEdit(computer)}>✏️ Edit</button>
        <button className="card-action delete" onClick={() => onDelete(computer.id)}>🗑️ Delete</button>
      </div>

      <div className="status-selector">
        <select 
          value={computer.status}
          onChange={(e) => onStatusChange(computer.id, e.target.value)}
          className="status-select"
          style={{ borderColor: statusConfig.color }}
        >
          <option value="available">✅ Available</option>
          <option value="in-use">🔧 In Use</option>
          <option value="maintenance">⚠️ Maintenance</option>
          <option value="damaged">❌ Damaged</option>
        </select>
      </div>
    </div>
  );
};

export default ComputerCard;