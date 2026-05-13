// backend/middleware/roleCheck.js
const { User } = require('../models');
const logger = require('../config/logger');

// Role definitions with permissions
const ROLES = {
  admin: {
    name: 'Administrator',
    level: 100,
    permissions: ['all'],
    description: 'Full system access'
  },
  lab_manager: {
    name: 'Lab Manager',
    level: 80,
    permissions: [
      'manage_computers',
      'manage_schedules',
      'approve_schedules',
      'view_reports',
      'manage_maintenance',
      'view_equipment'
    ],
    description: 'Manages laboratory operations'
  },
  teacher: {
    name: 'Teacher',
    level: 70,
    permissions: [
      'book_lab',
      'take_attendance',
      'view_my_schedules',
      'report_issue',
      'view_attendance_report'
    ],
    description: 'Faculty member'
  },
  dean: {
    name: 'Dean',
    level: 90,
    permissions: [
      'view_all_schedules',
      'approve_schedules',
      'view_reports',
      'batch_schedule',
      'view_department_stats'
    ],
    description: 'Department Dean'
  },
  student: {
    name: 'Student',
    level: 10,
    permissions: [
      'view_my_schedules',
      'view_my_attendance',
      'report_issue',
      'borrow_equipment'
    ],
    description: 'Student user'
  },
  lab_assistant: {
    name: 'Lab Assistant',
    level: 50,
    permissions: [
      'take_attendance',
      'check_equipment',
      'report_issue',
      'view_schedules',
      'borrow_equipment'
    ],
    description: 'Laboratory assistant'
  },
  ict: {
    name: 'ICT Staff',
    level: 75,
    permissions: [
      'manage_computers',
      'manage_maintenance',
      'view_system_status',
      'update_computer_status',
      'view_equipment'
    ],
    description: 'ICT department staff'
  },
  asset: {
    name: 'Asset Manager',
    level: 75,
    permissions: [
      'manage_equipment',
      'view_equipment',
      'conduct_audit',
      'view_audit_history',
      'manage_warranty'
    ],
    description: 'Asset management team'
  }
};

// Permission definitions
const PERMISSIONS = {
  // Computer permissions
  manage_computers: ['admin', 'lab_manager', 'ict'],
  view_computers: ['admin', 'lab_manager', 'ict', 'teacher', 'lab_assistant'],
  update_computer_status: ['admin', 'lab_manager', 'ict'],
  
  // Schedule permissions
  manage_schedules: ['admin', 'lab_manager', 'dean'],
  book_lab: ['teacher', 'dean'],
  approve_schedules: ['admin', 'lab_manager', 'dean'],
  view_all_schedules: ['admin', 'lab_manager', 'dean', 'ict'],
  batch_schedule: ['dean'],
  
  // Attendance permissions
  take_attendance: ['teacher', 'lab_assistant'],
  view_attendance_report: ['teacher', 'lab_manager', 'dean'],
  view_my_attendance: ['student'],
  
  // Maintenance permissions
  manage_maintenance: ['admin', 'lab_manager', 'ict'],
  report_issue: ['teacher', 'student', 'lab_assistant'],
  assign_maintenance: ['admin', 'lab_manager'],
  
  // Equipment permissions
  manage_equipment: ['asset', 'admin'],
  view_equipment: ['asset', 'lab_manager', 'admin', 'lab_assistant'],
  borrow_equipment: ['lab_assistant', 'teacher', 'student'],
  conduct_audit: ['asset'],
  
  // Report permissions
  view_reports: ['admin', 'lab_manager', 'dean'],
  generate_reports: ['admin', 'lab_manager', 'dean'],
  
  // User permissions
  manage_users: ['admin'],
  view_users: ['admin', 'lab_manager', 'dean'],
  
  // System permissions
  system_settings: ['admin'],
  view_system_status: ['admin', 'ict'],
  view_logs: ['admin']
};

// Check if user has a specific permission
const hasPermission = (userRole, permission) => {
  if (userRole === 'admin') return true;
  
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(userRole);
};

// Middleware to check role
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(req.user.role)) {
      logger.warn(`Access denied: ${req.user.email} (${req.user.role}) tried to access ${req.originalUrl}`);
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    
    next();
  };
};

// Middleware to check permission
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    if (!hasPermission(req.user.role, permission)) {
      logger.warn(`Permission denied: ${req.user.email} (${req.user.role}) missing permission ${permission}`);
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permission}`,
        requiredPermission: permission,
        userRole: req.user.role
      });
    }
    
    next();
  };
};

// Middleware to check role level (higher or equal level)
const checkRoleLevel = (minLevel) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const userRoleInfo = ROLES[req.user.role];
    if (!userRoleInfo || userRoleInfo.level < minLevel) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required minimum level: ${minLevel}`,
        userLevel: userRoleInfo?.level || 0,
        requiredLevel: minLevel
      });
    }
    
    next();
  };
};

// Middleware to check if user owns the resource or has admin role
const checkOwnershipOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Admin has full access
    if (req.user.role === 'admin') {
      return next();
    }
    
    try {
      const resourceUserId = await getResourceUserId(req);
      
      if (req.user.id !== resourceUserId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this resource.'
        });
      }
      
      next();
    } catch (error) {
      logger.error('Check ownership error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
};

// Get role info
const getRoleInfo = (role) => {
  return ROLES[role] || null;
};

// Get user's permissions
const getUserPermissions = (role) => {
  if (role === 'admin') {
    // Admin has all permissions
    return Object.keys(PERMISSIONS);
  }
  
  const permissions = [];
  for (const [permission, roles] of Object.entries(PERMISSIONS)) {
    if (roles.includes(role)) {
      permissions.push(permission);
    }
  }
  return permissions;
};

// Middleware to check multiple conditions
const checkAccess = (conditions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const results = [];
    
    for (const condition of conditions) {
      let passed = false;
      
      if (condition.type === 'role') {
        passed = condition.roles.includes(req.user.role);
      } else if (condition.type === 'permission') {
        passed = hasPermission(req.user.role, condition.permission);
      } else if (condition.type === 'level') {
        const userLevel = ROLES[req.user.role]?.level || 0;
        passed = userLevel >= condition.minLevel;
      } else if (condition.type === 'owner' && condition.getResourceUserId) {
        try {
          const resourceUserId = await condition.getResourceUserId(req);
          passed = req.user.id === resourceUserId;
        } catch (error) {
          passed = false;
        }
      }
      
      results.push({ condition, passed });
      
      if (condition.required && !passed) {
        return res.status(403).json({
          success: false,
          message: condition.message || 'Access denied',
          checks: results
        });
      }
    }
    
    next();
  };
};

// Predefined role groups for common access patterns
const RoleGroups = {
  // Administrative access
  ADMIN_ONLY: ['admin'],
  MANAGEMENT: ['admin', 'lab_manager', 'dean'],
  
  // Academic access
  ACADEMIC_STAFF: ['teacher', 'dean'],
  ALL_STAFF: ['admin', 'lab_manager', 'teacher', 'dean', 'ict', 'asset', 'lab_assistant'],
  
  // Technical access
  TECHNICAL_STAFF: ['admin', 'ict', 'lab_assistant'],
  
  // Asset management
  ASSET_TEAM: ['admin', 'asset'],
  
  // General access
  ALL_AUTHENTICATED: ['admin', 'lab_manager', 'teacher', 'dean', 'student', 'ict', 'asset', 'lab_assistant'],
  
  // Student and faculty
  STUDENT_FACULTY: ['teacher', 'student', 'dean']
};

// Helper function to check if user can access resource based on role hierarchy
const canAccess = (userRole, resourceOwnerRole, resourceOwnerId, currentUserId) => {
  // Admin can access everything
  if (userRole === 'admin') return true;
  
  // User can access their own resources
  if (currentUserId === resourceOwnerId) return true;
  
  // Role hierarchy checks
  const userLevel = ROLES[userRole]?.level || 0;
  const ownerLevel = ROLES[resourceOwnerRole]?.level || 0;
  
  // Higher level roles can access lower level resources
  if (userLevel > ownerLevel) return true;
  
  // Teachers can access their students' data
  if (userRole === 'teacher' && resourceOwnerRole === 'student') return true;
  
  // Lab managers can access lab-related resources
  if (userRole === 'lab_manager' && ['teacher', 'student', 'lab_assistant'].includes(resourceOwnerRole)) return true;
  
  return false;
};

module.exports = {
  ROLES,
  PERMISSIONS,
  RoleGroups,
  checkRole,
  checkPermission,
  checkRoleLevel,
  checkOwnershipOrAdmin,
  checkAccess,
  hasPermission,
  getRoleInfo,
  getUserPermissions,
  canAccess
};