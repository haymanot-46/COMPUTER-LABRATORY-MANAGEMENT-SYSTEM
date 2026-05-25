const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyClasses,
  getTodayClasses,
  getMySchedules,
  markAttendance,
  getAttendanceByClass,
  getAttendanceReport,
  submitMaintenanceRequest,
  getAvailableComputers,
  bookLab,
  getMyBookings,
  cancelBooking,
  getMyNotifications,
  updateProfile,
  changePassword
} = require('../controllers/teacherController');
const { attendanceValidation, scheduleValidation, maintenanceValidation } = require('../middleware/validation');

// All teacher routes require authentication and teacher role
router.use(protect);
router.use(authorize('teacher'));

// Dashboard
router.get('/dashboard', getMyClasses);
router.get('/classes/today', getTodayClasses);

// Schedules
router.get('/schedules', getMySchedules);
router.post('/book-lab', scheduleValidation.create, bookLab);
router.get('/bookings', getMyBookings);
router.delete('/booking/:id', cancelBooking);

// Attendance
router.get('/attendance/class/:scheduleId', getAttendanceByClass);
router.post('/attendance/mark', attendanceValidation.mark, markAttendance);
router.get('/attendance/report', getAttendanceReport);

// Maintenance
router.post('/maintenance', maintenanceValidation.create, submitMaintenanceRequest);

// Computers
router.get('/computers/available', getAvailableComputers);

// Notifications
router.get('/notifications', getMyNotifications);

// Profile
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;