import { useContext } from 'react';
import { OfflineContext } from '../context/OfflineContext';

const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    return { isOffline: false, addToPendingSync: () => {}, pendingCount: 0 };
  }
  return context;
};

export default useOffline;