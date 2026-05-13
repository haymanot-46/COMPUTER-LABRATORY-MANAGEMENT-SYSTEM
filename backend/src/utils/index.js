// backend/utils/index.js
const constants = require('./constants');
const validators = require('./validators');
const formatters = require('./formatters');
const helpers = require('./helpers');
const logger = require('./logger');
const errorHandler = require('./errorHandler');

module.exports = {
  ...constants,
  ...validators,
  ...formatters,
  ...helpers,
  logger: logger.logger,
  logInfo: logger.logInfo,
  logError: logger.logError,
  logWarning: logger.logWarning,
  logDebug: logger.logDebug,
  logRequest: logger.logRequest,
  logUserAction: logger.logUserAction,
  logSystemEvent: logger.logSystemEvent,
  AppError: errorHandler.AppError,
  ValidationError: errorHandler.ValidationError,
  AuthenticationError: errorHandler.AuthenticationError,
  AuthorizationError: errorHandler.AuthorizationError,
  NotFoundError: errorHandler.NotFoundError,
  ConflictError: errorHandler.ConflictError,
  DatabaseError: errorHandler.DatabaseError,
  errorHandler: errorHandler.errorHandler,
  catchAsync: errorHandler.catchAsync
};