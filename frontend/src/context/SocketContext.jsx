import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import useAuth from '../hooks/useAuth';  // ✅ Default import (no curly braces)

export const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    console.warn('useSocket must be used within SocketProvider, returning default');
    return {
      socket: null,
      connected: false,
      messages: [],
      emit: () => {},
      on: () => {},
      off: () => {}
    };
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth(); // ✅ Now works correctly
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocket(null);
    setConnected(false);
    isConnectingRef.current = false;
  }, []);

  const connect = useCallback(async () => {
    if (!isAuthenticated || !token) {
      console.log('ℹ️ WebSocket: Waiting for user to login...');
      return;
    }

    if (isConnectingRef.current) {
      console.log('ℹ️ WebSocket: Connection already in progress...');
      return;
    }

    const enableWebSocket = import.meta.env?.VITE_ENABLE_WEBSOCKET === 'true';
    
    if (!enableWebSocket) {
      console.log('ℹ️ WebSocket is disabled. Set VITE_ENABLE_WEBSOCKET=true to enable real-time features.');
      return;
    }

    const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5001';
    
    cleanup();
    isConnectingRef.current = true;
    
    try {
      const { io } = await import('socket.io-client');
      
     // Then in the io connection:
const newSocket = io(apiUrl, {
  auth: { token },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true,
  forceNew: true
});


      newSocket.on('connect', () => {
        console.log(`✅ WebSocket connected for user: ${user?.email || user?.name}`);
        setConnected(true);
        setReconnectAttempts(0);
        isConnectingRef.current = false;
      });

      newSocket.on('disconnect', (reason) => {
        console.log(`⚠️ WebSocket disconnected: ${reason}`);
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error.message);
        setConnected(false);
        isConnectingRef.current = false;
        setReconnectAttempts(prev => prev + 1);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
        setConnected(true);
        setReconnectAttempts(0);
      });

      newSocket.on('notification', (data) => {
        console.log('📢 New notification:', data);
        setMessages(prev => [...prev.slice(-49), { ...data, timestamp: new Date() }]);
      });

      newSocket.on('attendance_updated', (data) => {
        console.log('📋 Attendance updated:', data);
        setMessages(prev => [...prev.slice(-49), { type: 'attendance', data, timestamp: new Date() }]);
      });

      newSocket.on('schedule_updated', (data) => {
        console.log('📅 Schedule updated:', data);
        setMessages(prev => [...prev.slice(-49), { type: 'schedule', data, timestamp: new Date() }]);
      });

      newSocket.on('maintenance_updated', (data) => {
        console.log('🔧 Maintenance updated:', data);
        setMessages(prev => [...prev.slice(-49), { type: 'maintenance', data, timestamp: new Date() }]);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
      
    } catch (err) {
      console.error('❌ Failed to load socket.io-client:', err);
      isConnectingRef.current = false;
    }
  }, [isAuthenticated, token, user, cleanup]);

  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('🔐 User authenticated, connecting WebSocket...');
      connect();
    } else {
      if (socketRef.current) {
        console.log('🔴 User logged out, disconnecting WebSocket...');
        cleanup();
      }
    }
  }, [isAuthenticated, token, connect, cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const emit = useCallback((event, data) => {
    if (socketRef.current && connected) {
      socketRef.current.emit(event, data);
      console.log(`📤 Socket emitted: ${event}`, data);
    } else {
      console.warn(`⚠️ Socket not connected, cannot emit ${event}`);
    }
  }, [connected]);

  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  const value = {
    socket: socketRef.current,
    connected,
    messages,
    emit,
    on,
    off,
    reconnectAttempts
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;