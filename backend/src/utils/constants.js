// backend/utils/constants.js

// User Roles
const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  LAB_MANAGER: 'lab_manager',
  DEAN: 'dean',
  LAB_ASSISTANT: 'lab_assistant',
  ICT: 'ict',
  ASSET: 'asset'
};

// Computer Status
const COMPUTER_STATUS = {
  AVAILABLE: 'available',
  IN_USE: 'in-use',
  MAINTENANCE: 'maintenance',
  DAMAGED: 'damaged'
};

// Schedule Status
const SCHEDULE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

// Maintenance Priority
const MAINTENANCE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Maintenance Status
const MAINTENANCE_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Attendance Status
const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late'
};

// Issue Types
const ISSUE_TYPES = {
  HARDWARE: 'hardware',
  SOFTWARE: 'software',
  NETWORK: 'network',
  PERIPHERAL: 'peripheral',
  OTHER: 'other'
};

// Equipment Categories
const EQUIPMENT_CATEGORIES = {
  COMPUTER: 'Computer',
  MONITOR: 'Monitor',
  UPS: 'UPS',
  PROJECTOR: 'Projector',
  PRINTER: 'Printer',
  NETWORK: 'Network',
  KEYBOARD: 'Keyboard',
  MOUSE: 'Mouse',
  FURNITURE: 'Furniture',
  SOFTWARE: 'Software',
  OTHER: 'Other'
};

// Equipment Condition
const EQUIPMENT_CONDITION = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
  DAMAGED: 'damaged'
};

// Equipment Status
const EQUIPMENT_STATUS = {
  AVAILABLE: 'available',
  BORROWED: 'borrowed',
  MAINTENANCE: 'maintenance',
  RETIRED: 'retired',
  LOST: 'lost'
};

// Notification Types
const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  REMINDER: 'reminder',
  ALERT: 'alert'
};

// Notification Priority
const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Recurring Types
const RECURRING_TYPES = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// File Upload Limits
const FILE_UPLOAD = {
  MAX_SIZE_MB: 20,
  MAX_SIZE_BYTES: 20 * 1024 * 1024,
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
};

// Time Slots
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

// Days of Week
const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

// Laboratories
const LABORATORIES = [
  'Lab 101', 'Lab 102', 'Lab 103', 'Lab 104', 'Lab 105'
];

// Cache TTL (seconds)
const CACHE_TTL = {
  SHORT: 60,      // 1 minute
  MEDIUM: 300,    // 5 minutes
  LONG: 3600,     // 1 hour
  DAY: 86400      // 24 hours
};

// Rate Limit Defaults
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
  MAX_REQUESTS: 100,
  AUTH_MAX_REQUESTS: 5,
  UPLOAD_MAX_REQUESTS: 50
};

// Date Formats
const DATE_FORMATS = {
  DEFAULT: 'YYYY-MM-DD',
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  API: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  TIME: 'HH:mm'
};

// Ethiopian Academic Calendar (approximate)
const ACADEMIC_CALENDAR = {
  FIRST_SEMESTER: { start: '2026-09-15', end: '2027-01-30' },
  SECOND_SEMESTER: { start: '2027-02-15', end: '2027-06-30' },
  SUMMER: { start: '2027-07-01', end: '2027-08-30' }
};

module.exports = {
  USER_ROLES,
  COMPUTER_STATUS,
  SCHEDULE_STATUS,
  MAINTENANCE_PRIORITY,
  MAINTENANCE_STATUS,
  ATTENDANCE_STATUS,
  ISSUE_TYPES,
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITION,
  EQUIPMENT_STATUS,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITY,
  RECURRING_TYPES,
  HTTP_STATUS,
  PAGINATION,
  FILE_UPLOAD,
  TIME_SLOTS,
  DAYS_OF_WEEK,
  LABORATORIES,
  CACHE_TTL,
  RATE_LIMIT,
  DATE_FORMATS,
  ACADEMIC_CALENDAR
};