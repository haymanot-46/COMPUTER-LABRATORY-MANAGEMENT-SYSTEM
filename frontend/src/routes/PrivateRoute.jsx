import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from './routeConfig';

const PrivateRoute = ({ children, redirectTo = ROUTES.LOGIN }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsAuthenticated(false);
      setIsValidating(false);
      return;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp < Date.now() / 1000) {
        // Token expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error validating token:', error);
      setIsAuthenticated(false);
    }
    
    setIsValidating(false);
  }, []);

  if (isValidating) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default PrivateRoute;