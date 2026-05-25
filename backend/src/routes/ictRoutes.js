const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSystemStatus,
  getMaintenanceRequests,
  assignMaintenance,
  startMaintenance,
  completeMaintenance,
  getComputers,
  updateComputerStatus,
  getNetworkStatus,
  updateNetworkDevice,
  getBackupStatus,
  performBackup,
  getSystemLogs,
  getMyAssignments,
  updateAssignmentStatus,
  getMyNotifications,
  updateProfile,
  changePassword
} = require('../controllers/ictController');
const { maintenanceValidation, idValidation } = require('../middleware/validation');

// All ICT routes require authentication and ict role
router.use(protect);
router.use(authorize('ict'));

// Dashboard & System Status
router.get('/dashboard', getSystemStatus);
router.get('/system/status', getSystemStatus);
router.get('/system/logs', getSystemLogs);

// Maintenance Management
router.get('/maintenance', getMaintenanceRequests);
router.patch('/maintenance/:id/assign', idValidation, maintenanceValidation.assign, assignMaintenance);
router.patch('/maintenance/:id/start', idValidation, startMaintenance);
router.patch('/maintenance/:id/complete', idValidation, maintenanceValidation.complete, completeMaintenance);

// Computer Management
router.get('/computers', getComputers);
router.patch('/computers/:id/status', updateComputerStatus);

// Network Management
router.get('/network/status', getNetworkStatus);
router.patch('/network/device/:id', updateNetworkDevice);

// Backup Management
router.get('/backup/status', getBackupStatus);
router.post('/backup/perform', performBackup);

// Assignments
router.get('/assignments', getMyAssignments);
router.patch('/assignments/:id/status', updateAssignmentStatus);

// Notifications
router.get('/notifications', getMyNotifications);

// Profile
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;