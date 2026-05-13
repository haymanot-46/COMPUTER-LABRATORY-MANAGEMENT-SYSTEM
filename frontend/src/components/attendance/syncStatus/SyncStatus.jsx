import React from 'react';
import './SyncStatus.css';

const SyncStatus = ({ status, progress, onRetry }) => {
  const getStatusIcon = () => {
    switch(status) {
      case 'syncing': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStatusText = () => {
    switch(status) {
      case 'syncing': return 'Syncing attendance data...';
      case 'success': return 'Sync completed successfully!';
      case 'error': return 'Sync failed. Please try again.';
      default: return 'Waiting to sync...';
    }
  };

  if (status === 'idle') return null;

  return (
    <div className={`sync-status-component ${status}`}>
      <div className="sync-icon">{getStatusIcon()}</div>
      <div className="sync-info">
        <div className="sync-message">{getStatusText()}</div>
        {status === 'syncing' && (
          <div className="sync-progress">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            <span className="progress-text">{progress}%</span>
          </div>
        )}
      </div>
      {status === 'error' && (
        <button className="retry-btn" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};

export default SyncStatus;