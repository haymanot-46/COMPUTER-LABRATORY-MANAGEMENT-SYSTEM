// frontend/src/components/computers/ComputerStatus.jsx
import React from 'react';

const ComputerStatus = ({ computers }) => {
  const stats = {
    available: computers.filter(c => c.status === 'available').length,
    inUse: computers.filter(c => c.status === 'in-use').length,
    maintenance: computers.filter(c => c.status === 'maintenance').length,
    damaged: computers.filter(c => c.status === 'damaged').length
  };

  const total = computers.length;

  return (
    <div className="computer-status">
      <h3>Computer Status Overview</h3>
      <div className="status-cards">
        <div className="status-card">Available: {stats.available}</div>
        <div className="status-card">In Use: {stats.inUse}</div>
        <div className="status-card">Maintenance: {stats.maintenance}</div>
        <div className="status-card">Damaged: {stats.damaged}</div>
      </div>
      <div className="total-count">Total Computers: {total}</div>
    </div>
  );
};

export default ComputerStatus;