const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  // Equipment Management
  getEquipment,
  getEquipmentById,
  registerEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentStats,
  getExpiringWarranties,
  
  // Borrowing Management
  getBorrowRequests,
  approveBorrowRequest,
  rejectBorrowRequest,
  getBorrowedEquipment,
  getBorrowHistory,
  
  // Audit Management
  conductAudit,
  getAuditHistory,
  getAuditSchedule,
  scheduleAudit,
  completeAudit,
  
  // Reports
  getAssetReports,
  generateAssetReport,
  exportAssetData,
  
  // Dashboard
  getAssetDashboard,
  getLowStockAlert,
  
  // Notifications
  getMyNotifications,
  
  // Profile
  updateProfile,
  changePassword
} = require('../controllers/assetController');
const { equipmentValidation, idValidation, paginationValidation } = require('../middleware/validation');

// All asset routes require authentication and asset role
router.use(protect);
router.use(authorize('asset'));

// Dashboard
router.get('/dashboard', getAssetDashboard);
router.get('/stats', getEquipmentStats);
router.get('/alerts/low-stock', getLowStockAlert);

// Equipment Management
router.get('/equipment', paginationValidation, getEquipment);
router.get('/equipment/warranty/expiring', getExpiringWarranties);
router.get('/equipment/:id', idValidation, getEquipmentById);
router.post('/equipment', equipmentValidation.create, registerEquipment);
router.put('/equipment/:id', idValidation, equipmentValidation.create, updateEquipment);
router.delete('/equipment/:id', idValidation, deleteEquipment);

// Borrowing Management
router.get('/borrow/requests', getBorrowRequests);
router.get('/borrow/active', getBorrowedEquipment);
router.get('/borrow/history', getBorrowHistory);
router.post('/borrow/:id/approve', idValidation, approveBorrowRequest);
router.post('/borrow/:id/reject', idValidation, rejectBorrowRequest);

// Audit Management
router.get('/audit/history', getAuditHistory);
router.get('/audit/schedule', getAuditSchedule);
router.post('/audit', conductAudit);
router.post('/audit/schedule', scheduleAudit);
router.post('/audit/:id/complete', idValidation, completeAudit);

// Reports
router.get('/reports', getAssetReports);
router.post('/reports/generate', generateAssetReport);
router.get('/export', exportAssetData);

// Notifications
router.get('/notifications', getMyNotifications);

// Profile
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;