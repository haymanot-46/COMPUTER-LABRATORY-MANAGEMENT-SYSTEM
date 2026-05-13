const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotification,
  getUnreadCount
} = require('../src/controllers/notificationController');
const { idValidation, paginationValidation } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// Notification management
router.get('/', paginationValidation, getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', idValidation, markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:id', idValidation, deleteNotification);

// Send notification (Admin only)
router.post('/send', sendNotification);

module.exports = router;