const { User, Student, Teacher, LabAssistant } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');
const notificationService = require('./notificationService');
const emailService = require('./emailService');

class UserService {
  // Get all users
  async getAllUsers(filters = {}, pagination = {}) {
    try {
      const { role, search, isActive, page = 1, limit = 20 } = filters;
      const offset = (page - 1) * limit;
      
      let where = {};
      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive;
      if (search) {
        where[Op.or] = [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { studentId: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
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
      logger.error('Get all users error:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return { success: true, data: user };
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }

  // Get user by email
  async getUserByEmail(email) {
    try {
      const user = await User.findOne({
        where: { email },
        attributes: { exclude: ['password'] }
      });
      
      return { success: true, data: user };
    } catch (error) {
      logger.error('Get user by email error:', error);
      throw error;
    }
  }

  // Create user
  async createUser(userData) {
    try {
      const { email, password, firstName, lastName, role, phone, studentId, department } = userData;
      
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }
      
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role: role || 'student',
        phone,
        studentId,
        department,
        isActive: true
      });
      
      // Send welcome email
      await emailService.sendWelcomeEmail(email, `${firstName} ${lastName}`);
      
      // Send notification to admin
      await notificationService.createRoleNotification(
        'admin',
        'New User Registered',
        `${firstName} ${lastName} (${email}) has registered as ${role}`,
        'info',
        `/admin/users/${user.id}`
      );
      
      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        message: 'User created successfully'
      };
    } catch (error) {
      logger.error('Create user error:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(id, updateData, updaterId = null) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error('User not found');
      }
      
      const oldData = { ...user.toJSON() };
      await user.update(updateData);
      
      // Log update
      logger.info(`User ${id} updated by ${updaterId || 'system'}`);
      
      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        },
        message: 'User updated successfully'
      };
    } catch (error) {
      logger.error('Update user error:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(id, deleterId = null) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.role === 'admin') {
        const adminCount = await User.count({ where: { role: 'admin' } });
        if (adminCount <= 1) {
          throw new Error('Cannot delete the only admin user');
        }
      }
      
      await user.destroy();
      
      logger.info(`User ${id} deleted by ${deleterId || 'system'}`);
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      logger.error('Delete user error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }
      
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      user.password = newPassword;
      await user.save();
      
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  // Reset password (admin)
  async resetPassword(userId, newPassword = null) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const password = newPassword || 'password123';
      user.password = password;
      await user.save();
      
      return {
        success: true,
        message: `Password reset successfully. New password: ${password}`
      };
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }

  // Activate/deactivate user
  async toggleUserStatus(userId, isActive, actorId = null) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.role === 'admin' && !isActive) {
        const adminCount = await User.count({ where: { role: 'admin', isActive: true } });
        if (adminCount <= 1) {
          throw new Error('Cannot deactivate the only active admin user');
        }
      }
      
      await user.update({ isActive });
      
      const status = isActive ? 'activated' : 'deactivated';
      logger.info(`User ${userId} ${status} by ${actorId || 'system'}`);
      
      return {
        success: true,
        message: `User ${status} successfully`
      };
    } catch (error) {
      logger.error('Toggle user status error:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const total = await User.count();
      const active = await User.count({ where: { isActive: true } });
      const inactive = await User.count({ where: { isActive: false } });
      
      const byRole = {
        admin: await User.count({ where: { role: 'admin' } }),
        teacher: await User.count({ where: { role: 'teacher' } }),
        student: await User.count({ where: { role: 'student' } }),
        lab_manager: await User.count({ where: { role: 'lab_manager' } }),
        dean: await User.count({ where: { role: 'dean' } }),
        lab_assistant: await User.count({ where: { role: 'lab_assistant' } }),
        ict: await User.count({ where: { role: 'ict' } }),
        asset: await User.count({ where: { role: 'asset' } })
      };
      
      const recentUsers = await User.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt']
      });
      
      return {
        success: true,
        data: {
          total,
          active,
          inactive,
          byRole,
          recentUsers
        }
      };
    } catch (error) {
      logger.error('Get user stats error:', error);
      throw error;
    }
  }

  // Bulk import users
  async bulkImportUsers(usersData) {
    try {
      const results = { success: [], failed: [] };
      
      for (const userData of usersData) {
        try {
          const existingUser = await User.findOne({ where: { email: userData.email } });
          if (existingUser) {
            results.failed.push({ email: userData.email, reason: 'User already exists' });
            continue;
          }
          
          const user = await User.create({
            email: userData.email,
            password: userData.password || 'password123',
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role || 'student',
            phone: userData.phone,
            studentId: userData.studentId,
            department: userData.department
          });
          
          results.success.push({ email: user.email, id: user.id });
        } catch (error) {
          results.failed.push({ email: userData.email, reason: error.message });
        }
      }
      
      return {
        success: true,
        data: results,
        message: `Imported ${results.success.length} users, ${results.failed.length} failed`
      };
    } catch (error) {
      logger.error('Bulk import users error:', error);
      throw error;
    }
  }

  // Export users
  async exportUsers(filters = {}) {
    try {
      const users = await User.findAll({
        where: filters,
        attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'phone', 'studentId', 'department', 'isActive', 'createdAt'],
        order: [['createdAt', 'DESC']]
      });
      
      return { success: true, data: users };
    } catch (error) {
      logger.error('Export users error:', error);
      throw error;
    }
  }
}

module.exports = new UserService();