// backend/jobs/cleanupJob.js
const { sequelize } = require('../config/database');
const { User, Schedule, Attendance, MaintenanceRequest, Notification, SessionBlacklist } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../config/logger');

// Clean expired sessions
const cleanExpiredSessions = async () => {
  try {
    const result = await SessionBlacklist.destroy({
      where: { expiresAt: { [Op.lt]: new Date() } }
    });
    logger.info(`Cleaned ${result} expired sessions`);
    return { success: true, deletedCount: result };
  } catch (error) {
    logger.error('Clean expired sessions error:', error);
    return { success: false, error: error.message };
  }
};

// Clean old completed schedules
const cleanOldSchedules = async (days = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await Schedule.destroy({
      where: {
        status: 'completed',
        date: { [Op.lt]: cutoffDate }
      }
    });
    logger.info(`Cleaned ${result} old completed schedules`);
    return { success: true, deletedCount: result };
  } catch (error) {
    logger.error('Clean old schedules error:', error);
    return { success: false, error: error.message };
  }
};

// Clean old attendance records
const cleanOldAttendance = async (days = 180) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await Attendance.destroy({
      where: { createdAt: { [Op.lt]: cutoffDate } }
    });
    logger.info(`Cleaned ${result} old attendance records`);
    return { success: true, deletedCount: result };
  } catch (error) {
    logger.error('Clean old attendance error:', error);
    return { success: false, error: error.message };
  }
};

// Clean old maintenance requests
const cleanOldMaintenance = async (days = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await MaintenanceRequest.destroy({
      where: {
        status: 'completed',
        completedAt: { [Op.lt]: cutoffDate }
      }
    });
    logger.info(`Cleaned ${result} old maintenance requests`);
    return { success: true, deletedCount: result };
  } catch (error) {
    logger.error('Clean old maintenance error:', error);
    return { success: false, error: error.message };
  }
};

// Clean old notifications
const cleanOldNotifications = async (days = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await Notification.destroy({
      where: {
        read: true,
        createdAt: { [Op.lt]: cutoffDate }
      }
    });
    logger.info(`Cleaned ${result} old notifications`);
    return { success: true, deletedCount: result };
  } catch (error) {
    logger.error('Clean old notifications error:', error);
    return { success: false, error: error.message };
  }
};

// Clean temporary files
const cleanTempFiles = async () => {
  try {
    const tempPath = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempPath)) {
      return { success: true, deletedCount: 0 };
    }
    
    const files = fs.readdirSync(tempPath);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(tempPath, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > oneHour) {
        fs.removeSync(filePath);
        deletedCount++;
      }
    }
    logger.info(`Cleaned ${deletedCount} temporary files`);
    return { success: true, deletedCount };
  } catch (error) {
    logger.error('Clean temp files error:', error);
    return { success: false, error: error.message };
  }
};

// Main cleanup job
const performCleanup = async () => {
  const results = {
    sessions: null,
    schedules: null,
    attendance: null,
    maintenance: null,
    notifications: null,
    tempFiles: null,
    timestamp: new Date().toISOString()
  };
  
  try {
    results.sessions = await cleanExpiredSessions();
    results.schedules = await cleanOldSchedules();
    results.attendance = await cleanOldAttendance();
    results.maintenance = await cleanOldMaintenance();
    results.notifications = await cleanOldNotifications();
    results.tempFiles = await cleanTempFiles();
    
    logger.info('Cleanup completed successfully', results);
    return results;
  } catch (error) {
    logger.error('Cleanup job failed:', error);
    throw error;
  }
};

// Schedule cleanup (using node-cron)
const scheduleCleanup = () => {
  const cron = require('node-cron');
  cron.schedule('0 3 * * *', async () => {
    logger.info('Running scheduled cleanup');
    await performCleanup();
  });
  console.log('✅ Cleanup scheduler initialized');
};

module.exports = {
  performCleanup,
  cleanExpiredSessions,
  cleanOldSchedules,
  cleanOldAttendance,
  cleanOldMaintenance,
  cleanOldNotifications,
  cleanTempFiles,
  scheduleCleanup
};