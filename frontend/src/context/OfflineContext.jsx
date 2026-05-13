// frontend/src/context/OfflineContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

export const OfflineContext = createContext();

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
};

export const OfflineProvider = ({ children }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingSync, setPendingSync] = useState([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (pendingSync.length > 0) {
        syncPendingData();
      }
    };
    
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const stored = localStorage.getItem('pendingSync');
    if (stored) {
      try {
        setPendingSync(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse pendingSync:', error);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSync.length]);

  const addToPendingSync = (data) => {
    const newPending = [...pendingSync, { ...data, id: Date.now(), timestamp: new Date().toISOString() }];
    setPendingSync(newPending);
    localStorage.setItem('pendingSync', JSON.stringify(newPending));
  };

  const syncPendingData = async () => {
    if (pendingSync.length === 0) return;
    
    console.log('Syncing pending data...', pendingSync);
    
    for (const item of pendingSync) {
      try {
        console.log(`Syncing item ${item.id}:`, item);
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
      }
    }
    
    setPendingSync([]);
    localStorage.removeItem('pendingSync');
  };

  const removeFromPendingSync = (id) => {
    const newPending = pendingSync.filter(item => item.id !== id);
    setPendingSync(newPending);
    if (newPending.length === 0) {
      localStorage.removeItem('pendingSync');
    } else {
      localStorage.setItem('pendingSync', JSON.stringify(newPending));
    }
  };

  const value = {
    isOffline,
    pendingSync,
    pendingCount: pendingSync.length,
    addToPendingSync,
    syncPendingData,
    removeFromPendingSync
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

export default OfflineProvider;