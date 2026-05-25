const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMySchedules,
  getMyAttendance,
  getMyAttendanceSummary,
  submitMaintenanceRequest,
  getAvailableComputers,
  borrowEquipment,
  getMyBorrowedEquipment,
  returnEquipment,
  getMyNotifications,
  updateProfile,
  changePassword
} = require('../controllers/studentController');
const { attendanceValidation, maintenanceValidation, equipmentValidation } = require('../middleware/validation');

// All student routes require authentication and student role
router.use(protect);
router.use(authorize('student'));

// Dashboard
router.get('/dashboard', getMyAttendanceSummary);

// Schedules
router.get('/schedules', getMySchedules);

// Attendance
router.get('/attendance', getMyAttendance);
router.get('/attendance/summary', getMyAttendanceSummary);

// Maintenance
router.post('/maintenance', maintenanceValidation.create, submitMaintenanceRequest);

// Computers
router.get('/computers/available', getAvailableComputers);

// Equipment Borrowing
router.get('/equipment/borrowed', getMyBorrowedEquipment);
router.post('/equipment/borrow/:id', equipmentValidation.borrow, borrowEquipment);
router.post('/equipment/return/:id', returnEquipment);

// Notifications
router.get('/notifications', getMyNotifications);

// Profile
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;