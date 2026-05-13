const { Notification, User } = require('../models');
const { Op } = require('sequelize');
const { getIO } = require('../socket');
const logger = require('../config/logger');

class NotificationService {
  // Create notification
  async createNotification(userId, title, message, type = 'info', link = null, priority = 'normal') {
    try {
      const notification = await Notification.create({
        userId,
        title,
        message,
        type,
        link,
        priority,
        read: false
      });
      
      // Emit via WebSocket if available
      const io = getIO();
      if (io) {
        io.to(`user:${userId}`).emit('notification', notification);
      }
      
      return notification;
    } catch (error) {
      logger.error('Create notification error:', error);
      throw error;
    }
  }

  // Create broadcast notification
  async createBroadcastNotification(title, message, type = 'info', link = null, priority = 'normal') {
    try {
      const users = await User.findAll({ where: { isActive: true } });
      const notifications = [];
      
      for (const user of users) {
        const notification = await this.createNotification(
          user.id, title, message, type, link, priority
        );
        notifications.push(notification);
      }
      
      return { success: true, data: notifications, count: notifications.length };
    } catch (error) {
      logger.error('Create broadcast notification error:', error);
      throw error;
    }
  }

  // Create role-based notification
  async createRoleNotification(role, title, message, type = 'info', link = null, priority = 'normal') {
    try {
      const users = await User.findAll({ where: { role, isActive: true } });
      const notifications = [];
      
      for (const user of users) {
        const notification = await this.createNotification(
          user.id, title, message, type, link, priority
        );
        notifications.push(notification);
      }
      
      return { success: true, data: notifications, count: notifications.length };
    } catch (error) {
      logger.error('Create role notification error:', error);
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Notification.findAndCountAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      return {
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Get user notifications error:', error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount(userId) {
    try {
      const count = await Notification.count({
        where: { userId, read: false }
      });
      return { success: true, count };
    } catch (error) {
      logger.error('Get unread count error:', error);
      throw error;
    }
  }

  // Mark as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, userId }
      });
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      await notification.update({ read: true, readAt: new Date() });
      return { success: true, data: notification };
    } catch (error) {
      logger.error('Mark as read error:', error);
      throw error;
    }
  }

  // Mark all as read
  async markAllAsRead(userId) {
    try {
      await Notification.update(
        { read: true, readAt: new Date() },
        { where: { userId, read: false } }
      );
      return { success: true, message: 'All notifications marked as read' };
    } catch (error) {
      logger.error('Mark all as read error:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, userId }
      });
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      await notification.destroy();
      return { success: true, message: 'Notification deleted' };
    } catch (error) {
      logger.error('Delete notification error:', error);
      throw error;
    }
  }

  // Delete old notifications
  async deleteOldNotifications(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const deleted = await Notification.destroy({
        where: { createdAt: { [Op.lt]: cutoffDate }, read: true }
      });
      
      return { success: true, deletedCount: deleted };
    } catch (error) {
      logger.error('Delete old notifications error:', error);
      throw error;
    }
  }

  // Send schedule reminder
  async sendScheduleReminder(userId, schedule) {
    const title = 'Lab Session Reminder';
    const message = `Reminder: Your lab session "${schedule.title}" is scheduled for ${schedule.date} at ${schedule.startTime} in ${schedule.lab}`;
    const link = `/schedules/${schedule.id}`;
    
    return await this.createNotification(userId, title, message, 'reminder', link, 'normal');
  }

  // Send attendance notification
  async sendAttendanceNotification(userId, schedule, status) {
    const title = 'Attendance Recorded';
    const message = `Your attendance for "${schedule.title}" has been marked as ${status}`;
    const link = `/attendance/${schedule.id}`;
    
    return await this.createNotification(userId, title, message, 'info', link, 'normal');
  }

  // Send maintenance notification
  async sendMaintenanceNotification(userId, request, action) {
    const title = 'Maintenance Request Update';
    const message = `Your maintenance request #${request.id} has been ${action}`;
    const link = `/maintenance/${request.id}`;
    
    return await this.createNotification(userId, title, message, 'warning', link, 'high');
  }

  // Send equipment notification
  async sendEquipmentNotification(userId, equipment, action) {
    const title = 'Equipment Update';
    const message = `Equipment "${equipment.name}" has been ${action}`;
    const link = `/equipment/${equipment.id}`;
    
    return await this.createNotification(userId, title, message, 'info', link, 'normal');
  }

  // Send system alert
  async sendSystemAlert(userId, message, priority = 'high') {
    const title = 'System Alert';
    return await this.createNotification(userId, title, message, 'error', null, priority);
  }
}

module.exports = new NotificationService();