// backend/sockets/notifications.js
const { Op } = require('sequelize');  // ADD THIS IMPORT
const logger = require('../config/logger');
const { Notification } = require('../models');

// Store notification history (in production, use Redis)
const notificationHistory = new Map();

module.exports = (io, socket) => {
  const { user } = socket;

  // Send notification to specific user
  socket.on('notification:send', async (data) => {
    try {
      const { userId, title, message, type, link, priority } = data;
      
      // Check authorization (only admins and managers can send notifications)
      const allowedRoles = ['admin', 'lab_manager', 'dean'];
      if (!allowedRoles.includes(user.role)) {
        return socket.emit('error', { message: 'Not authorized to send notifications' });
      }
      
      // Save to database
      const notification = await Notification.create({
        userId,
        title,
        message,
        type: type || 'info',
        link: link || null,
        priority: priority || 'normal',
        read: false,
        sentBy: user.id,
        sentByEmail: user.email
      });
      
      // Send real-time notification if user is online
      io.to(`user:${userId}`).emit('notification:receive', {
        id: notification.id,
        title,
        message,
        type,
        link,
        priority,
        timestamp: new Date().toISOString(),
        sentBy: `${user.firstName} ${user.lastName}`
      });
      
      // Confirm to sender
      socket.emit('notification:sent', {
        notificationId: notification.id,
        userId,
        timestamp: new Date().toISOString()
      });
      
      logger.info(`Notification sent from ${user.email} to user ${userId}: ${title}`);
      
    } catch (error) {
      logger.error('Send notification error:', error);
      socket.emit('error', { message: 'Failed to send notification' });
    }
  });

  // Send broadcast notification to all users
  socket.on('notification:broadcast', async (data) => {
    try {
      const { title, message, type, priority } = data;
      
      // Check authorization
      if (user.role !== 'admin') {
        return socket.emit('error', { message: 'Only admins can broadcast notifications' });
      }
      
      // Broadcast to all connected clients
      io.emit('notification:broadcast', {
        title,
        message,
        type: type || 'info',
        priority: priority || 'normal',
        timestamp: new Date().toISOString(),
        sentBy: `${user.firstName} ${user.lastName}`
      });
      
      logger.info(`Broadcast notification from ${user.email}: ${title}`);
      
      socket.emit('notification:broadcastSent', {
        title,
        message,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('Broadcast notification error:', error);
      socket.emit('error', { message: 'Failed to broadcast notification' });
    }
  });

  // Send role-based notification
  socket.on('notification:sendToRole', async (data) => {
    try {
      const { role, title, message, type, priority } = data;
      
      // Check authorization
      const allowedRoles = ['admin', 'lab_manager'];
      if (!allowedRoles.includes(user.role)) {
        return socket.emit('error', { message: 'Not authorized to send role notifications' });
      }
      
      // Send to role room
      io.to(`role:${role}`).emit('notification:roleReceive', {
        title,
        message,
        type: type || 'info',
        priority: priority || 'normal',
        timestamp: new Date().toISOString(),
        sentBy: `${user.firstName} ${user.lastName}`,
        targetRole: role
      });
      
      logger.info(`Role notification from ${user.email} to ${role}: ${title}`);
      
      socket.emit('notification:roleSent', {
        role,
        title,
        message,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('Send role notification error:', error);
      socket.emit('error', { message: 'Failed to send role notification' });
    }
  });

  // Mark notification as read
  socket.on('notification:markRead', async (data) => {
    try {
      const { notificationId } = data;
      
      const notification = await Notification.findOne({
        where: { id: notificationId, userId: user.id }
      });
      
      if (notification && !notification.read) {
        await notification.update({ read: true, readAt: new Date() });
        
        socket.emit('notification:markedRead', {
          notificationId,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      logger.error('Mark notification read error:', error);
      socket.emit('error', { message: 'Failed to mark notification as read' });
    }
  });

  // Mark all notifications as read
  socket.on('notification:markAllRead', async () => {
    try {
      await Notification.update(
        { read: true, readAt: new Date() },
        { where: { userId: user.id, read: false } }
      );
      
      socket.emit('notification:allMarkedRead', {
        timestamp: new Date().toISOString()
      });
      
      logger.info(`${user.email} marked all notifications as read`);
      
    } catch (error) {
      logger.error('Mark all notifications read error:', error);
      socket.emit('error', { message: 'Failed to mark all notifications as read' });
    }
  });

  // Get unread count
  socket.on('notification:getUnreadCount', async () => {
    try {
      const count = await Notification.count({
        where: { userId: user.id, read: false }
      });
      
      socket.emit('notification:unreadCount', {
        count,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('Get unread count error:', error);
      socket.emit('error', { message: 'Failed to get unread count' });
    }
  });

  // Get recent notifications
  socket.on('notification:getRecent', async (data) => {
    try {
      const { limit = 20 } = data || {};
      
      const notifications = await Notification.findAll({
        where: { userId: user.id },
        order: [['createdAt', 'DESC']],
        limit: Math.min(limit, 50)
      });
      
      socket.emit('notification:recent', {
        notifications,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('Get recent notifications error:', error);
      socket.emit('error', { message: 'Failed to get recent notifications' });
    }
  });

  // Delete notification
  socket.on('notification:delete', async (data) => {
    try {
      const { notificationId } = data;
      
      const notification = await Notification.findOne({
        where: { id: notificationId, userId: user.id }
      });
      
      if (notification) {
        await notification.destroy();
        
        socket.emit('notification:deleted', {
          notificationId,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      logger.error('Delete notification error:', error);
      socket.emit('error', { message: 'Failed to delete notification' });
    }
  });

  // Subscribe to notifications
  socket.on('notification:subscribe', () => {
    socket.join(`notifications:${user.id}`);
    logger.info(`${user.email} subscribed to notifications`);
    
    socket.emit('notification:subscribed', {
      message: 'Subscribed to notifications',
      timestamp: new Date().toISOString()
    });
  });

  // Unsubscribe from notifications
  socket.on('notification:unsubscribe', () => {
    socket.leave(`notifications:${user.id}`);
    logger.info(`${user.email} unsubscribed from notifications`);
    
    socket.emit('notification:unsubscribed', {
      message: 'Unsubscribed from notifications',
      timestamp: new Date().toISOString()
    });
  });
};