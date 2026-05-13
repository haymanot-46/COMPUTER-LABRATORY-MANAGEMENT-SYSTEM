const { Attendance, Schedule, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');
const notificationService = require('./notificationService');

class AttendanceService {
  // Get attendance by schedule
  async getAttendanceBySchedule(scheduleId) {
    try {
      const schedule = await Schedule.findByPk(scheduleId);
      if (!schedule) {
        throw new Error('Schedule not found');
      }
      
      const attendance = await Attendance.findAll({
        where: { scheduleId },
        include: [{ model: User, as: 'student', attributes: ['id', 'firstName', 'lastName', 'studentId'] }]
      });
      
      return { success: true, data: { schedule, attendance } };
    } catch (error) {
      logger.error('Get attendance by schedule error:', error);
      throw error;
    }
  }

  // Mark attendance
  async markAttendance(scheduleId, attendanceData, markedBy, markedByName) {
    try {
      const schedule = await Schedule.findByPk(scheduleId);
      if (!schedule) {
        throw new Error('Schedule not found');
      }
      
      const results = { success: [], failed: [] };
      
      for (const record of attendanceData) {
        try {
          const [attendance, created] = await Attendance.upsert({
            scheduleId,
            studentId: record.studentId,
            studentName: record.studentName,
            studentNumber: record.studentNumber,
            status: record.status,
            checkInTime: record.checkInTime || null,
            lateMinutes: record.lateMinutes || 0,
            notes: record.notes || null,
            markedBy,
            markedAt: new Date(),
            isSynced: true
          });
          
          results.success.push(attendance);
          
          // Send notification to student
          if (record.status !== 'present') {
            await notificationService.createNotification(
              record.studentId,
              'Attendance Recorded',
              `Your attendance for "${schedule.title}" has been marked as ${record.status}`,
              'warning',
              `/attendance/${scheduleId}`
            );
          }
        } catch (error) {
          results.failed.push({ record, error: error.message });
        }
      }
      
      return {
        success: true,
        data: results,
        message: `Marked ${results.success.length} records, ${results.failed.length} failed`
      };
    } catch (error) {
      logger.error('Mark attendance error:', error);
      throw error;
    }
  }

  // Get student attendance
  async getStudentAttendance(studentId, filters = {}) {
    try {
      const { startDate, endDate } = filters;
      
      let where = { studentId };
      if (startDate && endDate) {
        where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
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
          ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
          : 0
      };
      
      return { success: true, data: { attendance, summary } };
    } catch (error) {
      logger.error('Get student attendance error:', error);
      throw error;
    }
  }

  // Get attendance report
  async getAttendanceReport(filters = {}) {
    try {
      const { startDate, endDate, course, lab, department } = filters;
      
      let where = {};
      if (startDate && endDate) {
        where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      }
      
      const attendance = await Attendance.findAll({
        where,
        include: [
          { 
            model: Schedule, 
            as: 'Schedule',
            where: {
              ...(course && { course }),
              ...(lab && { lab }),
              ...(department && { department })
            }
          },
          { model: User, as: 'student', attributes: ['firstName', 'lastName', 'studentId'] }
        ]
      });
      
      // Group by course
      const byCourse = {};
      attendance.forEach(a => {
        const courseName = a.Schedule?.course || 'Unknown';
        if (!byCourse[courseName]) {
          byCourse[courseName] = { total: 0, present: 0, absent: 0, late: 0 };
        }
        byCourse[courseName].total++;
        byCourse[courseName][a.status]++;
      });
      
      // Group by lab
      const byLab = {};
      attendance.forEach(a => {
        const labName = a.Schedule?.lab || 'Unknown';
        if (!byLab[labName]) {
          byLab[labName] = { total: 0, present: 0, absent: 0, late: 0 };
        }
        byLab[labName].total++;
        byLab[labName][a.status]++;
      });
      
      const summary = {
        total: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length,
        attendanceRate: attendance.length > 0 
          ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(2)
          : 0
      };
      
      return {
        success: true,
        data: {
          summary,
          byCourse,
          byLab,
          records: attendance
        }
      };
    } catch (error) {
      logger.error('Get attendance report error:', error);
      throw error;
    }
  }

  // Sync offline attendance
  async syncOfflineAttendance(offlineData, userId) {
    try {
      const results = { synced: 0, failed: 0, errors: [] };
      
      for (const record of offlineData) {
        try {
          const [attendance, created] = await Attendance.upsert({
            scheduleId: record.scheduleId,
            studentId: record.studentId,
            studentName: record.studentName,
            studentNumber: record.studentNumber,
            status: record.status,
            notes: record.notes,
            markedBy: userId,
            markedAt: record.markedAt || new Date(),
            isSynced: true,
            offlineId: record.offlineId
          });
          
          results.synced++;
        } catch (error) {
          results.failed++;
          results.errors.push({ record, error: error.message });
        }
      }
      
      return {
        success: true,
        data: results,
        message: `Synced ${results.synced} records, ${results.failed} failed`
      };
    } catch (error) {
      logger.error('Sync offline attendance error:', error);
      throw error;
    }
  }

  // Get attendance statistics
  async getAttendanceStats(startDate, endDate) {
    try {
      const where = {};
      if (startDate && endDate) {
        where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      }
      
      const total = await Attendance.count({ where });
      const present = await Attendance.count({ where: { ...where, status: 'present' } });
      const absent = await Attendance.count({ where: { ...where, status: 'absent' } });
      const late = await Attendance.count({ where: { ...where, status: 'late' } });
      
      // Daily trend
      const dailyTrend = await Attendance.findAll({
        where,
        attributes: [
          [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
          [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'present' THEN 1 ELSE 0 END")), 'present']
        ],
        group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
        limit: 30
      });
      
      return {
        success: true,
        data: {
          total,
          present,
          absent,
          late,
          attendanceRate: total > 0 ? ((present / total) * 100).toFixed(2) : 0,
          dailyTrend
        }
      };
    } catch (error) {
      logger.error('Get attendance stats error:', error);
      throw error;
    }
  }

  // Export attendance data
  async exportAttendanceData(filters = {}) {
    try {
      const attendance = await Attendance.findAll({
        where: filters,
        include: [
          { model: Schedule, as: 'Schedule' },
          { model: User, as: 'student' }
        ]
      });
      return { success: true, data: attendance };
    } catch (error) {
      logger.error('Export attendance data error:', error);
      throw error;
    }
  }
}

module.exports = new AttendanceService();