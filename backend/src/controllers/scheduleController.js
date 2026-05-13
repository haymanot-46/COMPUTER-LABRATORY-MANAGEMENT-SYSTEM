const { pool } = require('../config/database');
const jwt = require('jsonwebtoken');

// Get all schedules
const getSchedules = async (req, res) => {
  try {
    const { startDate, endDate, lab, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        s.id,
        s.course_name as title,
        s.course_name,
        s.laboratory_id,
        l.name as lab,
        s.requester_id,
        u.name as instructor,
        s.start_time,
        s.end_time,
        s.expected_students,
        s.status,
        s.notes,
        DATE(s.start_time) as date,
        TIME(s.start_time) as startTime,
        TIME(s.end_time) as endTime
      FROM schedules s
      LEFT JOIN laboratories l ON s.laboratory_id = l.id
      LEFT JOIN users u ON s.requester_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (startDate && endDate) {
      query += ` AND DATE(s.start_time) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }
    if (lab) {
      query += ` AND s.laboratory_id = ?`;
      params.push(lab);
    }
    if (status) {
      query += ` AND s.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY s.start_time DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const [rows] = await pool.query(query, params);
    
    const transformedRows = rows.map(row => ({
      id: row.id,
      title: row.title,
      course_name: row.course_name,
      lab: row.lab || 'Unknown',
      lab_id: row.laboratory_id,
      date: row.date,
      startTime: row.startTime ? row.startTime.slice(0, 5) : null,
      endTime: row.endTime ? row.endTime.slice(0, 5) : null,
      instructor: row.instructor || 'Unknown',
      students: row.expected_students,
      status: row.status,
      description: row.notes
    }));
    
    res.json({ success: true, data: transformedRows });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get schedule by ID
const getScheduleById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.*,
        l.name as lab_name,
        u.name as requester_name
      FROM schedules s
      LEFT JOIN laboratories l ON s.laboratory_id = l.id
      LEFT JOIN users u ON s.requester_id = u.id
      WHERE s.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE SCHEDULE
const createSchedule = async (req, res) => {
  try {
    console.log('📥 Received schedule data:', JSON.stringify(req.body, null, 2));
    
    const { 
      course_name, 
      laboratory_id, 
      start_time, 
      end_time, 
      expected_students, 
      notes 
    } = req.body;
    
    if (!course_name) {
      return res.status(400).json({ success: false, message: 'Course name is required' });
    }
    if (!laboratory_id) {
      return res.status(400).json({ success: false, message: 'Laboratory ID is required' });
    }
    if (!start_time) {
      return res.status(400).json({ success: false, message: 'Start time is required' });
    }
    if (!end_time) {
      return res.status(400).json({ success: false, message: 'End time is required' });
    }
    
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    let requesterId;
    try {
      // FIXED: Hardcoded 'secret-key'
      const decoded = jwt.verify(token, 'secret-key');
      requesterId = decoded.id;
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    const [conflicts] = await pool.query(`
      SELECT id FROM schedules 
      WHERE laboratory_id = ? 
        AND status IN ('pending', 'approved')
        AND (
          (start_time BETWEEN ? AND ?) OR
          (end_time BETWEEN ? AND ?) OR
          (start_time <= ? AND end_time >= ?)
        )
    `, [laboratory_id, start_time, end_time, start_time, end_time, start_time, end_time]);
    
    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Schedule conflict! This time slot is already booked.',
        conflict: true
      });
    }
    
    const [result] = await pool.query(`
      INSERT INTO schedules (
        course_name,
        laboratory_id,
        requester_id,
        start_time,
        end_time,
        expected_students,
        status,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `, [course_name, laboratory_id, requesterId, start_time, end_time, expected_students || 0, notes || null]);
    
    console.log('✅ Schedule created! ID:', result.insertId);
    
    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('❌ Create schedule error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create schedule'
    });
  }
};

// Update schedule
const updateSchedule = async (req, res) => {
  try {
    const { course_name, laboratory_id, start_time, end_time, expected_students, notes } = req.body;
    
    await pool.query(`
      UPDATE schedules 
      SET course_name = ?, laboratory_id = ?, start_time = ?, end_time = ?, 
          expected_students = ?, notes = ?
      WHERE id = ?
    `, [course_name, laboratory_id, start_time, end_time, expected_students, notes, req.params.id]);
    
    res.json({ success: true, message: 'Schedule updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve schedule
const approveSchedule = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    // FIXED: Hardcoded 'secret-key'
    const decoded = jwt.verify(token, 'secret-key');
    
    await pool.query(`
      UPDATE schedules 
      SET status = 'approved', approver_id = ?
      WHERE id = ?
    `, [decoded.id, req.params.id]);
    
    res.json({ success: true, message: 'Schedule approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject schedule
const rejectSchedule = async (req, res) => {
  try {
    const { reason } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    // FIXED: Hardcoded 'secret-key'
    const decoded = jwt.verify(token, 'secret-key');
    
    await pool.query(`
      UPDATE schedules 
      SET status = 'rejected', rejection_reason = ?, approver_id = ?
      WHERE id = ?
    `, [reason, decoded.id, req.params.id]);
    
    res.json({ success: true, message: 'Schedule rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel schedule
const cancelSchedule = async (req, res) => {
  try {
    await pool.query('UPDATE schedules SET status = "cancelled" WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Schedule cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get my schedules - FIXED
const getMySchedules = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    // FIXED: Hardcoded 'secret-key'
    const decoded = jwt.verify(token, 'secret-key');
    
    const [rows] = await pool.query(`
      SELECT 
        s.id,
        s.course_name as title,
        l.name as lab,
        s.start_time,
        s.end_time,
        s.expected_students,
        s.status,
        DATE(s.start_time) as date,
        TIME(s.start_time) as startTime,
        TIME(s.end_time) as endTime
      FROM schedules s
      LEFT JOIN laboratories l ON s.laboratory_id = l.id
      WHERE s.requester_id = ?
      ORDER BY s.start_time DESC
    `, [decoded.id]);
    
    const transformedRows = rows.map(row => ({
      id: row.id,
      title: row.title,
      lab: row.lab,
      date: row.date,
      startTime: row.startTime ? row.startTime.slice(0, 5) : null,
      endTime: row.endTime ? row.endTime.slice(0, 5) : null,
      students: row.expected_students,
      status: row.status
    }));
    
    res.json({ success: true, data: transformedRows });
  } catch (error) {
    console.error('Get my schedules error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending approvals
const getPendingApprovals = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.id,
        s.course_name as title,
        l.name as lab,
        u.name as instructor,
        u.department,
        s.expected_students,
        s.notes as description,
        s.status,
        DATE(s.start_time) as date,
        TIME(s.start_time) as startTime,
        TIME(s.end_time) as endTime
      FROM schedules s
      LEFT JOIN laboratories l ON s.laboratory_id = l.id
      LEFT JOIN users u ON s.requester_id = u.id
      WHERE s.status = 'pending'
      ORDER BY s.created_at ASC
    `);
    
    const transformedRows = rows.map(row => ({
      id: row.id,
      title: row.title,
      lab: row.lab,
      date: row.date,
      startTime: row.startTime ? row.startTime.slice(0, 5) : null,
      endTime: row.endTime ? row.endTime.slice(0, 5) : null,
      instructor: row.instructor,
      department: row.department,
      students: row.expected_students,
      description: row.description,
      priority: 'medium'
    }));
    
    res.json({ success: true, data: transformedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check availability
const checkAvailability = async (req, res) => {
  try {
    const { lab_id, date, start_time, end_time } = req.query;
    const startDateTime = `${date} ${start_time}:00`;
    const endDateTime = `${date} ${end_time}:00`;
    
    const [conflicts] = await pool.query(`
      SELECT 
        id,
        course_name as title,
        DATE(start_time) as date,
        TIME(start_time) as startTime,
        TIME(end_time) as endTime
      FROM schedules
      WHERE laboratory_id = ?
        AND status IN ('pending', 'approved')
        AND (
          (start_time BETWEEN ? AND ?) OR
          (end_time BETWEEN ? AND ?) OR
          (start_time <= ? AND end_time >= ?)
        )
    `, [lab_id, startDateTime, endDateTime, startDateTime, endDateTime, startDateTime, endDateTime]);
    
    res.json({
      success: true,
      available: conflicts.length === 0,
      conflicts: conflicts.map(c => ({
        title: c.title,
        date: c.date,
        startTime: c.startTime ? c.startTime.slice(0, 5) : null,
        endTime: c.endTime ? c.endTime.slice(0, 5) : null
      }))
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get available time slots
const getAvailableTimeSlots = async (req, res) => {
  try {
    const { labId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }
    
    const allTimeSlots = [
      '08:00-10:00', '10:00-12:00', '12:00-14:00', 
      '14:00-16:00', '16:00-18:00', '18:00-20:00'
    ];
    
    const [bookedSlots] = await pool.query(`
      SELECT TIME(start_time) as startTime, TIME(end_time) as endTime
      FROM schedules
      WHERE laboratory_id = ? 
        AND DATE(start_time) = ?
        AND status IN ('pending', 'approved')
    `, [labId, date]);
    
    const bookedTimeStrings = bookedSlots.map(slot => {
      const start = slot.startTime ? slot.startTime.slice(0, 5) : '';
      const end = slot.endTime ? slot.endTime.slice(0, 5) : '';
      return `${start}-${end}`;
    });
    
    const availableSlots = allTimeSlots.filter(slot => !bookedTimeStrings.includes(slot));
    
    res.json({
      success: true,
      data: {
        date,
        labId,
        availableSlots,
        bookedSlots: bookedTimeStrings
      }
    });
  } catch (error) {
    console.error('Get available time slots error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Batch create schedules
const batchCreateSchedules = async (req, res) => {
  try {
    const { batchName, courses, labPreferences, startDate, endDate, daysOfWeek, timeSlots } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    // FIXED: Hardcoded 'secret-key'
    const decoded = jwt.verify(token, 'secret-key');
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
    const selectedDays = daysOfWeek.map(day => dayMap[day]);
    
    const scheduleDates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (selectedDays.includes(d.getDay())) {
        scheduleDates.push(new Date(d));
      }
    }
    
    let schedulesCreated = 0;
    
    for (const course of courses) {
      for (const date of scheduleDates) {
        for (const labId of labPreferences) {
          for (const timeSlot of timeSlots) {
            const [startTime, endTime] = timeSlot.split('-');
            const startDateTime = `${date.toISOString().split('T')[0]} ${startTime}:00`;
            const endDateTime = `${date.toISOString().split('T')[0]} ${endTime}:00`;
            
            await pool.query(`
              INSERT INTO schedules (
                course_name, laboratory_id, requester_id, 
                start_time, end_time, expected_students, batch_name, status
              ) VALUES (?, ?, ?, ?, ?, 30, ?, 'pending')
            `, [course, labId, decoded.id, startDateTime, endDateTime, batchName]);
            
            schedulesCreated++;
          }
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: `Batch schedule created! ${schedulesCreated} sessions scheduled.`,
      data: { count: schedulesCreated }
    });
  } catch (error) {
    console.error('Batch create schedules error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get schedule statistics
const getScheduleStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM schedules
    `);
    
    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Get schedule stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// EXPORT ALL FUNCTIONS
module.exports = {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  approveSchedule,
  rejectSchedule,
  cancelSchedule,
  getMySchedules,
  getPendingApprovals,
  checkAvailability,
  getAvailableTimeSlots,
  getScheduleStats,
  batchCreateSchedules
};