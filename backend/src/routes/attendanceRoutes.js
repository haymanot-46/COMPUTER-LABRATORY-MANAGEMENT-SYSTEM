const express = require('express');
const router = express.Router();
const {
  getAttendanceBySchedule,
  markAttendance,
  getMyAttendance,
  getAttendanceReport,
  syncOfflineAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');
const { attendanceValidation, idValidation, dateRangeValidation } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// Teacher and Lab Assistant routes
router.get('/schedule/:scheduleId', authorize('teacher', 'lab_assistant'), idValidation, getAttendanceBySchedule);
router.post('/mark', authorize('teacher', 'lab_assistant'), attendanceValidation.mark, markAttendance);
router.post('/sync', authorize('teacher', 'lab_assistant'), syncOfflineAttendance);

// Student routes
router.get('/my', getMyAttendance);

// Report routes (Teacher, Lab Manager, Dean)
router.get('/report', authorize('teacher', 'lab_manager', 'dean'), dateRangeValidation, getAttendanceReport);

module.exports = router;