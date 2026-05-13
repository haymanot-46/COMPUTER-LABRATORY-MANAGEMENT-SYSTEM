const { sequelize } = require('../config/database');
const { Attendance, Schedule, MaintenanceRequest, Notification, SessionBlacklist } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../config/logger');

class CleanupService {
  // Clean expired sessions
  async cleanExpiredSessions() {
    try {
      const result = await SessionBlacklist.destroy({
        where: {
          expiresAt: { [Op.lt]: new Date() }
        }
      });
      
      logger.info(`Cleaned ${result} expired sessions`);
      return { success: true, deletedCount: result };
    } catch (error) {
      logger.error('Clean expired sessions error:', error);
      throw error;
    }
  }

  // Clean old completed schedules
  async cleanOldSchedules(days = 30) {
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
      throw error;
    }
  }

  // Clean old attendance records
  async cleanOldAttendance(days = 180) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const result = await Attendance.destroy({
        where: {
          createdAt: { [Op.lt]: cutoffDate }
        }
      });
      
      logger.info(`Cleaned ${result} old attendance records`);
      return { success: true, deletedCount: result };
    } catch (error) {
      logger.error('Clean old attendance error:', error);
      throw error;
    }
  }

  // Clean old maintenance requests
  async cleanOldMaintenance(days = 90) {
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
      throw error;
    }
  }

  // Clean old notifications
  async cleanOldNotifications(days = 30) {
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
      throw error;
    }
  }

  // Clean temporary files
  async cleanTempFiles() {
    try {
      const tempPath = path.join(__dirname, '../../temp');
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
      throw error;
    }
  }

  // Clean orphaned records
  async cleanOrphanedRecords() {
    try {
      let deletedCount = 0;
      
      // Find schedules without valid users
      const orphanedSchedules = await Schedule.findAll({
        include: [{ model: User, as: 'creator', required: false }],
        where: { '$creator.id$': null }
      });
      
      for (const schedule of orphanedSchedules) {
        await schedule.destroy();
        deletedCount++;
      }
      
      // Find attendance without valid students
      const orphanedAttendance = await Attendance.findAll({
        include: [{ model: User, as: 'student', required: false }],
        where: { '$student.id$': null }
      });
      
      for (const attendance of orphanedAttendance) {
        await attendance.destroy();
        deletedCount++;
      }
      
      logger.info(`Cleaned ${deletedCount} orphaned records`);
      return { success: true, deletedCount };
    } catch (error) {
      logger.error('Clean orphaned records error:', error);
      throw error;
    }
  }

  // Reset failed login attempts
  async resetFailedLoginAttempts() {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      const result = await User.update(
        { failedLoginAttempts: 0, lockedUntil: null },
        {
          where: {
            lockedUntil: { [Op.lt]: thirtyMinutesAgo },
            failedLoginAttempts: { [Op.gt]: 0 }
          }
        }
      );
      
      logger.info(`Reset failed login attempts for ${result[0]} users`);
      return { success: true, updatedCount: result[0] };
    } catch (error) {
      logger.error('Reset failed login attempts error:', error);
      throw error;
    }
  }

  // Clean old logs
  async cleanOldLogs(days = 30) {
    try {
      const logsPath = path.join(__dirname, '../../logs');
      if (!fs.existsSync(logsPath)) {
        return { success: true, deletedCount: 0 };
      }
      
      const files = fs.readdirSync(logsPath);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(logsPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.removeSync(filePath);
          deletedCount++;
        }
      }
      
      logger.info(`Cleaned ${deletedCount} old log files`);
      return { success: true, deletedCount };
    } catch (error) {
      logger.error('Clean old logs error:', error);
      throw error;
    }
  }

  // Run all cleanup tasks
  async runFullCleanup() {
    const results = {
      sessions: null,
      schedules: null,
      attendance: null,
      maintenance: null,
      notifications: null,
      tempFiles: null,
      orphaned: null,
      loginAttempts: null,
      logs: null,
      timestamp: new Date().toISOString()
    };
    
    try {
      results.sessions = await this.cleanExpiredSessions();
      results.schedules = await this.cleanOldSchedules();
      results.attendance = await this.cleanOldAttendance();
      results.maintenance = await this.cleanOldMaintenance();
      results.notifications = await this.cleanOldNotifications();
      results.tempFiles = await this.cleanTempFiles();
      results.orphaned = await this.cleanOrphanedRecords();
      results.loginAttempts = await this.resetFailedLoginAttempts();
      results.logs = await this.cleanOldLogs();
      
      logger.info('Full cleanup completed successfully', results);
      return { success: true, data: results };
    } catch (error) {
      logger.error('Full cleanup error:', error);
      throw error;
    }
  }
}

module.exports = new CleanupService();