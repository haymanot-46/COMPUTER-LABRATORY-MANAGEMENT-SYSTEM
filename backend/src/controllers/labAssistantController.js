const { pool } = require('../config/database');

const getTodayTasks = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [schedules] = await pool.query(
      "SELECT s.*, l.name as laboratory_name FROM schedules s LEFT JOIN laboratories l ON s.laboratory_id = l.id WHERE DATE(s.start_time) = ? AND s.status IN ('approved','in-progress') ORDER BY s.start_time ASC",
      [today]
    );
    res.json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAssignedLabs = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT l.* FROM laboratories l JOIN schedules s ON s.laboratory_id = l.id WHERE s.requester_id = ? OR ? = 1 ORDER BY l.name',
      [req.user.id, req.user.role === 'admin' ? 1 : 0]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEquipmentStatus = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM equipment ORDER BY category, name');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEquipmentStatus = async (req, res) => {
  try {
    const { condition, status } = req.body;
    await pool.query('UPDATE equipment SET `condition` = ?, status = ? WHERE id = ?', [condition || 'good', status || 'available', req.params.id]);
    res.json({ success: true, message: 'Equipment status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLabComputers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM computers WHERE laboratory_id = ? ORDER BY workstation_number', [req.params.labId]);
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

const markAttendance = async (req, res) => {
  try {
    const { schedule_id, student_id, status } = req.body;
    if (!schedule_id || !student_id || !status) return res.status(400).json({ success: false, message: 'Missing required fields' });
    const [existing] = await pool.query('SELECT id FROM attendance WHERE schedule_id = ? AND student_id = ?', [schedule_id, student_id]);
    if (existing.length > 0) {
      await pool.query('UPDATE attendance SET status = ?, marked_by = ?, marked_at = NOW() WHERE schedule_id = ? AND student_id = ?', [status, req.user.id, schedule_id, student_id]);
    } else {
      await pool.query('INSERT INTO attendance (schedule_id, student_id, status, marked_by) VALUES (?, ?, ?, ?)', [schedule_id, student_id, status, req.user.id]);
    }
    res.json({ success: true, message: `Attendance marked as ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const bulkMarkAttendance = async (req, res) => {
  try {
    const { schedule_id, records } = req.body;
    if (!schedule_id || !records?.length) return res.status(400).json({ success: false, message: 'Schedule ID and records required' });
    for (const r of records) {
      const [existing] = await pool.query('SELECT id FROM attendance WHERE schedule_id = ? AND student_id = ?', [schedule_id, r.student_id]);
      if (existing.length > 0) {
        await pool.query('UPDATE attendance SET status = ?, marked_by = ?, marked_at = NOW() WHERE schedule_id = ? AND student_id = ?', [r.status, req.user.id, schedule_id, r.student_id]);
      } else {
        await pool.query('INSERT INTO attendance (schedule_id, student_id, status, marked_by) VALUES (?, ?, ?, ?)', [schedule_id, r.student_id, r.status, req.user.id]);
      }
    }
    res.json({ success: true, message: `Attendance saved for ${records.length} students` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAttendanceByLab = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT a.*, u.name as student_name, u.student_id FROM attendance a JOIN users u ON a.student_id = u.id WHERE a.schedule_id = ? ORDER BY u.name',
      [req.params.scheduleId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitMaintenanceRequest = async (req, res) => {
  try {
    const { title, description, priority, computer_id, laboratory_id } = req.body;
    if (!title || !description) return res.status(400).json({ success: false, message: 'Title and description required' });
    const [result] = await pool.query(
      'INSERT INTO maintenance_requests (title, issue_type, description, priority, computer_id, laboratory_id, requester_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, 'other', description, priority || 'medium', computer_id || null, laboratory_id || null, req.user.id, 'submitted']
    );
    res.status(201).json({ success: true, message: 'Request submitted', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMaintenanceRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT m.*, c.workstation_number as computer_name FROM maintenance_requests m LEFT JOIN computers c ON m.computer_id = c.id WHERE m.requester_id = ? ORDER BY m.created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const borrowEquipment = async (req, res) => {
  try {
    const { equipment_id, notes } = req.body;
    if (!equipment_id) return res.status(400).json({ success: false, message: 'Equipment ID required' });
    const [result] = await pool.query('INSERT INTO borrow_requests (equipment_id, requester_id, status, notes, created_at) VALUES (?, ?, ?, ?, NOW())',
      [equipment_id, req.user.id, 'pending', notes || null]);
    res.status(201).json({ success: true, message: 'Borrow request submitted', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const returnEquipment = async (req, res) => {
  try {
    const { condition } = req.body;
    await pool.query('UPDATE borrow_requests SET status = "returned", returned_at = NOW(), return_condition = ? WHERE id = ?', [condition || 'good', req.params.id]);
    res.json({ success: true, message: 'Equipment returned' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
  getTodayTasks, getAssignedLabs, getEquipmentStatus, updateEquipmentStatus,
  getLabComputers: async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM computers WHERE laboratory_id = ? ORDER BY workstation_number', [req.params.labId || req.query.labId]);
      res.json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  updateComputerStatus, markAttendance: markAttendance, bulkMarkAttendance,
  getAttendanceByLab, submitMaintenanceRequest, getMaintenanceRequests,
  borrowEquipment, returnEquipment, getMyNotifications,
  updateTaskStatus: async (req, res) => {
    try {
      const { status } = req.body;
      await pool.query('UPDATE schedules SET status = ?, updated_at = NOW() WHERE id = ?', [status, req.params.id]);
      res.json({ success: true, message: 'Task status updated' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
  },
  updateMaintenanceStatus: async (req, res) => {
    try {
      const { status, notes } = req.body;
      await pool.query('UPDATE maintenance_requests SET status = ?, notes = CONCAT(IFNULL(notes,?), ?), updated_at = NOW() WHERE id = ?',
        [status, notes ? `\n${notes}` : '', notes || '', req.params.id]);
      res.json({ success: true, message: 'Maintenance status updated' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
  },
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
