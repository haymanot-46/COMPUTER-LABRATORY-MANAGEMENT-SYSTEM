const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getTodayTasks,
  getAssignedLabs,
  updateTaskStatus,
  getEquipmentStatus,
  updateEquipmentStatus,
  getLabComputers,
  updateComputerStatus,
  markAttendance,
  getAttendanceByLab,
  submitMaintenanceRequest,
  getMaintenanceRequests,
  updateMaintenanceStatus,
  borrowEquipment,
  returnEquipment,
  getMyNotifications,
  updateProfile,
  changePassword
} = require('../controllers/labAssistantController');
const { attendanceValidation, maintenanceValidation, equipmentValidation } = require('../middleware/validation');

// All lab assistant routes require authentication and lab_assistant role
router.use(protect);
router.use(authorize('lab_assistant'));

// Dashboard & Tasks
router.get('/dashboard', getTodayTasks);
router.get('/tasks', getAssignedLabs);
router.patch('/tasks/:id/status', updateTaskStatus);

// Equipment Management
router.get('/equipment', getEquipmentStatus);
router.patch('/equipment/:id/status', updateEquipmentStatus);
router.post('/equipment/borrow/:id', equipmentValidation.borrow, borrowEquipment);
router.post('/equipment/return/:id', returnEquipment);

// Computer Management
router.get('/computers/lab/:labId', getLabComputers);
router.patch('/computers/:id/status', updateComputerStatus);

// Attendance
router.post('/attendance/take', attendanceValidation.mark, markAttendance);
router.get('/attendance/lab/:labId', getAttendanceByLab);

// Maintenance
router.get('/maintenance', getMaintenanceRequests);
router.post('/maintenance', maintenanceValidation.create, submitMaintenanceRequest);
router.patch('/maintenance/:id/status', updateMaintenanceStatus);

// Notifications
router.get('/notifications', getMyNotifications);

// Profile
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;