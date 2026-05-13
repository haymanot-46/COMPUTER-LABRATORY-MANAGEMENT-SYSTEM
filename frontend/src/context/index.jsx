// frontend/src/context/index.jsx
import React from 'react';
import { AuthProvider, useAuth, AuthContext } from './AuthContext';
import { ThemeProvider, useTheme, ThemeContext } from './ThemeContext';
import { NotificationProvider, useNotification, NotificationContext } from './NotificationContext';
import { OfflineProvider, useOffline, OfflineContext } from './OfflineContext';
import { SocketProvider, useSocket, SocketContext } from './SocketContext';

// Main AppProviders component
export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <OfflineProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </OfflineProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

// Re-export all providers and hooks
export { 
  AuthProvider, 
  useAuth, 
  AuthContext 
};

export { 
  ThemeProvider, 
  useTheme, 
  ThemeContext 
};

export { 
  NotificationProvider, 
  useNotification, 
  NotificationContext 
};

export { 
  OfflineProvider, 
  useOffline, 
  OfflineContext 
};

export { 
  SocketProvider, 
  useSocket, 
  SocketContext 
};

export default AppProviders;