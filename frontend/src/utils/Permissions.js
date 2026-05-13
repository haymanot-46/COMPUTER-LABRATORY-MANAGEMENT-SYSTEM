import { ROLES, ROLE_GROUPS } from './constants';

// Permission definitions
export const PERMISSIONS = {
  // User permissions
  VIEW_USERS: ['admin'],
  CREATE_USER: ['admin'],
  EDIT_USER: ['admin'],
  DELETE_USER: ['admin'],
  
  // Computer permissions
  VIEW_COMPUTERS: ROLE_GROUPS.MANAGEMENT,
  CREATE_COMPUTER: ['admin', 'lab-manager'],
  EDIT_COMPUTER: ['admin', 'lab-manager'],
  DELETE_COMPUTER: ['admin', 'lab-manager'],
  UPDATE_COMPUTER_STATUS: ['admin', 'lab-manager', 'ict'],
  
  // Schedule permissions
  VIEW_SCHEDULES: ROLE_GROUPS.ALL,
  CREATE_SCHEDULE: ['teacher', 'dean'],
  EDIT_SCHEDULE: ['teacher', 'lab-manager'],
  DELETE_SCHEDULE: ['admin', 'lab-manager'],
  APPROVE_SCHEDULE: ['lab-manager', 'dean'],
  
  // Attendance permissions
  MARK_ATTENDANCE: ['teacher', 'lab-assistant'],
  VIEW_ATTENDANCE: ROLE_GROUPS.ALL,
  EDIT_ATTENDANCE: ['teacher'],
  EXPORT_ATTENDANCE: ['teacher', 'lab-manager', 'dean'],
  
  // Maintenance permissions
  CREATE_MAINTENANCE_REQUEST: ['teacher', 'student', 'lab-assistant'],
  VIEW_MAINTENANCE_REQUESTS: ROLE_GROUPS.MANAGEMENT,
  ASSIGN_MAINTENANCE: ['lab-manager', 'ict'],
  COMPLETE_MAINTENANCE: ['ict'],
  
  // Asset permissions
  VIEW_EQUIPMENT: ['asset', 'lab-manager', 'admin'],
  CREATE_EQUIPMENT: ['asset'],
  EDIT_EQUIPMENT: ['asset'],
  DELETE_EQUIPMENT: ['asset'],
  PERFORM_AUDIT: ['asset'],
  
  // Report permissions
  VIEW_REPORTS: ['admin', 'lab-manager', 'dean'],
  GENERATE_REPORT: ['admin', 'lab-manager', 'dean'],
  EXPORT_REPORT: ['admin', 'lab-manager', 'dean'],
  SCHEDULE_REPORT: ['admin'],
  
  // Settings permissions
  VIEW_SETTINGS: ['admin'],
  EDIT_SETTINGS: ['admin']
};

// Check if user has permission
export const hasPermission = (userRole, permission) => {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole);
};

// Check if user has any of the permissions
export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

// Check if user has all permissions
export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

// Get user's accessible modules
export const getAccessibleModules = (userRole) => {
  const modules = [];
  
  for (const [permission, roles] of Object.entries(PERMISSIONS)) {
    if (roles.includes(userRole)) {
      const module = permission.split('_')[1];
      if (!modules.includes(module)) {
        modules.push(module);
      }
    }
  }
  
  return modules;
};

// Role-based menu items
export const getMenuItems = (userRole) => {
  const menus = {
    [ROLES.ADMIN]: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/users', label: 'Users', icon: '👥' },
      { path: '/computers', label: 'Computers', icon: '🖥️' },
      { path: '/schedule-calendar', label: 'Schedules', icon: '📅' },
      { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
      { path: '/equipment', label: 'Assets', icon: '📦' },
      { path: '/reports', label: 'Reports', icon: '📊' },
      { path: '/settings', label: 'Settings', icon: '⚙️' }
    ],
    [ROLES.TEACHER]: [
      { path: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/schedule-calendar', label: 'My Schedule', icon: '📅' },
      { path: '/attendance-report', label: 'Attendance', icon: '📝' },
      { path: '/book-lab', label: 'Book Lab', icon: '📖' },
      { path: '/create-request', label: 'Report Issue', icon: '🔧' }
    ],
    [ROLES.STUDENT]: [
      { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/my-schedules', label: 'My Schedule', icon: '📅' },
      { path: '/my-attendance', label: 'My Attendance', icon: '📝' },
      { path: '/create-request', label: 'Report Issue', icon: '🔧' }
    ],
    [ROLES.LAB_MANAGER]: [
      { path: '/lab-manager/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/schedule-calendar', label: 'Schedules', icon: '📅' },
      { path: '/computers', label: 'Computers', icon: '🖥️' },
      { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
      { path: '/equipment', label: 'Assets', icon: '📦' },
      { path: '/pending-approvals', label: 'Approvals', icon: '⏳' }
    ],
    [ROLES.DEAN]: [
      { path: '/dean/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/schedule-calendar', label: 'Schedules', icon: '📅' },
      { path: '/reports', label: 'Reports', icon: '📊' },
      { path: '/batch-schedule', label: 'Batch Schedule', icon: '📦' }
    ],
    [ROLES.ICT]: [
      { path: '/ict/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/computers', label: 'Computers', icon: '🖥️' },
      { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
      { path: '/my-assignments', label: 'My Assignments', icon: '📋' },
      { path: '/computer-status', label: 'Status', icon: '📊' }
    ],
    [ROLES.ASSET]: [
      { path: '/asset/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/equipment', label: 'Equipment', icon: '📦' },
      { path: '/audit-history', label: 'Audits', icon: '📋' },
      { path: '/reports', label: 'Reports', icon: '📊' }
    ],
    [ROLES.LAB_ASSISTANT]: [
      { path: '/lab-assistant/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/attendance', label: 'Attendance', icon: '📝' },
      { path: '/equipment', label: 'Equipment', icon: '📦' },
      { path: '/create-request', label: 'Report Issue', icon: '🔧' }
    ]
  };
  
  return menus[userRole] || [];
};