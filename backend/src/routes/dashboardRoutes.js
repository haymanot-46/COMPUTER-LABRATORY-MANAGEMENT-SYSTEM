const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAdminStats,
  getTeacherStats,
  getStudentStats,
  getLabManagerStats,
  getDeanStats,
  getICTStats,
  getAssetStats
} = require('../controllers/dashboardController');

// All routes require authentication
router.use(protect);

// Role-specific dashboard stats
router.get('/admin/stats', authorize('admin'), getAdminStats);
router.get('/teacher/stats', authorize('teacher'), getTeacherStats);
router.get('/student/stats', authorize('student'), getStudentStats);
router.get('/lab-manager/stats', authorize('lab_manager'), getLabManagerStats);
router.get('/dean/stats', authorize('dean'), getDeanStats);
router.get('/ict/stats', authorize('ict'), getICTStats);
router.get('/asset/stats', authorize('asset'), getAssetStats);

module.exports = router;