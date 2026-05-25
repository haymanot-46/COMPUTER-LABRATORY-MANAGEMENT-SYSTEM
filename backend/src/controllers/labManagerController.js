const { pool } = require('../config/database');

const getLabManagerDashboard = async (req, res) => {
  try {
    const [labs] = await pool.query('SELECT COUNT(*) as count FROM laboratories WHERE is_active = 1');
    const [computers] = await pool.query('SELECT COUNT(*) as count FROM computers');
    const [pendingMaintenance] = await pool.query("SELECT COUNT(*) as count FROM maintenance_requests WHERE status IN ('submitted','in-progress')");
    const [pendingSchedules] = await pool.query("SELECT COUNT(*) as count FROM schedules WHERE status = 'pending'");
    const [todaySchedules] = await pool.query(
      "SELECT COUNT(*) as count FROM schedules WHERE DATE(start_time) = CURDATE() AND status IN ('approved','in-progress')"
    );
    res.json({
      success: true,
      data: {
        activeLabs: labs[0].count,
        totalComputers: computers[0].count,
        pendingMaintenance: pendingMaintenance[0].count,
        pendingSchedules: pendingSchedules[0].count,
        todaySchedules: todaySchedules[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLabOverview = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT l.*, COUNT(c.id) as computer_count,
        SUM(CASE WHEN c.status = 'active' OR c.status = 'available' THEN 1 ELSE 0 END) as available_computers
      FROM laboratories l LEFT JOIN computers c ON c.laboratory_id = l.id
      GROUP BY l.id ORDER BY l.name
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLabStatistics = async (req, res) => {
  try {
    const [computerStats] = await pool.query('SELECT status, COUNT(*) as count FROM computers GROUP BY status');
    const [scheduleStats] = await pool.query('SELECT status, COUNT(*) as count FROM schedules GROUP BY status');
    const [maintenanceStats] = await pool.query('SELECT priority, COUNT(*) as count FROM maintenance_requests WHERE status IN ("submitted","in-progress") GROUP BY priority');
    res.json({ success: true, data: { computerStats, scheduleStats, maintenanceStats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLabUtilization = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const [rows] = await pool.query(`
      SELECT l.id, l.name, COUNT(s.id) as total_sessions,
        SUM(CASE WHEN s.status = 'completed' THEN 1 ELSE 0 END) as completed_sessions
      FROM laboratories l LEFT JOIN schedules s ON s.laboratory_id = l.id
        AND s.start_time >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY l.id ORDER BY l.name
    `, [days]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLaboratories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT l.*, COUNT(c.id) as computer_count FROM laboratories l LEFT JOIN computers c ON c.laboratory_id = l.id GROUP BY l.id ORDER BY l.name');
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getLaboratoryById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT l.*, COUNT(c.id) as computer_count FROM laboratories l LEFT JOIN computers c ON c.laboratory_id = l.id WHERE l.id = ? GROUP BY l.id', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const createLaboratory = async (req, res) => {
  try {
    const { name, code, building, floor, capacity, department, description } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code required' });
    const [existing] = await pool.query('SELECT id FROM laboratories WHERE code = ?', [code]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Code exists' });
    const [result] = await pool.query('INSERT INTO laboratories (name, code, building, floor, capacity, department, description, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [name, code, building || null, floor || null, capacity || 30, department || null, description || null]);
    res.status(201).json({ success: true, message: 'Lab created', data: { id: result.insertId } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const updateLaboratory = async (req, res) => {
  try {
    const { name, code, building, floor, capacity, department, description } = req.body;
    await pool.query('UPDATE laboratories SET name=?, code=?, building=?, floor=?, capacity=?, department=?, description=? WHERE id=?',
      [name, code, building, floor, capacity, department, description, req.params.id]);
    res.json({ success: true, message: 'Lab updated' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const deleteLaboratory = async (req, res) => {
  try {
    await pool.query('DELETE FROM laboratories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Lab deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getLabComputers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM computers WHERE laboratory_id = ? ORDER BY workstation_number', [req.params.labId || req.query.labId]);
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getLabEquipment = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM equipment WHERE laboratory_id = ? ORDER BY name', [req.params.labId || req.query.labId]);
    res.json({ success: true, data: rows });
  } catch (error) { res.json({ success: true, data: [] }); }
};

const getComputers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT c.*, l.name as laboratory_name FROM computers c LEFT JOIN laboratories l ON c.laboratory_id = l.id ORDER BY c.id DESC');
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getComputerById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT c.*, l.name as laboratory_name FROM computers c LEFT JOIN laboratories l ON c.laboratory_id = l.id WHERE c.id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getComputerStats = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT status, COUNT(*) as count FROM computers GROUP BY status');
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const addComputer = async (req, res) => {
  try {
    const { workstation_number, laboratory_id, ip_address, mac_address, specs, status } = req.body;
    if (!workstation_number || !laboratory_id) return res.status(400).json({ success: false, message: 'Workstation number and lab required' });
    const [result] = await pool.query('INSERT INTO computers (workstation_number, laboratory_id, ip_address, mac_address, specs, status) VALUES (?, ?, ?, ?, ?, ?)',
      [workstation_number, laboratory_id, ip_address || null, mac_address || null, specs || null, status || 'available']);
    res.status(201).json({ success: true, message: 'Computer added', data: { id: result.insertId } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const updateComputer = async (req, res) => {
  try {
    const { workstation_number, laboratory_id, ip_address, mac_address, specs, status } = req.body;
    await pool.query('UPDATE computers SET workstation_number=?, laboratory_id=?, ip_address=?, mac_address=?, specs=?, status=? WHERE id=?',
      [workstation_number, laboratory_id, ip_address, mac_address, specs, status, req.params.id]);
    res.json({ success: true, message: 'Computer updated' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const updateComputerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE computers SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Computer status updated' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const deleteComputer = async (req, res) => {
  try {
    await pool.query('DELETE FROM computers WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Computer deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getComputerMaintenanceHistory = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM maintenance_requests WHERE computer_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getSchedules = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT s.*, l.name as laboratory_name, u.name as requester_name FROM schedules s LEFT JOIN laboratories l ON s.laboratory_id = l.id LEFT JOIN users u ON s.requester_id = u.id ORDER BY s.start_time DESC'
    );
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getScheduleById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT s.*, l.name as laboratory_name, u.name as requester_name FROM schedules s LEFT JOIN laboratories l ON s.laboratory_id = l.id LEFT JOIN users u ON s.requester_id = u.id WHERE s.id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const approveSchedule = async (req, res) => {
  try {
    await pool.query('UPDATE schedules SET status = "approved", updated_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Schedule approved' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const rejectSchedule = async (req, res) => {
  try {
    const { reason } = req.body;
    await pool.query('UPDATE schedules SET status = "rejected", rejection_reason = ?, updated_at = NOW() WHERE id = ?', [reason || null, req.params.id]);
    res.json({ success: true, message: 'Schedule rejected' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const rescheduleLab = async (req, res) => {
  try {
    const { start_time, end_time } = req.body;
    await pool.query('UPDATE schedules SET start_time = ?, end_time = ?, status = "pending", updated_at = NOW() WHERE id = ?',
      [start_time, end_time, req.params.id]);
    res.json({ success: true, message: 'Schedule rescheduled' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const cancelSchedule = async (req, res) => {
  try {
    await pool.query('UPDATE schedules SET status = "cancelled", updated_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Schedule cancelled' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getPendingApprovals = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT s.*, l.name as laboratory_name, u.name as requester_name FROM schedules s LEFT JOIN laboratories l ON s.laboratory_id = l.id LEFT JOIN users u ON s.requester_id = u.id WHERE s.status = 'pending' ORDER BY s.start_time ASC"
    );
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getLabSchedule = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT s.*, l.name as laboratory_name, u.name as requester_name FROM schedules s LEFT JOIN laboratories l ON s.laboratory_id = l.id LEFT JOIN users u ON s.requester_id = u.id WHERE s.laboratory_id = ? ORDER BY s.start_time DESC',
      [req.params.labId]
    );
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getMaintenanceRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT m.*, c.workstation_number as computer_name, l.name as laboratory_name, u.name as requester_name FROM maintenance_requests m LEFT JOIN computers c ON m.computer_id = c.id LEFT JOIN laboratories l ON m.laboratory_id = l.id LEFT JOIN users u ON m.requester_id = u.id ORDER BY FIELD(m.priority,"critical","high","medium","low") ASC, m.created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getMaintenanceRequestById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT m.*, c.workstation_number as computer_name, l.name as laboratory_name, u.name as requester_name, a.name as assignee_name FROM maintenance_requests m LEFT JOIN computers c ON m.computer_id = c.id LEFT JOIN laboratories l ON m.laboratory_id = l.id LEFT JOIN users u ON m.requester_id = u.id LEFT JOIN users a ON m.assignee_id = a.id WHERE m.id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const assignTechnician = async (req, res) => {
  try {
    const { assignee_id } = req.body;
    await pool.query('UPDATE maintenance_requests SET assignee_id = ?, status = "assigned", updated_at = NOW() WHERE id = ?', [assignee_id, req.params.id]);
    res.json({ success: true, message: 'Technician assigned' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const updateMaintenancePriority = async (req, res) => {
  try {
    const { priority } = req.body;
    await pool.query('UPDATE maintenance_requests SET priority = ?, updated_at = NOW() WHERE id = ?', [priority, req.params.id]);
    res.json({ success: true, message: 'Priority updated' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getMaintenanceStats = async (req, res) => {
  try {
    const [byStatus] = await pool.query('SELECT status, COUNT(*) as count FROM maintenance_requests GROUP BY status');
    const [byPriority] = await pool.query('SELECT priority, COUNT(*) as count FROM maintenance_requests GROUP BY priority');
    res.json({ success: true, data: { byStatus, byPriority } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getAttendanceReports = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT a.*, u.name as student_name, u.student_id, s.laboratory_id, l.name as laboratory_name FROM attendance a JOIN users u ON a.student_id = u.id JOIN schedules s ON a.schedule_id = s.id LEFT JOIN laboratories l ON s.laboratory_id = l.id ORDER BY a.marked_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getLabAttendance = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT a.*, u.name as student_name, u.student_id FROM attendance a JOIN users u ON a.student_id = u.id JOIN schedules s ON a.schedule_id = s.id WHERE s.laboratory_id = ? ORDER BY a.marked_at DESC',
      [req.params.labId]
    );
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const generateLabReport = async (req, res) => {
  try {
    const { start_date, end_date, laboratory_id } = req.body;
    let query = 'SELECT * FROM schedules WHERE 1=1';
    const params = [];
    if (start_date) { query += ' AND start_time >= ?'; params.push(start_date); }
    if (end_date) { query += ' AND end_time <= ?'; params.push(end_date); }
    if (laboratory_id) { query += ' AND laboratory_id = ?'; params.push(laboratory_id); }
    query += ' ORDER BY start_time DESC';
    const [schedules] = await pool.query(query, params);
    const [summary] = await pool.query('SELECT status, COUNT(*) as count FROM schedules WHERE 1=1 GROUP BY status');
    res.json({ success: true, data: { schedules, summary } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const exportLabData = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT l.name as laboratory, s.title, s.start_time, s.end_time, s.status, u.name as requester FROM schedules s JOIN laboratories l ON s.laboratory_id = l.id LEFT JOIN users u ON s.requester_id = u.id ORDER BY s.start_time DESC'
    );
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getEquipment = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT e.*, l.name as laboratory_name FROM equipment e LEFT JOIN laboratories l ON e.laboratory_id = l.id ORDER BY e.category, e.name');
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getEquipmentById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT e.*, l.name as laboratory_name FROM equipment e LEFT JOIN laboratories l ON e.laboratory_id = l.id WHERE e.id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const requestEquipment = async (req, res) => {
  try {
    const { equipment_id, notes } = req.body;
    const [result] = await pool.query('INSERT INTO borrow_requests (equipment_id, requester_id, status, notes, created_at) VALUES (?, ?, "pending", ?, NOW())',
      [equipment_id, req.user.id, notes || null]);
    res.status(201).json({ success: true, message: 'Request submitted', data: { id: result.insertId } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const approveEquipmentRequest = async (req, res) => {
  try {
    await pool.query('UPDATE borrow_requests SET status = "approved", approved_by = ?, approved_at = NOW() WHERE id = ?', [req.user.id, req.params.id]);
    res.json({ success: true, message: 'Request approved' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getLabStaff = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT u.id, u.name, u.email, u.role FROM users u WHERE u.role IN ('lab_assistant','lab_manager','ict') ORDER BY u.name");
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const assignLabAssistant = async (req, res) => {
  try {
    const { user_id, laboratory_id, role } = req.body;
    await pool.query('INSERT INTO lab_assignments (user_id, laboratory_id, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE role = VALUES(role)', [user_id, laboratory_id, role || 'lab_assistant']);
    res.json({ success: true, message: 'Staff assigned' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getStaffSchedule = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT la.*, l.name as laboratory_name FROM lab_assignments la JOIN laboratories l ON la.laboratory_id = l.id WHERE la.user_id = ?',
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 50', [req.user.id]);
    res.json({ success: true, data: rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const sendNotification = async (req, res) => {
  try {
    const { user_id, title, message, type } = req.body;
    await pool.query('INSERT INTO notifications (user_id, title, message, type, created_at) VALUES (?, ?, ?, ?, NOW())', [user_id, title, message, type || 'info']);
    res.status(201).json({ success: true, message: 'Notification sent' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const markNotificationRead = async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getLabSettings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings WHERE id = 1');
    res.json({ success: true, data: rows[0] || {} });
  } catch (error) { res.json({ success: true, data: {} }); }
};

const updateLabSettings = async (req, res) => {
  try {
    const { name, value } = req.body;
    await pool.query('INSERT INTO settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)', [name, value]);
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    await pool.query('UPDATE users SET name = ?, email = ?, phone = ?, updated_at = NOW() WHERE id = ?', [name, email, phone, req.user.id]);
    res.json({ success: true, message: 'Profile updated' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const changePassword = async (req, res) => {
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
};

module.exports = {
  getLabManagerDashboard, getLabOverview, getLabStatistics, getLabUtilization,
  getLaboratories, getLaboratoryById, createLaboratory, updateLaboratory, deleteLaboratory,
  getLabComputers, getLabEquipment, getComputers, getComputerById,
  getComputerStats, addComputer, updateComputer, updateComputerStatus, deleteComputer, getComputerMaintenanceHistory,
  getSchedules, getScheduleById, approveSchedule, rejectSchedule, rescheduleLab, cancelSchedule,
  getPendingApprovals, getLabSchedule,
  getMaintenanceRequests, getMaintenanceRequestById, assignTechnician, updateMaintenancePriority, getMaintenanceStats,
  getAttendanceReports, getLabAttendance, generateLabReport, exportLabData,
  getEquipment, getEquipmentById, requestEquipment, approveEquipmentRequest,
  getLabStaff, assignLabAssistant, getStaffSchedule,
  getNotifications, sendNotification, markNotificationRead,
  getLabSettings, updateLabSettings, updateProfile, changePassword
};
