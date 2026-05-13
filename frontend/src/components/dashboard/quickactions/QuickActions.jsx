// frontend/src/components/dashboard/quickactions/QuickActions.jsx
import React from 'react';
import './QuickActions.css';

const QuickActions = ({ actions, onActionClick }) => {
  const getActionIcon = (icon) => {
    const icons = {
      calendar: '📅',
      computer: '🖥️',
      approve: '✅',
      report: '📊',
      attendance: '📋',
      equipment: '📦',
      add: '➕',
      audit: '🔍',
      schedule: '📆',
      status: '📈',
      maintenance: '🔧',
      user: '👤'
    };
    return icons[icon] || icon || '⚡';
  };

  return (
    <div className="quick-actions">
      <div className="quick-actions-header">
        <h3>⚡ Quick Actions</h3>
      </div>
      <div className="quick-actions-grid">
        {actions.map((action, index) => (
          <button
            key={index}
            className="quick-action-card"
            onClick={() => onActionClick(action)}
          >
            <div className="quick-action-icon">{getActionIcon(action.icon)}</div>
            <div className="quick-action-label">{action.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;