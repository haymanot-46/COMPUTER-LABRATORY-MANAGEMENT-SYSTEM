const { Schedule, User, Laboratory } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

class ScheduleService {
  // Get all schedules with filters
  async getAllSchedules(filters = {}, pagination = {}) {
    try {
      const { startDate, endDate, lab, status, page = 1, limit = 20 } = filters;
      const offset = (page - 1) * limit;
      
      let where = {};
      if (startDate && endDate) {
        where.date = { [Op.between]: [startDate, endDate] };
      }
      if (lab) where.lab = lab;
      if (status) where.status = status;
      
      const { count, rows } = await Schedule.findAndCountAll({
        where,
        include: [
          { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
          { model: Laboratory, as: 'laboratory', attributes: ['id', 'name', 'capacity'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['date', 'ASC']]
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
      logger.error('Get all schedules error:', error);
      throw error;
    }
  }

  // Get schedule by ID
  async getScheduleById(id) {
    try {
      const schedule = await Schedule.findByPk(id, {
        include: [
          { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: User, as: 'approver', attributes: ['id', 'firstName', 'lastName'] },
          { model: Laboratory, as: 'laboratory' }
        ]
      });
      
      if (!schedule) {
        throw new Error('Schedule not found');
      }
      
      return { success: true, data: schedule };
    } catch (error) {
      logger.error('Get schedule by ID error:', error);
      throw error;
    }
  }

  // Create schedule
  async createSchedule(scheduleData, userId) {
    try {
      // Check for conflicts
      const conflict = await this.checkAvailability(
        scheduleData.lab,
        scheduleData.date,
        scheduleData.startTime,
        scheduleData.endTime
      );
      
      if (conflict) {
        throw new Error('Schedule conflict detected. This time slot is already booked.');
      }
      
      const schedule = await Schedule.create({
        ...scheduleData,
        createdBy: userId,
        status: 'pending'
      });
      
      return { success: true, data: schedule, message: 'Schedule created successfully' };
    } catch (error) {
      logger.error('Create schedule error:', error);
      throw error;
    }
  }

  // Update schedule
  async updateSchedule(id, updateData, userId, userRole) {
    try {
      const schedule = await Schedule.findByPk(id);
      if (!schedule) {
        throw new Error('Schedule not found');
      }
      
      // Check authorization
      if (schedule.createdBy !== userId && userRole !== 'admin' && userRole !== 'lab_manager') {
        throw new Error('Not authorized to update this schedule');
      }
      
      if (schedule.status !== 'pending') {
        throw new Error('Only pending schedules can be updated');
      }
      
      await schedule.update(updateData);
      return { success: true, data: schedule, message: 'Schedule updated successfully' };
    } catch (error) {
      logger.error('Update schedule error:', error);
      throw error;
    }
  }

  // Approve schedule
  async approveSchedule(id, approverId, comments = '') {
    try {
      const schedule = await Schedule.findByPk(id);
      if (!schedule) {
        throw new Error('Schedule not found');
      }
      
      if (schedule.status !== 'pending') {
        throw new Error('Only pending schedules can be approved');
      }
      
      await schedule.update({
        status: 'approved',
        approvedBy: approverId,
        approvedAt: new Date()
      });
      
      return { success: true, data: schedule, message: 'Schedule approved successfully' };
    } catch (error) {
      logger.error('Approve schedule error:', error);
      throw error;
    }
  }

  // Reject schedule
  async rejectSchedule(id, reason) {
    try {
      const schedule = await Schedule.findByPk(id);
      if (!schedule) {
        throw new Error('Schedule not found');
      }
      
      if (schedule.status !== 'pending') {
        throw new Error('Only pending schedules can be rejected');
      }
      
      await schedule.update({
        status: 'rejected',
        rejectionReason: reason
      });
      
      return { success: true, data: schedule, message: 'Schedule rejected' };
    } catch (error) {
      logger.error('Reject schedule error:', error);
      throw error;
    }
  }

  // Cancel schedule
  async cancelSchedule(id, userId, userRole) {
    try {
      const schedule = await Schedule.findByPk(id);
      if (!schedule) {
        throw new Error('Schedule not found');
      }
      
      if (schedule.createdBy !== userId && userRole !== 'admin') {
        throw new Error('Not authorized to cancel this schedule');
      }
      
      await schedule.update({ status: 'cancelled' });
      return { success: true, message: 'Schedule cancelled successfully' };
    } catch (error) {
      logger.error('Cancel schedule error:', error);
      throw error;
    }
  }

  // Get user's schedules
  async getUserSchedules(userId) {
    try {
      const schedules = await Schedule.findAll({
        where: { createdBy: userId },
        order: [['date', 'ASC']]
      });
      return { success: true, data: schedules };
    } catch (error) {
      logger.error('Get user schedules error:', error);
      throw error;
    }
  }

  // Get pending approvals
  async getPendingApprovals() {
    try {
      const schedules = await Schedule.findAll({
        where: { status: 'pending' },
        include: [
          { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
        ],
        order: [['date', 'ASC']]
      });
      return { success: true, data: schedules };
    } catch (error) {
      logger.error('Get pending approvals error:', error);
      throw error;
    }
  }

  // Check availability
  async checkAvailability(lab, date, startTime, endTime) {
    try {
      const conflicting = await Schedule.findOne({
        where: {
          lab,
          date,
          status: { [Op.ne]: 'cancelled' },
          [Op.or]: [
            {
              startTime: { [Op.between]: [startTime, endTime] }
            },
            {
              endTime: { [Op.between]: [startTime, endTime] }
            }
          ]
        }
      });
      
      return !!conflicting;
    } catch (error) {
      logger.error('Check availability error:', error);
      throw error;
    }
  }

  // Get available time slots
  async getAvailableTimeSlots(labId, date) {
    try {
      const timeSlots = ['08:00', '10:00', '13:00', '15:00'];
      const bookedSlots = await Schedule.findAll({
        where: {
          lab: labId,
          date,
          status: { [Op.ne]: 'cancelled' }
        },
        attributes: ['startTime']
      });
      
      const bookedTimes = bookedSlots.map(slot => slot.startTime);
      const available = timeSlots.filter(slot => !bookedTimes.includes(slot));
      
      return { success: true, data: available };
    } catch (error) {
      logger.error('Get available time slots error:', error);
      throw error;
    }
  }

  // Get schedule statistics
  async getScheduleStats() {
    try {
      const total = await Schedule.count();
      const approved = await Schedule.count({ where: { status: 'approved' } });
      const pending = await Schedule.count({ where: { status: 'pending' } });
      const completed = await Schedule.count({ where: { status: 'completed' } });
      const cancelled = await Schedule.count({ where: { status: 'cancelled' } });
      
      return {
        success: true,
        data: { total, approved, pending, completed, cancelled }
      };
    } catch (error) {
      logger.error('Get schedule stats error:', error);
      throw error;
    }
  }

  // Batch create schedules
  async batchCreateSchedules(schedulesData, userId) {
    try {
      const created = [];
      const conflicts = [];
      
      for (const scheduleData of schedulesData) {
        const conflict = await this.checkAvailability(
          scheduleData.lab,
          scheduleData.date,
          scheduleData.startTime,
          scheduleData.endTime
        );
        
        if (conflict) {
          conflicts.push(scheduleData);
          continue;
        }
        
        const schedule = await Schedule.create({
          ...scheduleData,
          createdBy: userId,
          status: 'pending'
        });
        created.push(schedule);
      }
      
      return {
        success: true,
        data: { created, conflicts },
        message: `Created ${created.length} schedules, ${conflicts.length} conflicts`
      };
    } catch (error) {
      logger.error('Batch create schedules error:', error);
      throw error;
    }
  }

  // Get lab schedule
  async getLabSchedule(labId, startDate, endDate) {
    try {
      const schedules = await Schedule.findAll({
        where: {
          lab: labId,
          date: { [Op.between]: [startDate, endDate] },
          status: { [Op.in]: ['approved', 'completed'] }
        },
        order: [['date', 'ASC'], ['startTime', 'ASC']]
      });
      return { success: true, data: schedules };
    } catch (error) {
      logger.error('Get lab schedule error:', error);
      throw error;
    }
  }
}

module.exports = new ScheduleService();