// frontend/src/components/computers/ComputerStats.jsx
import React from 'react';

const ComputerStats = ({ computers }) => {
  const total = computers.length;
  const available = computers.filter(c => c.status === 'available').length;
  const inUse = computers.filter(c => c.status === 'in-use').length;
  const maintenance = computers.filter(c => c.status === 'maintenance').length;
  const damaged = computers.filter(c => c.status === 'damaged').length;

  return (
    <div className="computer-stats">
      <div>Total: {total}</div>
      <div>Available: {available}</div>
      <div>In Use: {inUse}</div>
      <div>Maintenance: {maintenance}</div>
      <div>Damaged: {damaged}</div>
    </div>
  );
};

export default ComputerStats;