// frontend/src/routes/RoleBasedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES, ROLES } from './routeConfig';

const RoleBasedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = ROUTES.LOGIN,
  showWarning = true 
}) => {
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
  
  // Debug logging
  console.log('RoleBasedRoute Check:', {
    userRole,
    userEmail,
    allowedRoles,
    redirectTo
  });
  
  if (!userRole) {
    console.warn('No user role found, redirecting to login');
    return <Navigate to={redirectTo} replace />;
  }
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  // SUPER ADMIN can access ANY route
  if (userRole === ROLES.ADMIN) {
    console.log('✅ Admin access granted for route requiring:', roles);
    return children;
  }
  
  // DEAN can access routes that allow 'dean' OR 'admin' (for reports, department views)
  if (userRole === ROLES.DEAN) {
    const deanAccessible = roles.includes(ROLES.DEAN) || roles.includes(ROLES.ADMIN);
    if (deanAccessible) {
      console.log('✅ Dean access granted for route requiring:', roles);
      return children;
    } else {
      console.log('❌ Dean access denied for route requiring:', roles);
    }
  }
  
  // Regular role check for other users - ALSO check both hyphen and underscore versions
  if (roles.includes(userRole)) {
    return children;
  }
  
  // Also check with role mapping (for lab-manager vs lab_manager)
  const roleMap = {
    'lab-manager': 'lab_manager',
    'lab_manager': 'lab-manager',
    'lab-assistant': 'lab_assistant',
    'lab_assistant': 'lab-assistant'
  };
  
  const mappedRole = roleMap[userRole];
  if (mappedRole && roles.includes(mappedRole)) {
    console.log('✅ Role matched via mapping:', userRole, '->', mappedRole);
    return children;
  }
  
  // Access denied
  if (showWarning) {
    console.warn(
      `❌ Access denied for ${userEmail} (role: ${userRole}). ` +
      `Required roles: ${roles.join(', ')}`
    );
    
    // Redirect to role-appropriate dashboard - handle both formats
    const getDashboardPath = (role) => {
      // Normalize role format
      const normalizedRole = role === 'lab-manager' ? 'lab_manager' : 
                             role === 'lab-assistant' ? 'lab_assistant' : role;
      
      const dashboardMap = {
        [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
        [ROLES.TEACHER]: ROUTES.TEACHER_DASHBOARD,
        [ROLES.STUDENT]: ROUTES.STUDENT_DASHBOARD,
        [ROLES.LAB_MANAGER]: ROUTES.LAB_MANAGER_DASHBOARD,
        'lab_manager': ROUTES.LAB_MANAGER_DASHBOARD,
        'lab-manager': ROUTES.LAB_MANAGER_DASHBOARD,
        [ROLES.DEAN]: ROUTES.DEAN_DASHBOARD,
        [ROLES.LAB_ASSISTANT]: ROUTES.LAB_ASSISTANT_DASHBOARD,
        'lab_assistant': ROUTES.LAB_ASSISTANT_DASHBOARD,
        'lab-assistant': ROUTES.LAB_ASSISTANT_DASHBOARD,
        [ROLES.ICT]: ROUTES.ICT_DASHBOARD,
        [ROLES.ASSET]: ROUTES.ASSET_DASHBOARD
      };
      return dashboardMap[normalizedRole] || dashboardMap[role] || ROUTES.DASHBOARD;
    };
    
    const dashboardPath = getDashboardPath(userRole);
    return <Navigate to={dashboardPath} replace />;
  }
  
  return <Navigate to={redirectTo} replace />;
};

// Helper hook for role checking
export const useRoleCheck = () => {
  const getUserRole = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.role;
      } catch (error) {
        console.error('Error parsing user:', error);
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
    
    if (!userRole) return false;
    if (userRole === ROLES.ADMIN) return true;
    if (userRole === ROLES.DEAN && roles.includes(ROLES.ADMIN)) return true;
    
    // Check direct match
    if (roles.includes(userRole)) return true;
    
    // Check mapped match (for hyphen/underscore differences)
    const roleMap = {
      'lab-manager': 'lab_manager',
      'lab_manager': 'lab-manager',
      'lab-assistant': 'lab_assistant',
      'lab_assistant': 'lab-assistant'
    };
    const mappedRole = roleMap[userRole];
    if (mappedRole && roles.includes(mappedRole)) return true;
    
    return false;
  };
  
  return {
    getUserRole,
    getUser,
    hasRole,
    isAdmin: () => hasRole([ROLES.ADMIN]),
    isTeacher: () => hasRole([ROLES.TEACHER]),
    isStudent: () => hasRole([ROLES.STUDENT]),
    isLabManager: () => hasRole([ROLES.LAB_MANAGER, 'lab_manager', 'lab-manager']),
    isDean: () => hasRole([ROLES.DEAN]),
    isLabAssistant: () => hasRole([ROLES.LAB_ASSISTANT, 'lab_assistant', 'lab-assistant']),
    isICT: () => hasRole([ROLES.ICT]),
    isAsset: () => hasRole([ROLES.ASSET])
  };
};

export default RoleBasedRoute;