const Queue = require('bull');
const redisConfig = require('./redis');
require('dotenv').config();

// Queue names
const QUEUES = {
  EMAIL: 'email-queue',
  NOTIFICATION: 'notification-queue',
  REPORT: 'report-queue',
  BACKUP: 'backup-queue',
  SYNC: 'sync-queue'
};

// Create queues
const emailQueue = new Queue(QUEUES.EMAIL, { redis: redisConfig });
const notificationQueue = new Queue(QUEUES.NOTIFICATION, { redis: redisConfig });
const reportQueue = new Queue(QUEUES.REPORT, { redis: redisConfig });
const backupQueue = new Queue(QUEUES.BACKUP, { redis: redisConfig });
const syncQueue = new Queue(QUEUES.SYNC, { redis: redisConfig });

// Email queue processor
emailQueue.process(async (job) => {
  const { to, subject, html, attachments } = job.data;
  const { sendEmail } = require('./mail');
  
  try {
    const result = await sendEmail({ to, subject, html, attachments });
    return result;
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
});

// Notification queue processor
notificationQueue.process(async (job) => {
  const { userId, title, message, type } = job.data;
  
  // Store notification in database
  const { Notification } = require('../models');
  
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      read: false
    });
    
    // Emit socket event if available
    const { getIO } = require('../../socket');
    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit('notification', notification);
    }
    
    return { success: true, notification };
  } catch (error) {
    throw new Error(`Failed to send notification: ${error.message}`);
  }
});

// Report queue processor
reportQueue.process(async (job) => {
  const { reportType, filters, format, userId } = job.data;
  const { generateReport } = require('../services/reportService');
  
  try {
    const report = await generateReport(reportType, filters, format);
    return { success: true, report };
  } catch (error) {
    throw new Error(`Failed to generate report: ${error.message}`);
  }
});

// Backup queue processor
backupQueue.process(async (job) => {
  const { type } = job.data;
  const { performBackup } = require('../services/backupService');
  
  try {
    const backup = await performBackup(type);
    return { success: true, backup };
  } catch (error) {
    throw new Error(`Failed to perform backup: ${error.message}`);
  }
});

// Sync queue processor (for offline data)
syncQueue.process(async (job) => {
  const { syncType, data } = job.data;
  
  try {
    // Process sync based on type
    let result;
    switch (syncType) {
      case 'attendance':
        const { syncAttendance } = require('../services/attendanceService');
        result = await syncAttendance(data);
        break;
      case 'maintenance':
        const { syncMaintenance } = require('../services/maintenanceService');
        result = await syncMaintenance(data);
        break;
      default:
        throw new Error(`Unknown sync type: ${syncType}`);
    }
    
    return { success: true, result };
  } catch (error) {
    throw new Error(`Failed to sync data: ${error.message}`);
  }
});

// Queue event handlers
emailQueue.on('completed', (job, result) => {
  console.log(`✅ Email job ${job.id} completed`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`❌ Email job ${job.id} failed:`, err.message);
});

notificationQueue.on('completed', (job, result) => {
  console.log(`✅ Notification job ${job.id} completed`);
});

notificationQueue.on('failed', (job, err) => {
  console.error(`❌ Notification job ${job.id} failed:`, err.message);
});

// Graceful shutdown
const closeQueues = async () => {
  await emailQueue.close();
  await notificationQueue.close();
  await reportQueue.close();
  await backupQueue.close();
  await syncQueue.close();
  console.log('✅ All queues closed');
};

module.exports = {
  emailQueue,
  notificationQueue,
  reportQueue,
  backupQueue,
  syncQueue,
  QUEUES,
  closeQueues
};