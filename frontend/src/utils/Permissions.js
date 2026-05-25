import { ROLES } from './Constants';

// All 8 actor roles for universal access
const ALL_ACTORS = Object.values(ROLES);

// Permission definitions based on SRS Section 2.3.10 Permission Matrix
export const PERMISSIONS = {
  // User permissions (SRS: Only Admin)
  VIEW_USERS: [ROLES.ADMIN],
  CREATE_USER: [ROLES.ADMIN],
  EDIT_USER: [ROLES.ADMIN],
  DELETE_USER: [ROLES.ADMIN],
  
  // Computer permissions (SRS: View = ALL 8 roles, Update = Admin, Lab Manager, Lab Assistant, ICT, Asset)
  VIEW_COMPUTERS: ALL_ACTORS,
  CREATE_COMPUTER: [ROLES.ADMIN, ROLES.LAB_MANAGER],
  EDIT_COMPUTER: [ROLES.ADMIN, ROLES.LAB_MANAGER],
  DELETE_COMPUTER: [ROLES.ADMIN, ROLES.LAB_MANAGER],
  UPDATE_COMPUTER_STATUS: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.LAB_ASSISTANT, ROLES.ICT, ROLES.ASSET],
  
  // Schedule permissions (SRS: Request = Admin, Teacher, Dean | Approve = Admin, Lab Manager, Dean)
  VIEW_SCHEDULES: ALL_ACTORS,
  CREATE_SCHEDULE: [ROLES.ADMIN, ROLES.TEACHER, ROLES.DEAN],
  EDIT_SCHEDULE: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.DEAN],
  DELETE_SCHEDULE: [ROLES.ADMIN, ROLES.LAB_MANAGER],
  APPROVE_SCHEDULE: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.DEAN],
  
  // Attendance permissions (SRS: Mark = Admin, Teacher, Lab Assistant | View = Admin, Lab Manager, Teacher, Dean, Student, Lab Assistant)
  MARK_ATTENDANCE: [ROLES.ADMIN, ROLES.TEACHER, ROLES.LAB_ASSISTANT],
  VIEW_ATTENDANCE: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.TEACHER, ROLES.DEAN, ROLES.STUDENT, ROLES.LAB_ASSISTANT],
  EDIT_ATTENDANCE: [ROLES.ADMIN, ROLES.TEACHER],
  EXPORT_ATTENDANCE: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.TEACHER, ROLES.DEAN, ROLES.STUDENT],
  
  // Maintenance permissions (SRS: Request = Admin, Lab Manager, Teacher, Student, Lab Assistant, ICT)
  // (SRS: Assign = Admin, Lab Manager, ICT | Complete = Admin, Lab Manager, ICT)
  CREATE_MAINTENANCE_REQUEST: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.TEACHER, ROLES.STUDENT, ROLES.LAB_ASSISTANT, ROLES.ICT],
  VIEW_MAINTENANCE_REQUESTS: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.ICT],
  ASSIGN_MAINTENANCE: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.ICT],
  COMPLETE_MAINTENANCE: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.ICT],
  
  // Asset permissions (SRS: Register/Assign/Dispose = Admin, Asset | Audit = Admin, Lab Assistant, Asset)
  VIEW_EQUIPMENT: [ROLES.ADMIN, ROLES.ASSET, ROLES.LAB_ASSISTANT],
  CREATE_EQUIPMENT: [ROLES.ADMIN, ROLES.ASSET],
  EDIT_EQUIPMENT: [ROLES.ADMIN, ROLES.ASSET],
  DELETE_EQUIPMENT: [ROLES.ADMIN, ROLES.ASSET],
  PERFORM_AUDIT: [ROLES.ADMIN, ROLES.ASSET, ROLES.LAB_ASSISTANT],
  
  // Report permissions (SRS: General = Admin, Lab Manager, Teacher, Dean, Student)
  // (SRS: Asset Report = Admin, Asset | Maintenance Report = Admin, Lab Manager, ICT)
  VIEW_REPORTS: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.TEACHER, ROLES.DEAN, ROLES.STUDENT],
  GENERATE_REPORT: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.TEACHER, ROLES.DEAN, ROLES.STUDENT],
  EXPORT_REPORT: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.TEACHER, ROLES.DEAN, ROLES.STUDENT],
  SCHEDULE_REPORT: [ROLES.ADMIN],
  
  // Asset-specific reports (SRS: Only Admin and Asset)
  VIEW_ASSET_REPORTS: [ROLES.ADMIN, ROLES.ASSET],
  
  // Maintenance-specific reports (SRS: Admin, Lab Manager, ICT)
  VIEW_MAINTENANCE_REPORTS: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.ICT],
  
  // Settings permissions (SRS: Only Admin)
  VIEW_SETTINGS: [ROLES.ADMIN],
  EDIT_SETTINGS: [ROLES.ADMIN],
  
  // System/Audit (SRS: Only Admin)
  VIEW_AUDIT_LOGS: [ROLES.ADMIN],
  SYSTEM_CONFIG: [ROLES.ADMIN]
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
      { path: '/dashboard/admin', label: 'Dashboard', icon: '📊' },
      { path: '/users', label: 'Users', icon: '👥' },
      { path: '/computers', label: 'Computers', icon: '🖥️' },
      { path: '/schedule-calendar', label: 'Schedules', icon: '📅' },
      { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
      { path: '/equipment', label: 'Assets', icon: '📦' },
      { path: '/reports', label: 'Reports', icon: '📊' },
      { path: '/settings', label: 'Settings', icon: '⚙️' }
    ],
    [ROLES.TEACHER]: [
      { path: '/dashboard/teacher', label: 'Dashboard', icon: '📊' },
      { path: '/schedule-calendar', label: 'My Schedule', icon: '📅' },
      { path: '/attendance-report', label: 'Attendance', icon: '📝' },
      { path: '/book-lab', label: 'Book Lab', icon: '📖' },
      { path: '/create-request', label: 'Report Issue', icon: '🔧' }
    ],
    [ROLES.STUDENT]: [
      { path: '/dashboard/student', label: 'Dashboard', icon: '📊' },
      { path: '/my-schedules', label: 'My Schedule', icon: '📅' },
      { path: '/my-attendance', label: 'My Attendance', icon: '📝' },
      { path: '/create-request', label: 'Report Issue', icon: '🔧' }
    ],
    [ROLES.LAB_MANAGER]: [
      { path: '/dashboard/lab-manager', label: 'Dashboard', icon: '📊' },
      { path: '/schedule-calendar', label: 'Schedules', icon: '📅' },
      { path: '/computers', label: 'Computers', icon: '🖥️' },
      { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
      { path: '/pending-approvals', label: 'Approvals', icon: '⏳' }
    ],
    [ROLES.DEAN]: [
      { path: '/dashboard/dean', label: 'Dashboard', icon: '📊' },
      { path: '/schedule-calendar', label: 'Schedules', icon: '📅' },
      { path: '/reports', label: 'Reports', icon: '📊' },
      { path: '/batch-schedule', label: 'Batch Schedule', icon: '📦' }
    ],
    [ROLES.ICT]: [
      { path: '/dashboard/ict', label: 'Dashboard', icon: '📊' },
      { path: '/computers', label: 'Computers', icon: '🖥️' },
      { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
      { path: '/my-assignments', label: 'My Assignments', icon: '📋' },
      { path: '/computer-status', label: 'Status', icon: '📊' },
      { path: '/ict/reports', label: 'Reports', icon: '📊' }
    ],
    [ROLES.ASSET]: [
      { path: '/dashboard/asset', label: 'Dashboard', icon: '📊' },
      { path: '/equipment', label: 'Equipment', icon: '📦' },
      { path: '/audit-history', label: 'Audits', icon: '📋' },
      { path: '/reports', label: 'Reports', icon: '📊' }
    ],
    [ROLES.LAB_ASSISTANT]: [
      { path: '/dashboard/lab-assistant', label: 'Dashboard', icon: '📊' },
      { path: '/attendance', label: 'Attendance', icon: '📝' },
      { path: '/equipment', label: 'Equipment', icon: '📦' },
      { path: '/create-request', label: 'Report Issue', icon: '🔧' }
    ]
  };
  
  return menus[userRole] || [];
};