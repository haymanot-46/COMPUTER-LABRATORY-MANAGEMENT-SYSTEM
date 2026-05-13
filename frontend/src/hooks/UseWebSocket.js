import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

const useWebSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    return { isConnected: false, emit: () => {} };
  }
  return context;
};

export default useWebSocket;