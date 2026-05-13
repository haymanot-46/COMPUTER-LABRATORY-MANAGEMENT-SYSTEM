import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status, size = 'medium' }) => {
  const getStatusConfig = () => {
    const configs = {
      // Attendance Status
      present: { label: 'Present', icon: '✅', color: 'success' },
      absent: { label: 'Absent', icon: '❌', color: 'error' },
      late: { label: 'Late', icon: '⏰', color: 'warning' },
      excused: { label: 'Excused', icon: '📝', color: 'info' },
      
      // Equipment Status
      available: { label: 'Available', icon: '✅', color: 'success' },
      'in-use': { label: 'In Use', icon: '🔧', color: 'warning' },
      maintenance: { label: 'Maintenance', icon: '⚠️', color: 'error' },
      damaged: { label: 'Damaged', icon: '❌', color: 'error' },
      
      // Schedule Status
      approved: { label: 'Approved', icon: '✅', color: 'success' },
      pending: { label: 'Pending', icon: '⏳', color: 'warning' },
      rejected: { label: 'Rejected', icon: '❌', color: 'error' },
      cancelled: { label: 'Cancelled', icon: '🚫', color: 'error' },
      completed: { label: 'Completed', icon: '📋', color: 'info' },
      
      // Request Status
      'in-progress': { label: 'In Progress', icon: '🔄', color: 'info' },
      resolved: { label: 'Resolved', icon: '✅', color: 'success' },
      
      // User Status
      active: { label: 'Active', icon: '🟢', color: 'success' },
      inactive: { label: 'Inactive', icon: '🔴', color: 'error' },
      suspended: { label: 'Suspended', icon: '⚠️', color: 'warning' },
      
      // Default
      default: { label: status, icon: '📌', color: 'default' }
    };

    return configs[status] || configs.default;
  };

  const config = getStatusConfig();
  const sizeClass = `badge-${size}`;

  return (
    <span className={`status-badge ${config.color} ${sizeClass}`}>
      <span className="badge-icon">{config.icon}</span>
      <span className="badge-label">{config.label}</span>
    </span>
  );
};

export default StatusBadge;