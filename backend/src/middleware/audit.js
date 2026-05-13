// backend/middleware/audit.js
const { AuditLog } = require('../models');
const logger = require('../config/logger');

// Audit log middleware
const auditLog = (action, entityType) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Store original send method
    const originalSend = res.json;
    
    res.json = function(data) {
      const responseTime = Date.now() - startTime;
      
      // Log audit entry (don't wait for DB)
      const auditEntry = {
        userId: req.user?.id,
        userEmail: req.user?.email,
        userRole: req.user?.role,
        action,
        entityType,
        entityId: req.params.id || req.body?.id,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        requestBody: sanitizeData(req.body),
        responseStatus: res.statusCode,
        responseTime,
        timestamp: new Date()
      };
      
      // Log to database asynchronously
      if (AuditLog) {
        AuditLog.create(auditEntry).catch(err => {
          logger.error('Audit log creation failed:', err);
        });
      }
      
      // Log to file
      logger.info('Audit', auditEntry);
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Sanitize sensitive data from logs
const sanitizeData = (data) => {
  if (!data) return null;
  
  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'currentPassword', 'newPassword', 'oldPassword'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }
  
  return sanitized;
};

// Login audit middleware
const loginAudit = async (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.json;
  
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    
    const auditEntry = {
      email: req.body.email,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: data?.success || false,
      responseTime,
      timestamp: new Date()
    };
    
    logger.info('Login attempt', auditEntry);
    
    originalSend.call(this, data);
  };
  
  next();
};

// Resource access audit
const resourceAccess = (resourceType) => {
  return async (req, res, next) => {
    logger.info('Resource access', {
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      resourceType,
      resourceId: req.params.id,
      action: req.method,
      timestamp: new Date()
    });
    next();
  };
};

// Bulk operation audit
const bulkOperationAudit = (operationType) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.json;
    
    res.json = function(data) {
      const responseTime = Date.now() - startTime;
      
      logger.info('Bulk operation', {
        userId: req.user?.id,
        userEmail: req.user?.email,
        operationType,
        affectedCount: data?.data?.length || 0,
        responseTime,
        timestamp: new Date()
      });
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Export audit data (for compliance)
const exportAuditLogs = async (req, res) => {
  try {
    const { startDate, endDate, userId, action } = req.query;
    let where = {};
    
    if (startDate && endDate) {
      where.timestamp = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    if (userId) where.userId = userId;
    if (action) where.action = action;
    
    const logs = await AuditLog.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: 1000
    });
    
    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  auditLog,
  loginAudit,
  resourceAccess,
  bulkOperationAudit,
  exportAuditLogs,
  sanitizeData
};