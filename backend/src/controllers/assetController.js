const { pool } = require('../config/database');

const getEquipment = async (req, res) => {
  try {
    const { category, status, laboratory_id, search, page = 1, limit = 20 } = req.query;
    let query = 'SELECT e.*, l.name as laboratory_name FROM equipment e LEFT JOIN laboratories l ON e.laboratory_id = l.id WHERE 1=1';
    const params = [];
    if (category) { query += ' AND e.category = ?'; params.push(category); }
    if (status) { query += ' AND e.status = ?'; params.push(status); }
    if (laboratory_id) { query += ' AND e.laboratory_id = ?'; params.push(laboratory_id); }
    if (search) { query += ' AND (e.name LIKE ? OR e.serial_number LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await pool.query(query, params);
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM equipment', []);
    res.json({ success: true, data: rows, pagination: { total: countResult[0].total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEquipmentById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT e.*, l.name as laboratory_name FROM equipment e LEFT JOIN laboratories l ON e.laboratory_id = l.id WHERE e.id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Equipment not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const registerEquipment = async (req, res) => {
  try {
    const { name, category, serial_number, model, manufacturer, laboratory_id, purchase_date, purchase_cost, warranty_expiry, condition, notes } = req.body;
    if (!name || !category) return res.status(400).json({ success: false, message: 'Name and category are required' });
    const allowedCategories = ['Computer', 'Monitor', 'UPS', 'Printer', 'Scanner', 'Projector', 'Router', 'Switch', 'Keyboard', 'Mouse', 'Speaker', 'Microphone', 'Webcam', 'Cable', 'Other'];
    if (!allowedCategories.includes(category)) return res.status(400).json({ success: false, message: 'This item category is outside the scope of this module' });
    const [result] = await pool.query(
      `INSERT INTO equipment (code, name, category, serial_number, model, manufacturer, laboratory_id, purchase_date, purchase_cost, warranty_expiry, \`condition\`, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, NOW())`,
      [`LAB-EQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`, name, category, serial_number || null, model || null, manufacturer || null, laboratory_id || null, purchase_date || null, purchase_cost || null, warranty_expiry || null, condition || 'good', notes || null]
    );
    res.status(201).json({ success: true, message: 'Equipment registered successfully', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEquipment = async (req, res) => {
  try {
    const { name, category, serial_number, model, manufacturer, laboratory_id, purchase_date, purchase_cost, warranty_expiry, condition, status, notes } = req.body;
    if (category) {
      const allowedCategories = ['Computer', 'Monitor', 'UPS', 'Printer', 'Scanner', 'Projector', 'Router', 'Switch', 'Keyboard', 'Mouse', 'Speaker', 'Microphone', 'Webcam', 'Cable', 'Other'];
      if (!allowedCategories.includes(category)) return res.status(400).json({ success: false, message: 'Invalid category' });
    }
    const [result] = await pool.query(
      `UPDATE equipment SET name=?, category=?, serial_number=?, model=?, manufacturer=?, laboratory_id=?, purchase_date=?, purchase_cost=?, warranty_expiry=?, \`condition\`=?, status=?, notes=? WHERE id=?`,
      [name, category, serial_number, model, manufacturer, laboratory_id, purchase_date, purchase_cost, warranty_expiry, condition, status, notes, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Equipment not found' });
    res.json({ success: true, message: 'Equipment updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteEquipment = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM equipment WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Equipment not found' });
    res.json({ success: true, message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEquipmentStats = async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as count FROM equipment');
    const [byCategory] = await pool.query('SELECT category, COUNT(*) as count FROM equipment GROUP BY category');
    const [byStatus] = await pool.query('SELECT status, COUNT(*) as count FROM equipment GROUP BY status');
    const [byCondition] = await pool.query('SELECT `condition`, COUNT(*) as count FROM equipment GROUP BY `condition`');
    res.json({ success: true, data: { total: total[0].count, byCategory, byStatus, byCondition } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getExpiringWarranties = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const [rows] = await pool.query(
      "SELECT * FROM equipment WHERE warranty_expiry IS NOT NULL AND warranty_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY) ORDER BY warranty_expiry ASC",
      [days]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBorrowRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT br.*, e.name as equipment_name, u.name as requester_name FROM borrow_requests br LEFT JOIN equipment e ON br.equipment_id = e.id LEFT JOIN users u ON br.requester_id = u.id WHERE 1=1';
    const params = [];
    if (status) { query += ' AND br.status = ?'; params.push(status); }
    query += ' ORDER BY br.created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

const approveBorrowRequest = async (req, res) => {
  try {
    await pool.query('UPDATE borrow_requests SET status = "approved", approved_by = ?, approved_at = NOW() WHERE id = ?', [req.user?.id, req.params.id]);
    res.json({ success: true, message: 'Request approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectBorrowRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    await pool.query('UPDATE borrow_requests SET status = "rejected", rejection_reason = ? WHERE id = ?', [reason || 'No reason', req.params.id]);
    res.json({ success: true, message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBorrowedEquipment = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT e.*, br.borrowed_at, br.expected_return, u.name as borrower_name FROM equipment e JOIN borrow_requests br ON e.id = br.equipment_id JOIN users u ON br.requester_id = u.id WHERE br.status = 'approved' AND br.returned_at IS NULL"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

const getBorrowHistory = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT br.*, e.name as equipment_name, u.name as requester_name FROM borrow_requests br LEFT JOIN equipment e ON br.equipment_id = e.id LEFT JOIN users u ON br.requester_id = u.id ORDER BY br.created_at DESC LIMIT 50'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

const conductAudit = async (req, res) => {
  try {
    const { laboratory_id, notes, items } = req.body;
    if (!laboratory_id) return res.status(400).json({ success: false, message: 'Laboratory ID required' });
    const [labResult] = await pool.query('SELECT * FROM laboratories WHERE id = ?', [laboratory_id]);
    if (!labResult.length) return res.status(404).json({ success: false, message: 'Laboratory not found' });
    const [result] = await pool.query(
      'INSERT INTO audits (laboratory_id, auditor, audit_date, total_items, present_items, missing_items, damaged_items, compliance_rate, status, notes, checklist_items) VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?)',
      [laboratory_id, req.user?.name || 'Asset Division', items?.length || 0, items?.length || 0, 0, 0, 100.00, 'completed', notes || null, items ? JSON.stringify(items) : null]
    );
    res.status(201).json({ success: true, message: 'Audit completed', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAuditHistory = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT a.*, l.name as laboratory_name FROM audits a LEFT JOIN laboratories l ON a.laboratory_id = l.id ORDER BY a.created_at DESC LIMIT 50');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

const getAuditSchedule = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM audits WHERE audit_date >= CURDATE() ORDER BY audit_date ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

const scheduleAudit = async (req, res) => {
  try {
    const { laboratory_id, audit_date } = req.body;
    if (!laboratory_id || !audit_date) return res.status(400).json({ success: false, message: 'Laboratory and date required' });
    const [result] = await pool.query('INSERT INTO audits (laboratory_id, auditor, audit_date, status) VALUES (?, ?, ?, ?)', [laboratory_id, req.user?.name || 'Asset Division', audit_date, 'scheduled']);
    res.status(201).json({ success: true, message: 'Audit scheduled', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const completeAudit = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, items } = req.body;
    await pool.query('UPDATE audits SET status = "completed", notes = ?, checklist_items = ?, audit_date = CURDATE() WHERE id = ?', [notes || null, items ? JSON.stringify(items) : null, id]);
    res.json({ success: true, message: 'Audit completed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAssetReports = async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as total, SUM(purchase_cost) as total_value FROM equipment');
    const [byCategory] = await pool.query('SELECT category, COUNT(*) as count, SUM(purchase_cost) as value FROM equipment GROUP BY category');
    const [byCondition] = await pool.query('SELECT `condition`, COUNT(*) as count FROM equipment GROUP BY `condition`');
    res.json({ success: true, data: { summary: total[0], byCategory, byCondition } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateAssetReport = async (req, res) => {
  try {
    const { type, format } = req.body;
    const [rows] = await pool.query('SELECT e.*, l.name as laboratory_name FROM equipment e LEFT JOIN laboratories l ON e.laboratory_id = l.id ORDER BY e.category, e.name');
    res.json({ success: true, data: rows, reportType: type, format: format || 'json' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportAssetData = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM equipment ORDER BY category, name');
    let csv = 'ID,Name,Category,Serial Number,Model,Manufacturer,Laboratory,Purchase Date,Purchase Cost,Warranty Expiry,Condition,Status,Notes\n';
    for (const r of rows) {
      csv += `${r.id},"${(r.name||'').replace(/"/g,'""')}","${r.category}","${(r.serial_number||'').replace(/"/g,'""')}","${(r.model||'').replace(/"/g,'""')}","${(r.manufacturer||'').replace(/"/g,'""')}",${r.laboratory_id || ''},${r.purchase_date || ''},${r.purchase_cost || ''},${r.warranty_expiry || ''},${r.condition || ''},${r.status || ''},"${(r.notes||'').replace(/"/g,'""')}"\n`;
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="equipment_export.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLowStockAlert = async (req, res) => {
  res.json({ success: true, data: [] });
};

const getMyNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 20', [req.user?.id || 0]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    await pool.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone, req.user?.id]);
    res.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEquipment, getEquipmentById, registerEquipment, updateEquipment, deleteEquipment,
  getEquipmentStats, getExpiringWarranties, getBorrowRequests, approveBorrowRequest,
  rejectBorrowRequest, getBorrowedEquipment, getBorrowHistory, conductAudit,
  getAuditHistory, getAuditSchedule, scheduleAudit, completeAudit, getAssetReports,
  generateAssetReport, exportAssetData, getLowStockAlert, getMyNotifications, updateProfile
};
