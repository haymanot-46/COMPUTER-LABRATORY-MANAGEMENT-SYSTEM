import { ROLES, ROLE_GROUPS, ROUTES } from './routeConfig';

// Public Routes (no authentication required)
export const publicRoutes = [
  { path: ROUTES.LOGIN, exact: true },
  { path: ROUTES.REGISTER, exact: true },
  { path: ROUTES.FORGOT_PASSWORD, exact: true },
  { path: ROUTES.RESET_PASSWORD, exact: true },
  { path: ROUTES.VERIFY_EMAIL, exact: true }
];

// Dashboard Routes Configuration
export const dashboardRoutes = [
  { path: ROUTES.DASHBOARD, roles: ROLE_GROUPS.ALL },
  { path: ROUTES.ADMIN_DASHBOARD, roles: [ROLES.ADMIN] },
  { path: ROUTES.LAB_MANAGER_DASHBOARD, roles: [ROLES.LAB_MANAGER] },
  { path: ROUTES.TEACHER_DASHBOARD, roles: [ROLES.TEACHER] },
  { path: ROUTES.DEAN_DASHBOARD, roles: [ROLES.DEAN] },
  { path: ROUTES.STUDENT_DASHBOARD, roles: [ROLES.STUDENT] },
  { path: ROUTES.LAB_ASSISTANT_DASHBOARD, roles: [ROLES.LAB_ASSISTANT] },
  { path: ROUTES.ICT_DASHBOARD, roles: [ROLES.ICT] },
  { path: ROUTES.ASSET_DASHBOARD, roles: [ROLES.ASSET] }
];

// Schedule Routes Configuration
export const scheduleRoutes = [
  { path: ROUTES.BOOK_LAB, roles: [ROLES.TEACHER, ROLES.DEAN] },
  { path: ROUTES.MY_SCHEDULES, roles: [ROLES.TEACHER, ROLES.STUDENT, ROLES.DEAN] },
  { path: ROUTES.PENDING_APPROVALS, roles: [ROLES.LAB_MANAGER, ROLES.DEAN, ROLES.ICT] },
  { path: ROUTES.BATCH_SCHEDULE, roles: [ROLES.DEAN] },
  { path: ROUTES.SCHEDULE_CALENDAR, roles: [ROLES.TEACHER, ROLES.STUDENT, ROLES.LAB_MANAGER, ROLES.DEAN, ROLES.LAB_ASSISTANT] }
];

// Computer Routes Configuration
export const computerRoutes = [
  { path: ROUTES.COMPUTERS, roles: [ROLES.LAB_MANAGER, ROLES.ADMIN, ROLES.ICT, ROLES.LAB_ASSISTANT] },
  { path: ROUTES.COMPUTER_DETAIL, roles: [ROLES.LAB_MANAGER, ROLES.ADMIN, ROLES.ICT, ROLES.LAB_ASSISTANT] },
  { path: ROUTES.ADD_COMPUTER, roles: [ROLES.LAB_MANAGER, ROLES.ADMIN] },
  { path: ROUTES.COMPUTER_STATUS, roles: [ROLES.LAB_MANAGER, ROLES.ICT, ROLES.LAB_ASSISTANT] }
];

// Maintenance Routes Configuration
export const maintenanceRoutes = [
  { path: ROUTES.CREATE_REQUEST, roles: [ROLES.TEACHER, ROLES.STUDENT, ROLES.LAB_ASSISTANT] },
  { path: ROUTES.MAINTENANCE, roles: [ROLES.LAB_MANAGER, ROLES.ICT] },
  { path: ROUTES.REQUEST_DETAIL, roles: [ROLES.LAB_MANAGER, ROLES.ICT] },
  { path: ROUTES.MY_ASSIGNMENTS, roles: [ROLES.ICT] }
];

// Attendance Routes Configuration
export const attendanceRoutes = [
  { path: ROUTES.ATTENDANCE, roles: [ROLES.TEACHER, ROLES.LAB_ASSISTANT] },
  { path: ROUTES.MY_ATTENDANCE, roles: [ROLES.STUDENT] },
  { path: ROUTES.ATTENDANCE_REPORT, roles: [ROLES.TEACHER, ROLES.LAB_MANAGER, ROLES.DEAN] }
];

// Asset Routes Configuration
export const assetRoutes = [
  { path: ROUTES.EQUIPMENT, roles: [ROLES.ASSET, ROLES.LAB_MANAGER, ROLES.ADMIN, ROLES.LAB_ASSISTANT] },
  { path: ROUTES.REGISTER_EQUIPMENT, roles: [ROLES.ASSET] },
  { path: ROUTES.AUDIT, roles: [ROLES.ASSET] },
  { path: ROUTES.AUDIT_HISTORY, roles: [ROLES.ASSET, ROLES.ADMIN, ROLES.LAB_ASSISTANT] },
  { path: ROUTES.BORROW_EQUIPMENT, roles: [ROLES.Asset] } 
];

// User Routes Configuration
export const userRoutes = [
  { path: ROUTES.USERS, roles: [ROLES.ADMIN] },
  { path: ROUTES.PROFILE, roles: ROLE_GROUPS.ALL },
  { path: ROUTES.SETTINGS, roles: [ROLES.ADMIN] },
  { path: ROUTES.CHANGE_PASSWORD, roles: ROLE_GROUPS.ALL }
];

// Report Routes Configuration
export const reportRoutes = [
  { path: ROUTES.REPORTS, roles: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.DEAN] },
  { path: ROUTES.SCHEDULED_REPORTS, roles: [ROLES.ADMIN] }
];

// Combine all route groups
export const allRouteGroups = {
  publicRoutes,
  dashboardRoutes,
  scheduleRoutes,
  computerRoutes,
  maintenanceRoutes,
  attendanceRoutes,
  assetRoutes,
  userRoutes,
  reportRoutes
};

export default allRouteGroups;