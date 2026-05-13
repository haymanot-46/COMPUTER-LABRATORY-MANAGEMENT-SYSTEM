// frontend/src/pages/asset/Components/StatusBadge.jsx
import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch(status) {
      case 'available':
        return { label: 'Available', class: 'available', icon: 'check_circle' };
      case 'in-use':
        return { label: 'In Use', class: 'in-use', icon: 'play_circle' };
      case 'borrowed':
        return { label: 'Borrowed', class: 'borrowed', icon: 'handshake' };
      case 'maintenance':
        return { label: 'Maintenance', class: 'maintenance', icon: 'build' };
      case 'damaged':
        return { label: 'Damaged', class: 'damaged', icon: 'error' };
      case 'retired':
        return { label: 'Retired', class: 'retired', icon: 'delete' };
      default:
        return { label: status || 'Unknown', class: 'unknown', icon: 'help' };
    }
  };
  
  const config = getStatusConfig();
  
  return (
    <span className={`status-badge ${config.class}`}>
      <span className="material-icons status-icon">{config.icon}</span>
      {config.label}
    </span>
  );
};

export default StatusBadge;