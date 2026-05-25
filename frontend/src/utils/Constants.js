// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'CLMS',
  VERSION: '2.0.0',
  COMPANY: 'Injibara University',
  COPYRIGHT_YEAR: new Date().getFullYear()
};

// User Roles - MATCH backend format (underscored)
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

// Role Groups
export const ROLE_GROUPS = {
  ALL: Object.values(ROLES),
  MANAGEMENT: [ROLES.ADMIN, ROLES.LAB_MANAGER, ROLES.DEAN],
  ACADEMIC: [ROLES.TEACHER, ROLES.STUDENT, ROLES.DEAN],
  TECHNICAL: [ROLES.ICT, ROLES.LAB_ASSISTANT],
  ASSET_TEAM: [ROLES.ASSET, ROLES.ADMIN],
  APPROVERS: [ROLES.LAB_MANAGER, ROLES.DEAN, ROLES.ADMIN]
};

// Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused'
};

// Equipment Status
export const EQUIPMENT_STATUS = {
  AVAILABLE: 'available',
  IN_USE: 'in-use',
  MAINTENANCE: 'maintenance',
  DAMAGED: 'damaged'
};

// Computer Status
export const COMPUTER_STATUS = {
  AVAILABLE: 'available',
  IN_USE: 'in-use',
  MAINTENANCE: 'maintenance',
  DAMAGED: 'damaged'
};

// Maintenance Priority
export const MAINTENANCE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Maintenance Status
export const MAINTENANCE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Schedule Status
export const SCHEDULE_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZES: [5, 10, 25, 50, 100]
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_TIME: 'MMM DD, YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_TIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm',
  TIME_12H: 'hh:mm A'
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  MAX_FILES: 5
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  PENDING_SYNC: 'pendingSync',
  OFFLINE_ATTENDANCE: 'offlineAttendance',
  NOTIFICATIONS: 'notifications'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
  SAVE_SUCCESS: 'Saved successfully!',
  DELETE_SUCCESS: 'Deleted successfully!',
  UPDATE_SUCCESS: 'Updated successfully!',
  CREATE_SUCCESS: 'Created successfully!'
};