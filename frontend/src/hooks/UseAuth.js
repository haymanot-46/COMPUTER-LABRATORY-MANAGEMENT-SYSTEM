import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Return default values if context is not available (for testing or components outside provider)
  if (!context) {
    console.warn('useAuth must be used within AuthProvider, using default values');
    return {
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false,
      login: () => {},
      logout: () => {},
      updateUser: () => {}
    };
  }
  
  return context;
};

export default useAuth;