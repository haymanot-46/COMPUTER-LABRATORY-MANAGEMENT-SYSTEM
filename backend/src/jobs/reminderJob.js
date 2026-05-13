// backend/jobs/reminderJob.js
const { Schedule, User, Equipment } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');
const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');

// Send schedule reminders
const sendScheduleReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const schedules = await Schedule.findAll({
      where: { date: tomorrowStr, status: 'approved' },
      include: [{ model: User, as: 'creator', attributes: ['id', 'email', 'firstName', 'lastName'] }]
    });
    
    let reminderCount = 0;
    
    for (const schedule of schedules) {
      const message = `Reminder: Lab session "${schedule.title}" tomorrow at ${schedule.startTime} in ${schedule.lab}`;
      
      await notificationService.createNotification(
        schedule.createdBy,
        'Lab Session Reminder',
        message,
        'reminder',
        `/schedules/${schedule.id}`
      );
      
      reminderCount++;
    }
    
    logger.info(`Sent ${reminderCount} schedule reminders`);
    return { success: true, reminderCount };
  } catch (error) {
    logger.error('Send schedule reminders failed:', error);
    return { success: false, error: error.message };
  }
};

// Send warranty reminders
const sendWarrantyReminders = async () => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringEquipment = await Equipment.findAll({
      where: {
        warrantyExpiry: { [Op.lte]: thirtyDaysFromNow },
        status: 'active'
      }
    });
    
    let reminderCount = 0;
    
    for (const equipment of expiringEquipment) {
      await notificationService.createRoleNotification(
        'asset',
        'Warranty Expiry Warning',
        `Equipment "${equipment.name}" warranty expires on ${equipment.warrantyExpiry}`,
        'warning',
        `/equipment/${equipment.id}`
      );
      reminderCount++;
    }
    
    logger.info(`Sent ${reminderCount} warranty reminders`);
    return { success: true, reminderCount };
  } catch (error) {
    logger.error('Send warranty reminders failed:', error);
    return { success: false, error: error.message };
  }
};

// Send all reminders
const sendAllReminders = async () => {
  const results = {
    scheduleReminders: null,
    warrantyReminders: null,
    timestamp: new Date().toISOString()
  };
  
  try {
    results.scheduleReminders = await sendScheduleReminders();
    results.warrantyReminders = await sendWarrantyReminders();
    
    logger.info('All reminders sent successfully', results);
    return results;
  } catch (error) {
    logger.error('Send all reminders failed:', error);
    throw error;
  }
};

// Schedule reminders (using node-cron)
const scheduleReminders = () => {
  const cron = require('node-cron');
  cron.schedule('0 8 * * *', async () => {
    logger.info('Running scheduled reminders');
    await sendAllReminders();
  });
  console.log('✅ Reminders scheduler initialized');
};

module.exports = {
  sendScheduleReminders,
  sendWarrantyReminders,
  sendAllReminders,
  scheduleReminders
};