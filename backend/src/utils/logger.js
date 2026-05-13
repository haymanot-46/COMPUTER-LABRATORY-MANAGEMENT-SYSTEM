// backend/utils/logger.js
const winston = require('winston');
const path = require('path');

const logDir = process.env.LOG_DIR || './logs';

// Custom format for console logging
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0 && meta.stack) {
      log += `\n${meta.stack}`;
    } else if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return log;
  })
);

// Custom format for file logging
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log')
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Log info message
const logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

// Log error message
const logError = (message, error = null) => {
  if (error) {
    logger.error(message, { error: error.message, stack: error.stack });
  } else {
    logger.error(message);
  }
};

// Log warning message
const logWarning = (message, meta = {}) => {
  logger.warn(message, meta);
};

// Log debug message
const logDebug = (message, meta = {}) => {
  logger.debug(message, meta);
};

// Log API request
const logRequest = (req, res, responseTime) => {
  const message = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms`;
  if (res.statusCode >= 500) {
    logError(message);
  } else if (res.statusCode >= 400) {
    logWarning(message);
  } else {
    logInfo(message);
  }
};

// Log database query
const logQuery = (sql, params, time) => {
  if (process.env.NODE_ENV === 'development') {
    logDebug(`SQL Query (${time}ms): ${sql}`, { params });
  }
};

// Log user action
const logUserAction = (userId, action, details = {}) => {
  logInfo(`User ${userId} performed: ${action}`, { userId, action, ...details });
};

// Log system event
const logSystemEvent = (event, details = {}) => {
  logInfo(`System event: ${event}`, { event, ...details });
};

module.exports = {
  logger,
  logInfo,
  logError,
  logWarning,
  logDebug,
  logRequest,
  logQuery,
  logUserAction,
  logSystemEvent
};