// backend/utils/queue.js
const Queue = require('bull');
const redisConfig = require('../config/redis');
const logger = require('./logger');

// Queue names
const QUEUE_NAMES = {
  EMAIL: 'email-queue',
  NOTIFICATION: 'notification-queue',
  REPORT: 'report-queue',
  BACKUP: 'backup-queue',
  SYNC: 'sync-queue',
  REMINDER: 'reminder-queue',
  CLEANUP: 'cleanup-queue'
};

// Create queue instances
const queues = {};

for (const [key, name] of Object.entries(QUEUE_NAMES)) {
  queues[key] = new Queue(name, {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  });
}

// Queue event handlers
const setupQueueEvents = (queue, queueName) => {
  queue.on('completed', (job, result) => {
    logger.info(`${queueName} job ${job.id} completed`, { result });
  });

  queue.on('failed', (job, err) => {
    logger.error(`${queueName} job ${job.id} failed`, { error: err.message, stack: err.stack });
  });

  queue.on('stalled', (job) => {
    logger.warn(`${queueName} job ${job.id} stalled`);
  });

  queue.on('error', (err) => {
    logger.error(`${queueName} queue error:`, err);
  });
};

// Setup events for all queues
Object.entries(queues).forEach(([key, queue]) => {
  setupQueueEvents(queue, QUEUE_NAMES[key]);
});

// Add job to queue
const addJob = async (queueName, jobName, data, options = {}) => {
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }
  
  const job = await queue.add(jobName, data, {
    attempts: options.attempts || 3,
    delay: options.delay || 0,
    timeout: options.timeout || 30000,
    removeOnComplete: options.removeOnComplete || true,
    removeOnFail: options.removeOnFail || false,
    backoff: options.backoff || { type: 'exponential', delay: 1000 }
  });
  
  logger.info(`Job added to ${queueName}: ${jobName} (ID: ${job.id})`);
  return job;
};

// Get job status
const getJobStatus = async (queueName, jobId) => {
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }
  
  const job = await queue.getJob(jobId);
  if (!job) return null;
  
  const state = await job.getState();
  return {
    id: job.id,
    name: job.name,
    data: job.data,
    state,
    progress: job.progress(),
    attempts: job.attemptsMade,
    timestamp: job.timestamp,
    finishedOn: job.finishedOn,
    failedReason: job.failedReason
  };
};

// Get queue metrics
const getQueueMetrics = async (queueName) => {
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }
  
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount()
  ]);
  
  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed
  };
};

// Clean queue
const cleanQueue = async (queueName, gracePeriodMs = 5000) => {
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }
  
  await queue.clean(gracePeriodMs, 'completed');
  await queue.clean(gracePeriodMs, 'failed');
  logger.info(`Cleaned queue: ${queueName}`);
};

// Pause queue
const pauseQueue = async (queueName) => {
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }
  
  await queue.pause();
  logger.info(`Paused queue: ${queueName}`);
};

// Resume queue
const resumeQueue = async (queueName) => {
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }
  
  await queue.resume();
  logger.info(`Resumed queue: ${queueName}`);
};

// Empty queue
const emptyQueue = async (queueName) => {
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }
  
  await queue.empty();
  logger.info(`Emptied queue: ${queueName}`);
};

// Close all queues
const closeQueues = async () => {
  for (const [key, queue] of Object.entries(queues)) {
    await queue.close();
    logger.info(`Closed queue: ${QUEUE_NAMES[key]}`);
  }
};

// Get all queue metrics
const getAllQueueMetrics = async () => {
  const metrics = {};
  for (const [key, queue] of Object.entries(queues)) {
    metrics[QUEUE_NAMES[key]] = await getQueueMetrics(key);
  }
  return metrics;
};

module.exports = {
  QUEUE_NAMES,
  queues,
  addJob,
  getJobStatus,
  getQueueMetrics,
  getAllQueueMetrics,
  cleanQueue,
  pauseQueue,
  resumeQueue,
  emptyQueue,
  closeQueues
};