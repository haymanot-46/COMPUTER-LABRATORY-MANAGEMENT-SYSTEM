const { User, Computer, Laboratory, MaintenanceRequest, Schedule, Equipment } = require('../models');
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs-extra');

const getSystemStats = async (req, res) => {
  try {
    const [userCount] = await pool.query('SELECT COUNT(*) as total FROM users');
    const [computerCount] = await pool.query('SELECT COUNT(*) as total FROM computers');
    const [labCount] = await pool.query('SELECT COUNT(*) as total FROM laboratories WHERE is_active = 1');
    const [maintenanceCount] = await pool.query('SELECT COUNT(*) as total FROM maintenance_requests WHERE status IN ("submitted","in-progress")');
    const [scheduleCount] = await pool.query('SELECT COUNT(*) as total FROM schedules WHERE status = "pending"');
    const [equipmentCount] = await pool.query('SELECT COUNT(*) as total FROM equipment');

    res.json({
      success: true,
      data: {
        totalUsers: userCount[0].total,
        totalComputers: computerCount[0].total,
        activeLabs: labCount[0].total,
        pendingMaintenance: maintenanceCount[0].total,
        pendingSchedules: scheduleCount[0].total,
        totalEquipment: equipmentCount[0].total
      }
    });
  } catch (error) {
    console.error('Error getting system stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT id, email, name, role, department, student_id, phone, profile_image,
             is_active, last_login, created_at, updated_at
      FROM users ORDER BY created_at DESC
    `);
    res.json({ success: true, data: users.map(u => ({
      ...u,
      status: u.is_active ? 'active' : 'inactive',
      is_active: undefined
    })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, name, role, department, student_id, phone, profile_image, is_active, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    const u = users[0];
    u.status = u.is_active ? 'active' : 'inactive';
    delete u.is_active;
    res.json({ success: true, data: u });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, name, password, role, department, phone, student_id, profile_image } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ success: false, message: 'Email, name, and password are required' });
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const dbRole = {
      'admin': 'admin', 'teacher': 'teacher', 'student': 'student',
      'lab_manager': 'lab_manager', 'lab-manager': 'lab_manager',
      'dean': 'dean', 'lab_assistant': 'lab_assistant',
      'lab-assistant': 'lab_assistant', 'ict': 'ict', 'asset': 'asset'
    }[role] || role;

    const [result] = await pool.query(
      'INSERT INTO users (email, name, password, role, department, phone, student_id, profile_image, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())',
      [email, name, hashedPassword, dbRole, department || null, phone || null, student_id || null, profile_image || null]
    );
    res.status(201).json({ success: true, message: 'User created successfully', data: { id: result.insertId, email, name, role: dbRole } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.sqlMessage || error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, phone, department, role, status } = req.body;
    const isActive = status === 'active' ? 1 : 0;
    await pool.query(
      'UPDATE users SET name=?, email=?, phone=?, department=?, role=?, is_active=? WHERE id=?',
      [name, email, phone || null, department || null, role, isActive, req.params.id]
    );
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const [adminCheck] = await pool.query('SELECT role FROM users WHERE id = ?', [req.params.id]);
    if (adminCheck[0]?.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin users' });
    }
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.params.id]);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const bulkImportUsers = async (req, res) => {
  try {
    const { users } = req.body;
    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ success: false, message: 'Users array is required' });
    }
    let imported = 0;
    for (const user of users) {
      if (!user.email || !user.name || !user.password) continue;
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [user.email]);
      if (existing.length > 0) continue;
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.query(
        'INSERT INTO users (email, name, password, role, department, phone, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, NOW())',
        [user.email, user.name, hashedPassword, user.role || 'student', user.department || null, user.phone || null]
      );
      imported++;
    }
    res.json({ success: true, message: `Imported ${imported} users successfully`, data: { imported } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, email, name, role, department, phone, is_active, created_at FROM users ORDER BY id');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSystemSettings = async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT * FROM settings ORDER BY `order` ASC');
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSystemSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({ success: false, message: 'Settings array is required' });
    }
    for (const s of settings) {
      if (s.id) {
        await pool.query('UPDATE settings SET value = ? WHERE id = ?', [s.value, s.id]);
      } else if (s.key_name) {
        await pool.query('INSERT INTO settings (key_name, value, type, category) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE value = ?',
          [s.key_name, s.value, s.type || 'string', s.category || 'system', s.value]);
      }
    }
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const clearSystemCache = async (req, res) => {
  try {
    if (global.cache) global.cache = {};
    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSystemLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const [logs] = await pool.query(
      'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?', [limit]
    );
    res.json({ success: true, data: logs });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

module.exports = {
  getSystemStats, getAllUsers, getUserById, createUser, updateUser, deleteUser,
  resetUserPassword, bulkImportUsers, exportUsers, getSystemSettings,
  updateSystemSettings, clearSystemCache, getSystemLogs
};
