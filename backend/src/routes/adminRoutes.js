const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSystemStats,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  bulkImportUsers,
  exportUsers,
  getSystemSettings,
  updateSystemSettings,
  clearSystemCache,
  getSystemLogs
} = require('../controllers/adminController');
const { userValidation, idValidation, paginationValidation } = require('../middleware/validation');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', getSystemStats);

// User management
router.get('/users', paginationValidation, getAllUsers);
router.get('/users/export', exportUsers);
router.post('/users/bulk-import', bulkImportUsers);
router.get('/users/:id', idValidation, getUserById);
router.post('/users', userValidation.register, createUser);
router.put('/users/:id', idValidation, userValidation.updateProfile, updateUser);
router.delete('/users/:id', idValidation, deleteUser);
router.post('/users/:id/reset-password', idValidation, resetUserPassword);

// System management
router.get('/logs', getSystemLogs);
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);
router.post('/clear-cache', clearSystemCache);

module.exports = router;