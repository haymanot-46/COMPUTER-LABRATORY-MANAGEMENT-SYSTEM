import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles, redirectTo = '/login' }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  let userRole = null;
  let userEmail = null;
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      userRole = user.role;
      userEmail = user.email;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
  }
  
  // Check if token is expired
  const isTokenValid = () => {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp < Date.now() / 1000) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
    
    return true;
  };
  
  if (!isTokenValid()) {
    console.log('ProtectedRoute: No valid token, redirecting to login');
    return <Navigate to={redirectTo} replace />;
  }
  
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.log(`ProtectedRoute: Access denied for ${userEmail} (role: ${userRole})`);
    console.log(`Required roles: ${allowedRoles.join(', ')}`);
    return <Navigate to={redirectTo} replace />;
  }
  
  return children;
};

// Helper hook for role checking in components
export const useRoleCheck = () => {
  const getUserRole = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.role;
      } catch (error) {
        return null;
      }
    }
    return null;
  };
  
  const getUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  };
  
  const hasRole = (allowedRoles) => {
    const userRole = getUserRole();
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return roles.includes(userRole);
  };
  
  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };
  
  return {
    getUserRole,
    getUser,
    hasRole,
    isAuthenticated,
    isAdmin: () => hasRole(['admin']),
    isTeacher: () => hasRole(['teacher']),
    isStudent: () => hasRole(['student']),
    isLabManager: () => hasRole(['lab-manager']),
    isDean: () => hasRole(['dean']),
    isLabAssistant: () => hasRole(['lab-assistant']),
    isICT: () => hasRole(['ict']),
    isAsset: () => hasRole(['asset'])
  };
};

export default ProtectedRoute;