// backend/config/constants.js
module.exports = {
  // User Roles
  ROLES: {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
    LAB_MANAGER: 'lab_manager',
    DEAN: 'dean',
    LAB_ASSISTANT: 'lab_assistant',
    ICT: 'ict',
    ASSET: 'asset'
  },
  
  // Computer Status
  COMPUTER_STATUS: {
    AVAILABLE: 'available',
    IN_USE: 'in-use',
    MAINTENANCE: 'maintenance',
    DAMAGED: 'damaged'
  },
  
  // Schedule Status
  SCHEDULE_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed'
  },
  
  // Maintenance Priority
  MAINTENANCE_PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },
  
  // Attendance Status
  ATTENDANCE_STATUS: {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late'
  },
  
  // Issue Types
  ISSUE_TYPES: {
    HARDWARE: 'hardware',
    SOFTWARE: 'software',
    NETWORK: 'network',
    PERIPHERAL: 'peripheral',
    OTHER: 'other'
  },
  
  // Equipment Categories
  EQUIPMENT_CATEGORIES: {
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
  },
  
  // Pagination
  DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
  MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE) || 100,
  
  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE_BYTES) || 20 * 1024 * 1024,
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,application/pdf').split(','),
  
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  },
  
  // Time Slots for Scheduling
  TIME_SLOTS: [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ],
  
  // Days of Week
  DAYS_OF_WEEK: [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ],
  
  // Laboratories
  LABORATORIES: [
    'Lab 101', 'Lab 102', 'Lab 103', 'Lab 104', 'Lab 105'
  ],
  
  // Ethiopian Academic Calendar (approximate)
  ACADEMIC_YEARS: {
    FIRST_SEMESTER: { start: '2026-09-15', end: '2027-01-30' },
    SECOND_SEMESTER: { start: '2027-02-15', end: '2027-06-30' }
  }
};