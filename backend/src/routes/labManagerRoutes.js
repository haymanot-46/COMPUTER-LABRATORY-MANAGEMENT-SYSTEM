const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  // Dashboard & Overview
  getLabManagerDashboard,
  getLabOverview,
  getLabStatistics,
  getLabUtilization,
  
  // Laboratory Management
  getLaboratories,
  getLaboratoryById,
  createLaboratory,
  updateLaboratory,
  deleteLaboratory,
  getLabComputers,
  getLabEquipment,
  
  // Computer Management
  getComputers,
  getComputerById,
  getComputerStats,
  addComputer,
  updateComputer,
  updateComputerStatus,
  deleteComputer,
  getComputerMaintenanceHistory,
  
  // Schedule Management
  getSchedules,
  getScheduleById,
  approveSchedule,
  rejectSchedule,
  rescheduleLab,
  cancelSchedule,
  getPendingApprovals,
  getLabSchedule,
  
  // Maintenance Management
  getMaintenanceRequests,
  getMaintenanceRequestById,
  assignTechnician,
  updateMaintenancePriority,
  getMaintenanceStats,
  
  // Attendance & Reports
  getAttendanceReports,
  getLabAttendance,
  generateLabReport,
  exportLabData,
  
  // Equipment Management
  getEquipment,
  getEquipmentById,
  requestEquipment,
  approveEquipmentRequest,
  
  // Staff Management
  getLabStaff,
  assignLabAssistant,
  getStaffSchedule,
  
  // Notifications
  getNotifications,
  sendNotification,
  markNotificationRead,
  
  // Settings & Profile
  getLabSettings,
  updateLabSettings,
  updateProfile,
  changePassword
} = require('../controllers/labManagerController');
const { 
  computerValidation, 
  scheduleValidation, 
  maintenanceValidation,
  equipmentValidation,
  idValidation,
  paginationValidation,
  dateRangeValidation 
} = require('../middleware/validation');

// All lab manager routes require authentication and lab_manager role
router.use(protect);
router.use(authorize('lab_manager'));

// ============================================
// DASHBOARD & OVERVIEW
// ============================================
router.get('/dashboard', getLabManagerDashboard);
router.get('/overview', getLabOverview);
router.get('/statistics', getLabStatistics);
router.get('/utilization', getLabUtilization);

// ============================================
// LABORATORY MANAGEMENT
// ============================================
router.get('/laboratories', paginationValidation, getLaboratories);
router.get('/laboratories/stats', getLabStatistics);
router.get('/laboratories/:id', idValidation, getLaboratoryById);
router.post('/laboratories', createLaboratory);
router.put('/laboratories/:id', idValidation, updateLaboratory);
router.delete('/laboratories/:id', idValidation, deleteLaboratory);
router.get('/laboratories/:id/computers', idValidation, paginationValidation, getLabComputers);
router.get('/laboratories/:id/equipment', idValidation, getLabEquipment);

// ============================================
// COMPUTER MANAGEMENT
// ============================================
router.get('/computers', paginationValidation, getComputers);
router.get('/computers/stats', getComputerStats);
router.get('/computers/:id', idValidation, getComputerById);
router.post('/computers', computerValidation.create, addComputer);
router.put('/computers/:id', idValidation, computerValidation.create, updateComputer);
router.patch('/computers/:id/status', idValidation, computerValidation.updateStatus, updateComputerStatus);
router.delete('/computers/:id', idValidation, deleteComputer);
router.get('/computers/:id/maintenance', idValidation, getComputerMaintenanceHistory);

// ============================================
// SCHEDULE MANAGEMENT
// ============================================
router.get('/schedules', paginationValidation, dateRangeValidation, getSchedules);
router.get('/schedules/pending', getPendingApprovals);
router.get('/schedules/lab/:labId', idValidation, dateRangeValidation, getLabSchedule);
router.get('/schedules/:id', idValidation, getScheduleById);
router.patch('/schedules/:id/approve', idValidation, scheduleValidation.approve, approveSchedule);
router.patch('/schedules/:id/reject', idValidation, scheduleValidation.reject, rejectSchedule);
router.patch('/schedules/:id/reschedule', idValidation, scheduleValidation.create, rescheduleLab);
router.patch('/schedules/:id/cancel', idValidation, cancelSchedule);

// ============================================
// MAINTENANCE MANAGEMENT
// ============================================
router.get('/maintenance', paginationValidation, getMaintenanceRequests);
router.get('/maintenance/stats', getMaintenanceStats);
router.get('/maintenance/:id', idValidation, getMaintenanceRequestById);
router.patch('/maintenance/:id/assign', idValidation, maintenanceValidation.assign, assignTechnician);
router.patch('/maintenance/:id/priority', idValidation, updateMaintenancePriority);

// ============================================
// ATTENDANCE & REPORTS
// ============================================
router.get('/attendance/reports', dateRangeValidation, getAttendanceReports);
router.get('/attendance/lab/:labId', idValidation, dateRangeValidation, getLabAttendance);
router.post('/reports/generate', generateLabReport);
router.get('/reports/export', exportLabData);

// ============================================
// EQUIPMENT MANAGEMENT
// ============================================
router.get('/equipment', paginationValidation, getEquipment);
router.get('/equipment/:id', idValidation, getEquipmentById);
router.post('/equipment/request', equipmentValidation.borrow, requestEquipment);
router.patch('/equipment/request/:id/approve', idValidation, approveEquipmentRequest);

// ============================================
// STAFF MANAGEMENT
// ============================================
router.get('/staff', getLabStaff);
router.post('/staff/assign', assignLabAssistant);
router.get('/staff/schedule', getStaffSchedule);

// ============================================
// NOTIFICATIONS
// ============================================
router.get('/notifications', paginationValidation, getNotifications);
router.post('/notifications/send', sendNotification);
router.patch('/notifications/:id/read', idValidation, markNotificationRead);

// ============================================
// SETTINGS & PROFILE
// ============================================
router.get('/settings', getLabSettings);
router.put('/settings', updateLabSettings);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;