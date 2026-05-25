const express = require('express');
const router = express.Router();
const {
  register, login, changePassword,
  forgotPassword, resetPassword, verifyResetToken
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-reset-token/:token', verifyResetToken);

module.exports = router;
