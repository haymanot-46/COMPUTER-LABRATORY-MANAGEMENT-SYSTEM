import React from 'react';
import './OffLineIndicator.css';

const OfflineIndicator = ({ isOffline, pendingCount, onSync }) => {
  if (!isOffline && pendingCount === 0) return null;

  return (
    <div className={`offline-indicator ${isOffline ? 'offline' : 'online'}`}>
      <div className="indicator-content">
        <div className="indicator-icon">
          {isOffline ? '📡' : '🔄'}
        </div>
        <div className="indicator-message">
          {isOffline ? (
            <>
              <strong>You are offline</strong>
              <p>Changes will be saved locally and synced when connection is restored.</p>
            </>
          ) : (
            <>
              <strong>Back Online</strong>
              <p>{pendingCount} pending {pendingCount === 1 ? 'item' : 'items'} ready to sync.</p>
            </>
          )}
        </div>
        {!isOffline && pendingCount > 0 && (
          <button className="sync-now-btn" onClick={onSync}>
            Sync Now
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;