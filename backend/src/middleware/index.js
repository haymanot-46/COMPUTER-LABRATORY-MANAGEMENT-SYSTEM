// backend/middleware/index.js
const auth = require('./auth');
const roleCheck = require('./roleCheck');
const validation = require('./validation');
const errorHandler = require('./errorHandler');
const logger = require('./logger');
const audit = require('./audit');

module.exports = {
  // Auth middleware
  protect: auth.protect,
  authorize: auth.authorize,
  checkOwnership: auth.checkOwnership,
  
  // Role check middleware
  checkRole: roleCheck.checkRole,
  checkPermission: roleCheck.checkPermission,
  checkRoleLevel: roleCheck.checkRoleLevel,
  checkOwnershipOrAdmin: roleCheck.checkOwnershipOrAdmin,
  checkAccess: roleCheck.checkAccess,
  hasPermission: roleCheck.hasPermission,
  getRoleInfo: roleCheck.getRoleInfo,
  getUserPermissions: roleCheck.getUserPermissions,
  canAccess: roleCheck.canAccess,
  ROLES: roleCheck.ROLES,
  PERMISSIONS: roleCheck.PERMISSIONS,
  RoleGroups: roleCheck.RoleGroups,
  
  // Validation middleware
  userValidation: validation.userValidation,
  computerValidation: validation.computerValidation,
  scheduleValidation: validation.scheduleValidation,
  maintenanceValidation: validation.maintenanceValidation,
  attendanceValidation: validation.attendanceValidation,
  equipmentValidation: validation.equipmentValidation,
  idValidation: validation.idValidation,
  paginationValidation: validation.paginationValidation,
  dateRangeValidation: validation.dateRangeValidation,
  
  // Error handling
  notFound: errorHandler.notFound,
  errorHandler: errorHandler.errorHandler,
  asyncHandler: errorHandler.asyncHandler,
  
  // Logger middleware
  morganMiddleware: logger.morganMiddleware,
  requestLogger: logger.requestLogger,
  errorLogger: logger.errorLogger,
  apiLogger: logger.apiLogger,
  
  // Audit middleware
  auditLog: audit.auditLog,
  loginAudit: audit.loginAudit,
  resourceAccess: audit.resourceAccess,
  bulkOperationAudit: audit.bulkOperationAudit
};