// frontend/src/pages/asset/Components/StatCard.jsx
import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon, color, trend }) => {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-card-content">
        <div className="stat-icon" style={{ color }}>
          <span className="material-icons">{icon}</span>
        </div>
        <div className="stat-info">
          <div className="stat-value">{value}</div>
          <div className="stat-title">{title}</div>
          {trend && <div className="stat-trend">{trend}</div>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;