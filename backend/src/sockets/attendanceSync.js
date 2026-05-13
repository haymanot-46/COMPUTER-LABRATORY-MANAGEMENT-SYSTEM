// backend/sockets/attendanceSync.js
const { Op } = require('sequelize');  // ADD THIS IMPORT
const logger = require('../config/logger');
const { Attendance, Schedule } = require('../models');

// Store offline attendance data (in production, use Redis)
const pendingSyncData = new Map();

module.exports = (io, socket) => {
  const { user } = socket;

  // Handle attendance marking
  socket.on('attendance:mark', async (data) => {
    try {
      const { scheduleId, attendance, deviceInfo } = data;
      
      logger.info(`Attendance marking from ${user.email} for schedule ${scheduleId}`);
      
      // Process attendance records
      const results = {
        success: [],
        failed: []
      };
      
      for (const record of attendance) {
        try {
          // Check if already marked
          const existing = await Attendance.findOne({
            where: {
              scheduleId,
              studentId: record.studentId
            }
          });
          
          if (existing) {
            await existing.update({
              status: record.status,
              notes: record.notes,
              markedBy: user.id,
              markedAt: new Date()
            });
          } else {
            await Attendance.create({
              scheduleId,
              studentId: record.studentId,
              studentName: record.studentName,
              studentNumber: record.studentNumber,
              status: record.status,
              notes: record.notes,
              markedBy: user.id,
              markedAt: new Date()
            });
          }
          
          results.success.push(record);
          
          // Notify student
          io.to(`user:${record.studentId}`).emit('attendance:updated', {
            scheduleId,
            status: record.status,
            markedBy: `${user.firstName} ${user.lastName}`,
            timestamp: new Date().toISOString()
          });
          
        } catch (error) {
          results.failed.push({ ...record, error: error.message });
        }
      }
      
      // Notify teachers and lab assistants
      io.to('role:teacher').to('role:lab_assistant').emit('attendance:synced', {
        scheduleId,
        results: {
          successCount: results.success.length,
          failedCount: results.failed.length
        },
        syncedBy: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role
        },
        timestamp: new Date().toISOString()
      });
      
      // Confirm to sender
      socket.emit('attendance:marked', {
        scheduleId,
        successCount: results.success.length,
        failedCount: results.failed.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('Attendance marking error:', error);
      socket.emit('error', { message: 'Failed to mark attendance', error: error.message });
    }
  });

  // Handle offline attendance sync
  socket.on('attendance:offlineSync', async (data) => {
    try {
      const { offlineData, deviceId } = data;
      
      logger.info(`Offline attendance sync from ${user.email} - ${offlineData.length} records`);
      
      // Store in pending sync (in production, use Redis)
      const syncId = Date.now().toString();
      pendingSyncData.set(syncId, {
        userId: user.id,
        userEmail: user.email,
        deviceId,
        data: offlineData,
        timestamp: new Date()
      });
      
      // Process sync
      const results = {
        synced: [],
        pending: [],
        failed: []
      };
      
      for (const record of offlineData) {
        try {
          // Check if online
          const schedule = await Schedule.findByPk(record.scheduleId);
          
          if (schedule) {
            // Online - process immediately
            await Attendance.upsert({
              scheduleId: record.scheduleId,
              studentId: record.studentId,
              studentName: record.studentName,
              studentNumber: record.studentNumber,
              status: record.status,
              notes: record.notes,
              markedBy: user.id,
              markedAt: record.markedAt || new Date(),
              isSynced: true
            });
            results.synced.push(record);
          } else {
            // Offline - store for later
            results.pending.push(record);
          }
        } catch (error) {
          results.failed.push({ ...record, error: error.message });
        }
      }
      
      // Notify teachers and lab assistants
      io.to('role:teacher').to('role:lab_assistant').emit('attendance:offlineSyncComplete', {
        syncId,
        results: {
          syncedCount: results.synced.length,
          pendingCount: results.pending.length,
          failedCount: results.failed.length
        },
        syncedBy: user.email,
        timestamp: new Date().toISOString()
      });
      
      socket.emit('attendance:syncComplete', {
        syncId,
        results,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('Offline attendance sync error:', error);
      socket.emit('error', { message: 'Failed to sync offline attendance' });
    }
  });

  // Handle get attendance summary
  socket.on('attendance:getSummary', async (data) => {
    try {
      const { studentId, startDate, endDate } = data;
      
      let where = { studentId: studentId || user.id };
      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }
      
      const attendance = await Attendance.findAll({
        where,
        include: [{ model: Schedule, as: 'Schedule' }],
        order: [['createdAt', 'DESC']]
      });
      
      const summary = {
        total: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length,
        percentage: attendance.length > 0
          ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(2)
          : 0
      };
      
      socket.emit('attendance:summary', {
        studentId: studentId || user.id,
        summary,
        records: attendance,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('Get attendance summary error:', error);
      socket.emit('error', { message: 'Failed to get attendance summary' });
    }
  });

  // Handle real-time attendance subscription
  socket.on('attendance:subscribe', (data) => {
    const { scheduleId } = data;
    
    if (scheduleId) {
      socket.join(`attendance:${scheduleId}`);
      logger.info(`${user.email} subscribed to attendance updates for schedule ${scheduleId}`);
      
      socket.emit('attendance:subscribed', {
        scheduleId,
        message: `Subscribed to attendance updates for schedule ${scheduleId}`,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle real-time attendance unsubscribe
  socket.on('attendance:unsubscribe', (data) => {
    const { scheduleId } = data;
    
    if (scheduleId) {
      socket.leave(`attendance:${scheduleId}`);
      logger.info(`${user.email} unsubscribed from attendance updates for schedule ${scheduleId}`);
      
      socket.emit('attendance:unsubscribed', {
        scheduleId,
        message: `Unsubscribed from attendance updates for schedule ${scheduleId}`,
        timestamp: new Date().toISOString()
      });
    }
  });
};