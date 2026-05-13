const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  generateAttendanceReport,
  generateEquipmentReport,
  generateMaintenanceReport,
  generateComputerReport,
  generateScheduleReport,
  getSavedReports,
  saveReport,
  deleteSavedReport,
  scheduleReport,
  getScheduledReports
} = require('../controllers/reportController');
const { dateRangeValidation } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// Report generation (Admin, Lab Manager, Dean)
router.post('/attendance', authorize('admin', 'lab_manager', 'dean'), dateRangeValidation, generateAttendanceReport);
router.post('/equipment', authorize('admin', 'asset'), generateEquipmentReport);
router.post('/maintenance', authorize('admin', 'lab_manager'), generateMaintenanceReport);
router.post('/computers', authorize('admin', 'lab_manager'), generateComputerReport);
router.post('/schedules', authorize('admin', 'lab_manager', 'dean'), generateScheduleReport);

// Saved reports management
router.get('/saved', getSavedReports);
router.post('/save', saveReport);
router.delete('/saved/:id', deleteSavedReport);

// Scheduled reports (Admin only)
router.get('/scheduled', authorize('admin'), getScheduledReports);
router.post('/schedule', authorize('admin'), scheduleReport);

module.exports = router;