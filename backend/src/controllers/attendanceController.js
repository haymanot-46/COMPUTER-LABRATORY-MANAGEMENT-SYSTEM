const { Attendance, Schedule, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get attendance by schedule
// @route   GET /api/attendance/schedule/:scheduleId
// @access  Private/Teacher/LabAssistant
const getAttendanceBySchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    const schedule = await Schedule.findByPk(scheduleId);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    const attendance = await Attendance.findAll({
      where: { scheduleId },
      include: [{ model: User, as: 'student', attributes: ['id', 'firstName', 'lastName', 'studentId'] }]
    });
    
    res.json({
      success: true,
      data: {
        schedule,
        attendance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark attendance
// @route   POST /api/attendance/mark
// @access  Private/Teacher/LabAssistant
const markAttendance = async (req, res) => {
  try {
    const { scheduleId, attendance: attendanceData } = req.body;
    
    const schedule = await Schedule.findByPk(scheduleId);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    // Process each attendance record
    for (const record of attendanceData) {
      const [attendance, created] = await Attendance.upsert({
        scheduleId,
        studentId: record.studentId,
        studentName: record.studentName,
        studentNumber: record.studentNumber,
        status: record.status,
        notes: record.notes,
        markedBy: req.user.id,
        markedAt: new Date()
      });
    }
    
    res.json({
      success: true,
      message: 'Attendance saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my attendance
// @route   GET /api/attendance/my
// @access  Private/Student
const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findAll({
      where: { studentId: req.user.id },
      include: [{ model: Schedule, as: 'Schedule' }],
      order: [['createdAt', 'DESC']]
    });
    
    const summary = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      percentage: attendance.length > 0 
        ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) 
        : 0
    };
    
    res.json({
      success: true,
      data: { attendance, summary }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get attendance report
// @route   GET /api/attendance/report
// @access  Private/Teacher/LabManager/Dean
const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, course, lab } = req.query;
    
    let where = {};
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    
    const attendance = await Attendance.findAll({
      where,
      include: [
        { 
          model: Schedule, 
          as: 'Schedule',
          where: {
            ...(course && { course }),
            ...(lab && { lab })
          }
        }
      ]
    });
    
    // Group by course
    const byCourse = {};
    attendance.forEach(a => {
      const courseName = a.Schedule?.course || 'Unknown';
      if (!byCourse[courseName]) {
        byCourse[courseName] = { total: 0, present: 0, absent: 0, late: 0 };
      }
      byCourse[courseName].total++;
      byCourse[courseName][a.status]++;
    });
    
    res.json({
      success: true,
      data: {
        summary: {
          total: attendance.length,
          present: attendance.filter(a => a.status === 'present').length,
          absent: attendance.filter(a => a.status === 'absent').length,
          late: attendance.filter(a => a.status === 'late').length
        },
        byCourse,
        records: attendance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Sync offline attendance
// @route   POST /api/attendance/sync
// @access  Private/Teacher/LabAssistant
const syncOfflineAttendance = async (req, res) => {
  try {
    const { offlineData } = req.body;
    const results = [];
    
    for (const record of offlineData) {
      const [attendance, created] = await Attendance.upsert({
        scheduleId: record.scheduleId,
        studentId: record.studentId,
        studentName: record.studentName,
        studentNumber: record.studentNumber,
        status: record.status,
        notes: record.notes,
        markedBy: req.user.id,
        markedAt: new Date(record.markedAt || Date.now()),
        isSynced: true
      });
      
      results.push({ id: attendance.id, synced: true });
    }
    
    res.json({
      success: true,
      data: results,
      message: `Synced ${results.length} attendance records`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAttendanceBySchedule,
  markAttendance,
  getMyAttendance,
  getAttendanceReport,
  syncOfflineAttendance
};