// backend/utils/errorHandler.js
const logger = require('./logger');

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Not authorized') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database error occurred') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

// Handle Sequelize errors
const handleSequelizeError = (error) => {
  switch (error.name) {
    case 'SequelizeValidationError':
      return new ValidationError(
        'Validation error',
        error.errors.map(e => ({ field: e.path, message: e.message }))
      );
    case 'SequelizeUniqueConstraintError':
      return new ConflictError('Duplicate entry detected');
    case 'SequelizeForeignKeyConstraintError':
      return new AppError('Referenced record does not exist', 400, 'FOREIGN_KEY_ERROR');
    case 'SequelizeDatabaseError':
      return new DatabaseError(error.message);
    default:
      return error;
  }
};

// Handle JWT errors
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }
  return error;
};

// Handle Multer errors
const handleMulterError = (error) => {
  if (error.code === 'FILE_TOO_LARGE') {
    return new AppError('File too large. Maximum size is 20MB', 400, 'FILE_TOO_LARGE');
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Too many files uploaded', 400, 'TOO_MANY_FILES');
  }
  return new AppError(error.message, 400, 'UPLOAD_ERROR');
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  let error = err;
  
  // Log error
  logger.error('Error:', error);
  
  // Handle specific error types
  if (error.name && error.name.startsWith('Sequelize')) {
    error = handleSequelizeError(error);
  }
  
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    error = handleJWTError(error);
  }
  
  if (error.code && error.code.startsWith('LIMIT_')) {
    error = handleMulterError(error);
  }
  
  // Set default values
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  const errorCode = error.errorCode || 'INTERNAL_ERROR';
  
  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    errors: error.errors || null,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

// Async wrapper to avoid try-catch in controllers
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  errorHandler,
  catchAsync
};