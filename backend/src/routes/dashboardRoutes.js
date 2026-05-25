const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/dashboardController');

router.get('/admin/stats', protect, authorize('admin'), ctrl.getAdminStats);

module.exports = router;
