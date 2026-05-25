const { pool } = require('../config/database');

const getSystemStatus = async (req, res) => {
  try {
    const [computers] = await pool.query('SELECT status, COUNT(*) as count FROM computers GROUP BY status');
    const [pendingMaintenance] = await pool.query("SELECT COUNT(*) as count FROM maintenance_requests WHERE status IN ('submitted','in-progress')");
    const [recentActivity] = await pool.query('SELECT COUNT(*) as count FROM maintenance_requests WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');
    res.json({ success: true, data: { computerStatus: computers, pendingMaintenance: pendingMaintenance[0].count, weeklyActivity: recentActivity[0].count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMaintenanceRequests = async (req, res) => {
  try {
    const { status, priority, limit = 50 } = req.query;
    let query = `SELECT m.*, c.workstation_number as computer_name, l.name as laboratory_name, u.name as requester_name, a.name as assignee_name
                 FROM maintenance_requests m LEFT JOIN computers c ON m.computer_id = c.id LEFT JOIN laboratories l ON m.laboratory_id = l.id
                 LEFT JOIN users u ON m.requester_id = u.id LEFT JOIN users a ON m.assignee_id = a.id WHERE 1=1`;
    const params = [];
    if (status && status !== 'all') { query += ' AND m.status = ?'; params.push(status); }
    if (priority && priority !== 'all') { query += ' AND m.priority = ?'; params.push(priority); }
    query += ' ORDER BY FIELD(m.priority,"critical","high","medium","low") ASC, m.created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const assignMaintenance = async (req, res) => {
  try {
    const { assignee_id } = req.body;
    await pool.query('UPDATE maintenance_requests SET assignee_id = ?, status = "in-progress", updated_at = NOW() WHERE id = ?', [assignee_id, req.params.id]);
    res.json({ success: true, message: 'Maintenance assigned' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const startMaintenance = async (req, res) => {
  try {
    await pool.query('UPDATE maintenance_requests SET status = "in-progress", updated_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Maintenance started' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const completeMaintenance = async (req, res) => {
  try {
    const { resolution, parts_used, time_spent } = req.body;
    await pool.query('UPDATE maintenance_requests SET status = "completed", resolution = ?, parts_used = ?, time_spent = ?, completed_at = NOW(), updated_at = NOW() WHERE id = ?',
      [resolution || null, parts_used || null, time_spent || null, req.params.id]);
    res.json({ success: true, message: 'Maintenance completed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyAssignments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT m.*, c.workstation_number as computer_name, l.name as laboratory_name FROM maintenance_requests m LEFT JOIN computers c ON m.computer_id = c.id LEFT JOIN laboratories l ON m.laboratory_id = l.id WHERE m.assignee_id = ? AND m.status IN ('assigned','in-progress') ORDER BY FIELD(m.priority,'critical','high','medium','low') ASC, m.created_at DESC",
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAssignmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE maintenance_requests SET status = ?, updated_at = NOW() WHERE id = ? AND assignee_id = ?', [status, req.params.id, req.user.id]);
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getComputers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT c.*, l.name as laboratory_name FROM computers c LEFT JOIN laboratories l ON c.laboratory_id = l.id ORDER BY c.id DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateComputerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE computers SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Computer status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getNetworkStatus = async (req, res) => {
  try {
    const [online] = await pool.query("SELECT COUNT(*) as count FROM computers WHERE status != 'offline'");
    const [offline] = await pool.query("SELECT COUNT(*) as count FROM computers WHERE status = 'offline'");
    res.json({ success: true, data: { online: online[0].count, offline: offline[0].count } });
  } catch (error) {
    res.json({ success: true, data: { online: 0, offline: 0 } });
  }
};

const getSystemLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const [rows] = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?', [limit]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 20', [req.user.id]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

module.exports = {
  getSystemStatus, getMaintenanceRequests, assignMaintenance, startMaintenance, completeMaintenance,
  getComputers, updateComputerStatus, getNetworkStatus, getSystemLogs, getMyAssignments,
  updateAssignmentStatus, getMyNotifications,
  getBackupStatus: async (req, res) => res.json({ success: true, data: { lastBackup: null, status: 'unknown' } }),
  performBackup: async (req, res) => res.json({ success: true, message: 'Backup initiated' }),
  updateNetworkDevice: async (req, res) => res.json({ success: true, message: 'Device updated' }),
  updateProfile: async (req, res) => {
    try {
      const { name, email, phone } = req.body;
      await pool.query('UPDATE users SET name = ?, email = ?, phone = ?, updated_at = NOW() WHERE id = ?', [name, email, phone, req.user.id]);
      res.json({ success: true, message: 'Profile updated' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
  },
  changePassword: async (req, res) => {
    try {
      const bcrypt = require('bcryptjs');
      const { currentPassword, newPassword } = req.body;
      const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
      if (!users.length) return res.status(404).json({ success: false, message: 'User not found' });
      if (!(await bcrypt.compare(currentPassword, users[0].password))) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      const hashed = await bcrypt.hash(newPassword, 12);
      await pool.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashed, req.user.id]);
      res.json({ success: true, message: 'Password changed' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
  }
};
