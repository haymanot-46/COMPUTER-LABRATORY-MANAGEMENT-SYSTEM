// Role Constants - MUST match backend
export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  LAB_MANAGER: 'lab_manager',
  DEAN: 'dean',
  LAB_ASSISTANT: 'lab_assistant',
  ICT: 'ict',
  ASSET: 'asset'
};

// All roles array (for universally accessible routes)
export const ALL_ROLES = Object.values(ROLES);

// Role Groups
export const ROLE_GROUPS = {
  ALL: Object.values(ROLES),
  MANAGEMENT: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.DEAN],
  ACADEMIC: [ROLES.TEACHER, ROLES.STUDENT, ROLES.DEAN],
  TECHNICAL: [ROLES.ICT, ROLES.LAB_ASSISTANT],
  ASSET_TEAM: [ROLES.ASSET, ROLES.ADMIN],
  APPROVERS: [ROLES.LAB_MANAGER, ROLES.DEAN, ROLES.ADMIN],
  TEACHING_STAFF: [ROLES.TEACHER, ROLES.LAB_ASSISTANT],
  ATTENDANCE_MARKERS: [ROLES.TEACHER, ROLES.LAB_ASSISTANT],
  TECHNICIANS: [ROLES.ICT, ROLES.LAB_ASSISTANT]
};

// Route Paths
export const ROUTES = {
  // Public Routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  VERIFY_EMAIL: '/verify-email/:token',
  
  // Dashboard Routes (SRS Section 3.10.3)
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/dashboard/admin',
  LAB_MANAGER_DASHBOARD: '/dashboard/lab-manager',
  TEACHER_DASHBOARD: '/dashboard/teacher',
  DEAN_DASHBOARD: '/dashboard/dean',
  STUDENT_DASHBOARD: '/dashboard/student',
  LAB_ASSISTANT_DASHBOARD: '/dashboard/lab-assistant',
  ICT_DASHBOARD: '/dashboard/ict',
  ASSET_DASHBOARD: '/dashboard/asset',
  
  // Schedule Routes
  BOOK_LAB: '/book-lab',
  MY_SCHEDULES: '/my-schedules',
  PENDING_APPROVALS: '/pending-approvals',
  BATCH_SCHEDULE: '/batch-schedule',
  SCHEDULE_CALENDAR: '/schedule-calendar',
  
  // Computer Routes
  COMPUTERS: '/computers',
  COMPUTER_DETAIL: '/computer/:id',
  ADD_COMPUTER: '/add-computer',
  COMPUTER_STATUS: '/computer-status',
  
  // Maintenance Routes
  CREATE_REQUEST: '/create-request',
  MAINTENANCE: '/maintenance',
  REQUEST_DETAIL: '/request/:id',
  MY_ASSIGNMENTS: '/my-assignments',
  
   // ATTENDANCE ROUTES
    ATTENDANCE: '/attendance',
    ATTENDANCE_SESSION: '/attendance/session/:sessionId',
    TAKE_ATTENDANCE: '/attendance/take/:scheduleId',
    MY_ATTENDANCE: '/my-attendance',
    ATTENDANCE_REPORT: '/attendance/report',
    ATTENDANCE_SUMMARY: '/attendance/summary',
    
    // LAB ASSISTANT ATTENDANCE
    LAB_ASSISTANT_ATTENDANCE: '/lab-assistant/attendance',
    ASSIGNED_SESSIONS: '/lab-assistant/sessions',
  
  // Asset Routes
   ASSET_EQUIPMENT: '/asset/equipment',
  ASSET_REGISTER_EQUIPMENT: '/asset/register-equipment',
  ASSET_AUDITS: '/asset/audits',
  ASSET_BORROW: '/asset/borrow',
  EQUIPMENT: '/equipment',
  REGISTER_EQUIPMENT: '/equipment/register',
  AUDIT: '/audit',
  AUDIT_HISTORY: '/audit-history',
  BORROW_EQUIPMENT: '/equipment/borrow',
  ASSET_MATERIAL_REQUESTS: '/asset/material-requests',
  ASSET_REPORTS: '/asset-reports',
  // User Routes
  USERS: '/users',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  CHANGE_PASSWORD: '/change-password',
  
  // Report Routes
  REPORTS: '/reports',
  SCHEDULED_REPORTS: '/scheduled-reports',
  
  NOT_FOUND: '/404'
};

export default { ROLES, ALL_ROLES, ROLE_GROUPS, ROUTES };