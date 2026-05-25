const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { updateProfileImageByAdmin } = require('../controllers/userController');

router.put('/users/:id/profile-image', protect, authorize('admin'), updateProfileImageByAdmin);

module.exports = router;
