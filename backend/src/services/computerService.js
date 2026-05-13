const { Computer, MaintenanceRequest } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

class ComputerService {
  // Get all computers with filters
  async getAllComputers(filters = {}, pagination = {}) {
    try {
      const { search, status, lab, page = 1, limit = 20 } = filters;
      const offset = (page - 1) * limit;
      
      let where = {};
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { model: { [Op.like]: `%${search}%` } },
          { lab: { [Op.like]: `%${search}%` } }
        ];
      }
      if (status) where.status = status;
      if (lab) where.lab = lab;
      
      const { count, rows } = await Computer.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['lab', 'ASC'], ['name', 'ASC']]
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
      logger.error('Get all computers error:', error);
      throw error;
    }
  }

  // Get computer by ID
  async getComputerById(id) {
    try {
      const computer = await Computer.findByPk(id, {
        include: [{
          model: MaintenanceRequest,
          as: 'MaintenanceRequests',
          limit: 5,
          order: [['createdAt', 'DESC']]
        }]
      });
      
      if (!computer) {
        throw new Error('Computer not found');
      }
      
      return { success: true, data: computer };
    } catch (error) {
      logger.error('Get computer by ID error:', error);
      throw error;
    }
  }

  // Create computer
  async createComputer(computerData) {
    try {
      const computer = await Computer.create(computerData);
      return { success: true, data: computer, message: 'Computer added successfully' };
    } catch (error) {
      logger.error('Create computer error:', error);
      throw error;
    }
  }

  // Update computer
  async updateComputer(id, updateData) {
    try {
      const computer = await Computer.findByPk(id);
      if (!computer) {
        throw new Error('Computer not found');
      }
      
      await computer.update(updateData);
      return { success: true, data: computer, message: 'Computer updated successfully' };
    } catch (error) {
      logger.error('Update computer error:', error);
      throw error;
    }
  }

  // Update computer status
  async updateComputerStatus(id, status) {
    try {
      const computer = await Computer.findByPk(id);
      if (!computer) {
        throw new Error('Computer not found');
      }
      
      await computer.update({ status });
      return { success: true, data: computer, message: `Status updated to ${status}` };
    } catch (error) {
      logger.error('Update computer status error:', error);
      throw error;
    }
  }

  // Delete computer
  async deleteComputer(id) {
    try {
      const computer = await Computer.findByPk(id);
      if (!computer) {
        throw new Error('Computer not found');
      }
      
      await computer.destroy();
      return { success: true, message: 'Computer deleted successfully' };
    } catch (error) {
      logger.error('Delete computer error:', error);
      throw error;
    }
  }

  // Get computer statistics
  async getComputerStats() {
    try {
      const total = await Computer.count();
      const available = await Computer.count({ where: { status: 'available' } });
      const inUse = await Computer.count({ where: { status: 'in-use' } });
      const maintenance = await Computer.count({ where: { status: 'maintenance' } });
      const damaged = await Computer.count({ where: { status: 'damaged' } });
      
      const byLab = {};
      const labs = await Computer.findAll({ attributes: ['lab'], group: ['lab'] });
      for (const lab of labs) {
        byLab[lab.lab] = await Computer.count({ where: { lab: lab.lab } });
      }
      
      return {
        success: true,
        data: {
          total,
          available,
          inUse,
          maintenance,
          damaged,
          byLab
        }
      };
    } catch (error) {
      logger.error('Get computer stats error:', error);
      throw error;
    }
  }

  // Get available computers by lab
  async getAvailableComputers(lab = null) {
    try {
      let where = { status: 'available' };
      if (lab) where.lab = lab;
      
      const computers = await Computer.findAll({ where });
      return { success: true, data: computers };
    } catch (error) {
      logger.error('Get available computers error:', error);
      throw error;
    }
  }

  // Get computers by lab
  async getComputersByLab(lab) {
    try {
      const computers = await Computer.findAll({ where: { lab } });
      return { success: true, data: computers };
    } catch (error) {
      logger.error('Get computers by lab error:', error);
      throw error;
    }
  }

  // Get maintenance history for computer
  async getMaintenanceHistory(computerId) {
    try {
      const history = await MaintenanceRequest.findAll({
        where: { computerId },
        order: [['createdAt', 'DESC']]
      });
      return { success: true, data: history };
    } catch (error) {
      logger.error('Get maintenance history error:', error);
      throw error;
    }
  }

  // Bulk import computers
  async bulkImportComputers(computersData) {
    try {
      const results = { success: [], failed: [] };
      
      for (const computerData of computersData) {
        try {
          const computer = await Computer.create(computerData);
          results.success.push(computer);
        } catch (error) {
          results.failed.push({ data: computerData, error: error.message });
        }
      }
      
      return {
        success: true,
        data: results,
        message: `Imported ${results.success.length} computers, ${results.failed.length} failed`
      };
    } catch (error) {
      logger.error('Bulk import computers error:', error);
      throw error;
    }
  }

  // Export computers to CSV
  async exportComputers(filters = {}) {
    try {
      const computers = await Computer.findAll({ where: filters });
      return { success: true, data: computers };
    } catch (error) {
      logger.error('Export computers error:', error);
      throw error;
    }
  }
}

module.exports = new ComputerService();