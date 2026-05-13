const { syncQueue } = require('../config/queue');
const { Attendance, MaintenanceRequest, Schedule } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

// Process sync queue
syncQueue.process(async (job) => {
  const { syncType, data, userId } = job.data;
  logger.info(`Processing sync job: ${syncType} for user ${userId}`);
  
  try {
    let result;
    
    switch (syncType) {
      case 'attendance':
        result = await syncAttendance(data, userId);
        break;
      case 'maintenance':
        result = await syncMaintenance(data, userId);
        break;
      case 'schedules':
        result = await syncSchedules(data, userId);
        break;
      default:
        throw new Error(`Unknown sync type: ${syncType}`);
    }
    
    logger.info(`Sync completed: ${syncType}`, result);
    return result;
  } catch (error) {
    logger.error(`Sync job failed: ${syncType}`, error);
    throw error;
  }
});

// Sync attendance data
const syncAttendance = async (offlineData, userId) => {
  const results = { synced: 0, failed: 0, errors: [] };
  
  for (const record of offlineData) {
    try {
      // Check if attendance already exists
      const existing = await Attendance.findOne({
        where: {
          scheduleId: record.scheduleId,
          studentId: record.studentId,
          markedAt: {
            [Op.gte]: new Date(record.markedAt).setHours(0, 0, 0, 0),
            [Op.lte]: new Date(record.markedAt).setHours(23, 59, 59, 999)
          }
        }
      });
      
      if (existing) {
        // Update existing
        await existing.update({
          status: record.status,
          notes: record.notes,
          markedBy: userId,
          isSynced: true
        });
      } else {
        // Create new
        await Attendance.create({
          scheduleId: record.scheduleId,
          studentId: record.studentId,
          studentName: record.studentName,
          studentNumber: record.studentNumber,
          status: record.status,
          notes: record.notes,
          markedBy: userId,
          markedAt: record.markedAt,
          isSynced: true
        });
      }
      results.synced++;
    } catch (error) {
      results.failed++;
      results.errors.push({ record, error: error.message });
    }
  }
  
  return results;
};

// Sync maintenance requests
const syncMaintenance = async (offlineData, userId) => {
  const results = { synced: 0, failed: 0, errors: [] };
  
  for (const record of offlineData) {
    try {
      const request = await MaintenanceRequest.create({
        ...record,
        reportedBy: record.reportedBy,
        reportedEmail: record.reportedEmail,
        status: 'pending'
      });
      results.synced++;
    } catch (error) {
      results.failed++;
      results.errors.push({ record, error: error.message });
    }
  }
  
  return results;
};

// Sync schedules
const syncSchedules = async (offlineData, userId) => {
  const results = { synced: 0, failed: 0, errors: [] };
  
  for (const record of offlineData) {
    try {
      // Check for conflicts
      const conflict = await Schedule.findOne({
        where: {
          lab: record.lab,
          date: record.date,
          status: { [Op.ne]: 'cancelled' },
          [Op.or]: [
            { startTime: { [Op.between]: [record.startTime, record.endTime] } },
            { endTime: { [Op.between]: [record.startTime, record.endTime] } }
          ]
        }
      });
      
      if (conflict) {
        results.failed++;
        results.errors.push({ record, error: 'Schedule conflict detected' });
        continue;
      }
      
      const schedule = await Schedule.create({
        ...record,
        createdBy: userId,
        status: 'pending'
      });
      results.synced++;
    } catch (error) {
      results.failed++;
      results.errors.push({ record, error: error.message });
    }
  }
  
  return results;
};

// Sync job creators
const syncAttendanceJob = async (offlineData, userId) => {
  return await syncQueue.add({
    syncType: 'attendance',
    data: offlineData,
    userId
  });
};

const syncMaintenanceJob = async (offlineData, userId) => {
  return await syncQueue.add({
    syncType: 'maintenance',
    data: offlineData,
    userId
  });
};

const syncSchedulesJob = async (offlineData, userId) => {
  return await syncQueue.add({
    syncType: 'schedules',
    data: offlineData,
    userId
  });
};

module.exports = {
  syncAttendanceJob,
  syncMaintenanceJob,
  syncSchedulesJob
};