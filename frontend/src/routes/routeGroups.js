import { ROLES, ALL_ROLES, ROLE_GROUPS, ROUTES } from './routeConfig';

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
  { path: ROUTES.BOOK_LAB, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.DEAN] },
  { path: ROUTES.MY_SCHEDULES, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.DEAN] },
  { path: ROUTES.PENDING_APPROVALS, roles: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.DEAN] },
  { path: ROUTES.BATCH_SCHEDULE, roles: [ROLES.DEAN] },
  { path: ROUTES.SCHEDULE_CALENDAR, roles: ALL_ROLES }
];

// Computer Routes Configuration
export const computerRoutes = [
  { path: ROUTES.COMPUTERS, roles: ALL_ROLES },
  { path: ROUTES.COMPUTER_DETAIL, roles: ALL_ROLES },
  { path: ROUTES.ADD_COMPUTER, roles: [ROLES.ADMIN, ROLES.LAB_MANAGER] },
  { path: ROUTES.COMPUTER_STATUS, roles: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.ICT, ROLES.LAB_ASSISTANT, ROLES.ASSET] }
];

// Maintenance Routes Configuration
export const maintenanceRoutes = [
  { path: ROUTES.CREATE_REQUEST, roles: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.TEACHER, ROLES.STUDENT, ROLES.LAB_ASSISTANT, ROLES.ICT] },
  { path: ROUTES.MAINTENANCE, roles: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.ICT] },
  { path: ROUTES.REQUEST_DETAIL, roles: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.ICT] },
  { path: ROUTES.MY_ASSIGNMENTS, roles: [ROLES.ICT] }
];

// Attendance Routes Configuration
export const attendanceRoutes = [
  { path: ROUTES.ATTENDANCE, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.LAB_MANAGER, ROLES.DEAN, ROLES.STUDENT, ROLES.LAB_ASSISTANT] },
  { path: ROUTES.MY_ATTENDANCE, roles: [ROLES.STUDENT] },
  { path: ROUTES.ATTENDANCE_REPORT, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.LAB_MANAGER, ROLES.DEAN, ROLES.STUDENT] }
];

// Asset Routes Configuration
export const assetRoutes = [
  { path: ROUTES.EQUIPMENT, roles: [ROLES.ASSET, ROLES.ADMIN, ROLES.LAB_ASSISTANT] },
  { path: ROUTES.REGISTER_EQUIPMENT, roles: [ROLES.ASSET] },
  { path: ROUTES.AUDIT, roles: [ROLES.ADMIN, ROLES.ASSET, ROLES.LAB_ASSISTANT] },
  { path: ROUTES.AUDIT_HISTORY, roles: [ROLES.ASSET, ROLES.ADMIN, ROLES.LAB_ASSISTANT] },
  { path: ROUTES.BORROW_EQUIPMENT, roles: [ROLES.ASSET] } 
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
  { path: ROUTES.REPORTS, roles: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.TEACHER, ROLES.DEAN, ROLES.STUDENT] },
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