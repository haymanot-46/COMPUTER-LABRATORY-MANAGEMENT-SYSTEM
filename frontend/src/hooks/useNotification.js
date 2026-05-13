import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return { addToast: () => {}, addNotification: () => {}, notifications: [], unreadCount: 0 };
  }
  return context;
};

export default useNotification;