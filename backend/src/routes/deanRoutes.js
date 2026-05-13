// backend/src/routes/deanRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { scheduleValidation, idValidation, dateRangeValidation } = require('../middleware/validation');
const {
  getDepartmentStats,
  getDepartmentPerformance,
  getLabUtilization,
  getAttendanceOverview,
  getBatchSchedule,
  createBatchSchedule,
  approveBatchSchedule,
  getDepartmentReports,
  generateDepartmentReport,
  getPendingApprovals,
  approveSchedule,
  rejectSchedule,
  getFacultyList,
  getFacultyPerformance,
  getMyNotifications,
  updateProfile,
  changePassword
} = require('../controllers/deanController');  // This path is correct for src folder

// All dean routes require authentication and dean role
router.use(protect);
router.use(authorize('dean'));

// ============================================
// DASHBOARD ROUTES
// ============================================
router.get('/dashboard/stats', getDepartmentStats);
router.get('/dashboard/performance', getDepartmentPerformance);
router.get('/dashboard/lab-utilization', getLabUtilization);
router.get('/dashboard/attendance-overview', dateRangeValidation, getAttendanceOverview);

// ============================================
// BATCH SCHEDULE ROUTES
// ============================================
router.get('/batch-schedule', getBatchSchedule);
router.post('/batch-schedule', createBatchSchedule);
router.patch('/batch-schedule/:id/approve', idValidation, approveBatchSchedule);

// ============================================
// APPROVAL ROUTES
// ============================================
router.get('/pending-approvals', getPendingApprovals);
router.patch('/schedule/:id/approve', idValidation, scheduleValidation.approve, approveSchedule);
router.patch('/schedule/:id/reject', idValidation, scheduleValidation.reject, rejectSchedule);

// ============================================
// REPORT ROUTES
// ============================================
router.get('/reports', getDepartmentReports);
router.post('/reports/generate', generateDepartmentReport);

// ============================================
// FACULTY MANAGEMENT ROUTES
// ============================================
router.get('/faculty', getFacultyList);
router.get('/faculty/performance', getFacultyPerformance);

// ============================================
// NOTIFICATION ROUTES
// ============================================
router.get('/notifications', getMyNotifications);

// ============================================
// PROFILE ROUTES
// ============================================
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;