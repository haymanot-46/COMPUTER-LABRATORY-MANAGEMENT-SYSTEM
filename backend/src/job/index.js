// backend/src/jobs/index.js
const logger = require('../utils/logger');

// Only initialize queues if Redis is available
let queues = {};
let isRedisAvailable = false;

try {
  // Check if Redis is configured
  if (process.env.REDIS_HOST && process.env.ENABLE_QUEUE === 'true') {
    const { queues: q, setupQueues } = require('../config/queue');
    queues = q;
    isRedisAvailable = true;
    setupQueues().catch(err => logger.warn('Queue setup failed:', err));
  } else {
    logger.info('Bull queues disabled (Redis not configured)');
  }
} catch (error) {
  logger.warn('Bull queues not available:', error.message);
}

// Export placeholder functions if queues not available
const addEmailJob = async (data, options = {}) => {
  if (!isRedisAvailable) {
    logger.info(`[MOCK] Email job would be added:`, data);
    return { id: Date.now(), data };
  }
  return await queues.EMAIL?.add('send-email', data, options);
};

const addNotificationJob = async (data, options = {}) => {
  if (!isRedisAvailable) {
    logger.info(`[MOCK] Notification job would be added:`, data);
    return { id: Date.now(), data };
  }
  return await queues.NOTIFICATION?.add('send-notification', data, options);
};

const addReportJob = async (data, options = {}) => {
  if (!isRedisAvailable) {
    logger.info(`[MOCK] Report job would be added:`, data);
    return { id: Date.now(), data };
  }
  return await queues.REPORT?.add('generate-report', data, options);
};

module.exports = {
  addEmailJob,
  addNotificationJob,
  addReportJob,
  isQueueAvailable: isRedisAvailable
};