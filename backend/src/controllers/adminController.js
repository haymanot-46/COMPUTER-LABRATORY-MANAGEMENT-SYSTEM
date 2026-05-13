const { User, Computer, Schedule, MaintenanceRequest, Equipment, Attendance } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('../config/mail');
const { clearCache } = require('../config/redis');

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const totalComputers = await Computer.count();
    const totalSchedules = await Schedule.count();
    const pendingSchedules = await Schedule.count({ where: { status: 'pending' } });
    const totalMaintenance = await MaintenanceRequest.count();
    const pendingMaintenance = await MaintenanceRequest.count({ where: { status: { [Op.ne]: 'completed' } } });
    const totalEquipment = await Equipment.count();
    const totalAttendance = await Attendance.count();
    
    // User counts by role
    const usersByRole = {
      admin: await User.count({ where: { role: 'admin' } }),
      teacher: await User.count({ where: { role: 'teacher' } }),
      student: await User.count({ where: { role: 'student' } }),
      lab_manager: await User.count({ where: { role: 'lab_manager' } }),
      dean: await User.count({ where: { role: 'dean' } }),
      lab_assistant: await User.count({ where: { role: 'lab_assistant' } }),
      ict: await User.count({ where: { role: 'ict' } }),
      asset: await User.count({ where: { role: 'asset' } })
    };
    
    // Computer status counts
    const computerStatus = {
      available: await Computer.count({ where: { status: 'available' } }),
      inUse: await Computer.count({ where: { status: 'in-use' } }),
      maintenance: await Computer.count({ where: { status: 'maintenance' } }),
      damaged: await Computer.count({ where: { status: 'damaged' } })
    };
    
    // Schedule status counts
    const scheduleStatus = {
      pending: await Schedule.count({ where: { status: 'pending' } }),
      approved: await Schedule.count({ where: { status: 'approved' } }),
      completed: await Schedule.count({ where: { status: 'completed' } }),
      cancelled: await Schedule.count({ where: { status: 'cancelled' } })
    };
    
    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          byRole: usersByRole
        },
        computers: {
          total: totalComputers,
          status: computerStatus
        },
        schedules: {
          total: totalSchedules,
          status: scheduleStatus,
          pending: pendingSchedules
        },
        maintenance: {
          total: totalMaintenance,
          pending: pendingMaintenance
        },
        equipment: {
          total: totalEquipment
        },
        attendance: {
          total: totalAttendance
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users (with pagination and filters)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;
    
    let where = {};
    if (role) where.role = role;
    if (search) {
      where = {
        ...where,
        [Op.or]: [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { studentId: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]]
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone, studentId, department } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
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
    sendWelcomeEmail(email, `${firstName} ${lastName}`).catch(console.error);
    
    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      message: 'User created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const { firstName, lastName, phone, department, role, isActive, studentId } = req.body;
    
    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone || user.phone,
      department: department || user.department,
      role: role || user.role,
      isActive: isActive !== undefined ? isActive : user.isActive,
      studentId: studentId || user.studentId
    });
    
    // Clear user-related cache
    await clearCache(`user:${user.id}*`);
    
    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    await user.destroy();
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reset user password
// @route   POST /api/admin/users/:id/reset-password
// @access  Private/Admin
const resetUserPassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const newPassword = req.body.password || 'password123';
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: `Password reset successfully. New password: ${newPassword}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Bulk import users
// @route   POST /api/admin/users/bulk-import
// @access  Private/Admin
const bulkImportUsers = async (req, res) => {
  try {
    const { users } = req.body;
    
    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of users to import'
      });
    }
    
    const results = { successful: [], failed: [] };
    
    for (const userData of users) {
      try {
        const existingUser = await User.findOne({ where: { email: userData.email } });
        if (!existingUser) {
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
          results.successful.push({ email: user.email, id: user.id });
        } else {
          results.failed.push({ email: userData.email, reason: 'User already exists' });
        }
      } catch (error) {
        results.failed.push({ email: userData.email, reason: error.message });
      }
    }
    
    res.json({
      success: true,
      data: results,
      message: `Imported ${results.successful.length} users, ${results.failed.length} failed`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Export users to CSV
// @route   GET /api/admin/users/export
// @access  Private/Admin
const exportUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'phone', 'studentId', 'department', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    const csvRows = [
      ['ID', 'Email', 'First Name', 'Last Name', 'Role', 'Phone', 'Student ID', 'Department', 'Active', 'Created At']
    ];
    
    for (const user of users) {
      csvRows.push([
        user.id,
        user.email,
        user.firstName,
        user.lastName,
        user.role,
        user.phone || '',
        user.studentId || '',
        user.department || '',
        user.isActive ? 'Yes' : 'No',
        user.createdAt.toISOString().split('T')[0]
      ]);
    }
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSystemSettings = async (req, res) => {
  try {
    const settings = {
      systemName: 'CLMS - Computer Laboratory Management System',
      version: '2.0.0',
      maintenanceMode: false,
      allowRegistration: true,
      defaultUserRole: 'student',
      maxLoginAttempts: 5,
      sessionTimeout: 60,
      backupEnabled: true,
      backupSchedule: 'daily',
      emailNotifications: true
    };
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSystemSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    // In production, save to database
    res.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Clear system cache
// @route   POST /api/admin/clear-cache
// @access  Private/Admin
const clearSystemCache = async (req, res) => {
  try {
    await clearCache('*');
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private/Admin
const getSystemLogs = async (req, res) => {
  try {
    const recentUsers = await User.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt']
    });
    
    const recentSchedules = await Schedule.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']]
    });
    
    const recentMaintenance = await MaintenanceRequest.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: {
        recentUsers,
        recentSchedules,
        recentMaintenance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getSystemStats,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  bulkImportUsers,
  exportUsers,
  getSystemSettings,
  updateSystemSettings,
  clearSystemCache,
  getSystemLogs
};