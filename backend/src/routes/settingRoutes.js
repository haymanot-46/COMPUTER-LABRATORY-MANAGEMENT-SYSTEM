const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getSettings,
    getSetting,
    updateSetting,
    updateMultipleSettings,
    getSettingByCategory,
    resetSettings
} = require('../controllers/settingController');

// All routes require authentication
router.use(protect);

// Public settings (some settings may be public)
router.get('/', getSettings);
router.get('/category/:category', getSettingByCategory);
router.get('/:key', getSetting);

// Admin only routes
router.use(authorize('admin'));
router.put('/:key', updateSetting);
router.put('/multiple', updateMultipleSettings);
router.post('/reset', resetSettings);

module.exports = router;
