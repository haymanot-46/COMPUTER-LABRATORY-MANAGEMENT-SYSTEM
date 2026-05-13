const { MaintenanceRequest, Computer, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

class MaintenanceService {
  // Get all maintenance requests
  async getAllRequests(filters = {}, pagination = {}) {
    try {
      const { status, priority, computerId, page = 1, limit = 20 } = filters;
      const offset = (page - 1) * limit;
      
      let where = {};
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (computerId) where.computerId = computerId;
      
      const { count, rows } = await MaintenanceRequest.findAndCountAll({
        where,
        include: [
          { model: Computer, as: 'computer', attributes: ['name', 'model', 'lab'] },
          { model: User, as: 'reporter', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
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
      logger.error('Get all requests error:', error);
      throw error;
    }
  }

  // Get request by ID
  async getRequestById(id) {
    try {
      const request = await MaintenanceRequest.findByPk(id, {
        include: [
          { model: Computer, as: 'computer' },
          { model: User, as: 'reporter', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] }
        ]
      });
      
      if (!request) {
        throw new Error('Maintenance request not found');
      }
      
      return { success: true, data: request };
    } catch (error) {
      logger.error('Get request by ID error:', error);
      throw error;
    }
  }

  // Create maintenance request
  async createRequest(requestData, userId, userEmail, userName) {
    try {
      const request = await MaintenanceRequest.create({
        ...requestData,
        reportedBy: userName,
        reportedEmail: userEmail,
        status: 'pending'
      });
      
      return { success: true, data: request, message: 'Maintenance request submitted successfully' };
    } catch (error) {
      logger.error('Create request error:', error);
      throw error;
    }
  }

  // Assign technician
  async assignTechnician(requestId, technicianId, technicianName) {
    try {
      const request = await MaintenanceRequest.findByPk(requestId);
      if (!request) {
        throw new Error('Maintenance request not found');
      }
      
      await request.update({
        assignedTo: technicianName,
        assignedToId: technicianId,
        status: 'assigned'
      });
      
      return { success: true, data: request, message: 'Technician assigned successfully' };
    } catch (error) {
      logger.error('Assign technician error:', error);
      throw error;
    }
  }

  // Start work
  async startWork(requestId) {
    try {
      const request = await MaintenanceRequest.findByPk(requestId);
      if (!request) {
        throw new Error('Maintenance request not found');
      }
      
      await request.update({ status: 'in-progress' });
      return { success: true, data: request, message: 'Work started on this request' };
    } catch (error) {
      logger.error('Start work error:', error);
      throw error;
    }
  }

  // Complete request
  async completeRequest(requestId, resolution) {
    try {
      const request = await MaintenanceRequest.findByPk(requestId);
      if (!request) {
        throw new Error('Maintenance request not found');
      }
      
      await request.update({
        status: 'completed',
        resolution,
        completedAt: new Date()
      });
      
      // Update computer status
      await Computer.update(
        { status: 'available' },
        { where: { id: request.computerId } }
      );
      
      return { success: true, data: request, message: 'Maintenance request completed' };
    } catch (error) {
      logger.error('Complete request error:', error);
      throw error;
    }
  }

  // Cancel request
  async cancelRequest(requestId, userId, userRole) {
    try {
      const request = await MaintenanceRequest.findByPk(requestId);
      if (!request) {
        throw new Error('Maintenance request not found');
      }
      
      // Check authorization
      if (request.reportedBy !== userId && userRole !== 'admin') {
        throw new Error('Not authorized to cancel this request');
      }
      
      await request.update({ status: 'cancelled' });
      return { success: true, message: 'Maintenance request cancelled' };
    } catch (error) {
      logger.error('Cancel request error:', error);
      throw error;
    }
  }

  // Update priority
  async updatePriority(requestId, priority) {
    try {
      const request = await MaintenanceRequest.findByPk(requestId);
      if (!request) {
        throw new Error('Maintenance request not found');
      }
      
      await request.update({ priority });
      return { success: true, data: request, message: 'Priority updated' };
    } catch (error) {
      logger.error('Update priority error:', error);
      throw error;
    }
  }

  // Get maintenance statistics
  async getMaintenanceStats() {
    try {
      const total = await MaintenanceRequest.count();
      const pending = await MaintenanceRequest.count({ where: { status: 'pending' } });
      const assigned = await MaintenanceRequest.count({ where: { status: 'assigned' } });
      const inProgress = await MaintenanceRequest.count({ where: { status: 'in-progress' } });
      const completed = await MaintenanceRequest.count({ where: { status: 'completed' } });
      const cancelled = await MaintenanceRequest.count({ where: { status: 'cancelled' } });
      
      const byPriority = {
        low: await MaintenanceRequest.count({ where: { priority: 'low' } }),
        medium: await MaintenanceRequest.count({ where: { priority: 'medium' } }),
        high: await MaintenanceRequest.count({ where: { priority: 'high' } }),
        urgent: await MaintenanceRequest.count({ where: { priority: 'urgent' } })
      };
      
      // Calculate average completion time
      const completedRequests = await MaintenanceRequest.findAll({
        where: { status: 'completed', completedAt: { [Op.ne]: null } }
      });
      
      let avgCompletionTime = 0;
      if (completedRequests.length > 0) {
        const totalHours = completedRequests.reduce((sum, req) => {
          const hours = (new Date(req.completedAt) - new Date(req.createdAt)) / (1000 * 60 * 60);
          return sum + hours;
        }, 0);
        avgCompletionTime = totalHours / completedRequests.length;
      }
      
      return {
        success: true,
        data: {
          total,
          pending,
          assigned,
          inProgress,
          completed,
          cancelled,
          byPriority,
          avgCompletionTime: avgCompletionTime.toFixed(2)
        }
      };
    } catch (error) {
      logger.error('Get maintenance stats error:', error);
      throw error;
    }
  }

  // Get user's maintenance requests
  async getUserRequests(userEmail) {
    try {
      const requests = await MaintenanceRequest.findAll({
        where: { reportedEmail: userEmail },
        include: [{ model: Computer, as: 'computer' }],
        order: [['createdAt', 'DESC']]
      });
      return { success: true, data: requests };
    } catch (error) {
      logger.error('Get user requests error:', error);
      throw error;
    }
  }

  // Get technician assignments
  async getTechnicianAssignments(technicianId) {
    try {
      const requests = await MaintenanceRequest.findAll({
        where: { assignedToId: technicianId },
        include: [{ model: Computer, as: 'computer' }],
        order: [['createdAt', 'DESC']]
      });
      return { success: true, data: requests };
    } catch (error) {
      logger.error('Get technician assignments error:', error);
      throw error;
    }
  }

  // Export maintenance data
  async exportMaintenanceData(filters = {}) {
    try {
      const requests = await MaintenanceRequest.findAll({
        where: filters,
        include: [
          { model: Computer, as: 'computer' },
          { model: User, as: 'reporter' }
        ],
        order: [['createdAt', 'DESC']]
      });
      return { success: true, data: requests };
    } catch (error) {
      logger.error('Export maintenance data error:', error);
      throw error;
    }
  }
}

module.exports = new MaintenanceService();