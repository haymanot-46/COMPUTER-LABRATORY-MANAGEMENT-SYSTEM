import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon, color, trend, changeType }) => {
  const getTrendIcon = () => {
    if (changeType === 'up') return '📈';
    if (changeType === 'down') return '📉';
    return '➡️';
  };

  const getTrendClass = () => {
    if (changeType === 'up') return 'trend-up';
    if (changeType === 'down') return 'trend-down';
    return 'trend-neutral';
  };

  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ backgroundColor: `${color}20`, color: color }}>
        {icon}
      </div>
      <div className="stat-card-info">
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-title">{title}</div>
      </div>
      {trend !== undefined && (
        <div className={`stat-card-trend ${getTrendClass()}`}>
          <span className="trend-icon">{getTrendIcon()}</span>
          <span className="trend-value">{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;