// backend/middleware/logger.js
const morgan = require('morgan');
const logger = require('../config/logger');

// Morgan stream for Winston
const stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Skip logging for certain paths
const skip = (req) => {
  const skipPaths = ['/health', '/api/health', '/api/health/detailed'];
  return skipPaths.includes(req.path);
};

// Morgan middleware with custom format
const morganMiddleware = morgan(
  ':remote-addr - :method :url :status :response-time ms - :res[content-length]',
  { stream, skip }
);

// Custom request logger
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms - ${req.ip}`);
  });
  
  next();
};

// Error logger
const errorLogger = (err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  next(err);
};

// Database query logger (for development)
const queryLogger = (sql, timing) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`SQL Query (${timing}ms): ${sql}`);
  }
};

// API request logger with details
const apiLogger = (req, res, next) => {
  const start = Date.now();
  const { method, url, ip, headers } = req;
  const userAgent = headers['user-agent'];
  const userId = req.user?.id || 'anonymous';
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    
    logger.log(logLevel, `${method} ${url}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip,
      userId,
      userAgent
    });
  });
  
  next();
};

module.exports = {
  morganMiddleware,
  requestLogger,
  errorLogger,
  queryLogger,
  apiLogger
};