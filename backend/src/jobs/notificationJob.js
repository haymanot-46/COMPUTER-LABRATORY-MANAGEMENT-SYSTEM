const { notificationQueue } = require('../config/queue');
const { getIO } = require('../../socket');
const logger = require('../config/logger');

// In-memory notification store (use Redis in production)
const notifications = [];

// Process notification queue
notificationQueue.process(async (job) => {
  const { userId, title, message, type, priority } = job.data;
  logger.info(`Processing notification job for user ${userId}`);
  
  try {
    // Store notification in memory (or database)
    const notification = {
      id: Date.now(),
      userId,
      title,
      message,
      type,
      priority: priority || 'normal',
      read: false,
      createdAt: new Date().toISOString()
    };
    
    notifications.push(notification);
    
    // Keep only last 100 notifications per user
    const userNotifications = notifications.filter(n => n.userId === userId);
    if (userNotifications.length > 100) {
      const toRemove = userNotifications.slice(0, userNotifications.length - 100);
      toRemove.forEach(n => {
        const index = notifications.indexOf(n);
        if (index > -1) notifications.splice(index, 1);
      });
    }
    
    // Emit via WebSocket if available
    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit('notification', notification);
      logger.info(`Notification emitted via WebSocket to user ${userId}`);
    }
    
    return { success: true, notification };
  } catch (error) {
    logger.error(`Notification job failed for user ${userId}:`, error);
    throw error;
  }
});

// Get user notifications
const getUserNotifications = async (userId, limit = 20) => {
  const userNotifications = notifications
    .filter(n => n.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
  
  return userNotifications;
};

// Mark notification as read
const markNotificationAsRead = async (userId, notificationId) => {
  const notification = notifications.find(n => n.id === parseInt(notificationId) && n.userId === userId);
  if (notification) {
    notification.read = true;
    return { success: true, notification };
  }
  return { success: false, message: 'Notification not found' };
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (userId) => {
  const userNotifications = notifications.filter(n => n.userId === userId);
  userNotifications.forEach(n => n.read = true);
  return { success: true, count: userNotifications.length };
};

// Clear user notifications
const clearUserNotifications = async (userId) => {
  const beforeCount = notifications.length;
  const remaining = notifications.filter(n => n.userId !== userId);
  notifications.length = 0;
  notifications.push(...remaining);
  const deletedCount = beforeCount - notifications.length;
  return { success: true, deletedCount };
};

// Notification job creators
const sendNotificationJob = async (userId, title, message, type = 'info', priority = 'normal') => {
  return await notificationQueue.add({
    userId,
    title,
    message,
    type,
    priority
  });
};

const sendBulkNotificationJob = async (userIds, title, message, type = 'info') => {
  const jobs = [];
  for (const userId of userIds) {
    jobs.push(
      notificationQueue.add({
        userId,
        title,
        message,
        type
      })
    );
  }
  
  const results = await Promise.all(jobs);
  logger.info(`Queued ${results.length} notifications`);
  return results;
};

// Role-based notification
const sendRoleNotificationJob = async (role, title, message, type = 'info') => {
  const { User } = require('../models');
  const users = await User.findAll({ where: { role } });
  const userIds = users.map(u => u.id);
  return await sendBulkNotificationJob(userIds, title, message, type);
};

module.exports = {
  sendNotificationJob,
  sendBulkNotificationJob,
  sendRoleNotificationJob,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearUserNotifications
};