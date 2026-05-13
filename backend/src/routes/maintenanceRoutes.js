const express = require('express');
const router = express.Router();
const {
  getMaintenanceRequests,
  getMaintenanceRequestById,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  assignTechnician,
  startWork,
  completeRequest,
  cancelRequest,
  getMaintenanceStats
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');
const { maintenanceValidation, idValidation, paginationValidation } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// Public maintenance routes (authenticated users)
router.get('/', paginationValidation, getMaintenanceRequests);
router.get('/stats', getMaintenanceStats);
router.get('/:id', idValidation, getMaintenanceRequestById);

// Create request (any authenticated user)
router.post('/', maintenanceValidation.create, createMaintenanceRequest);
router.patch('/:id/cancel', idValidation, cancelRequest);

// Lab Manager routes
router.patch('/:id/assign', authorize('lab_manager'), idValidation, maintenanceValidation.assign, assignTechnician);

// ICT routes
router.patch('/:id/start', authorize('ict'), idValidation, startWork);
router.patch('/:id/complete', authorize('ict'), idValidation, maintenanceValidation.complete, completeRequest);

// Admin can do everything
router.put('/:id', authorize('admin'), idValidation, maintenanceValidation.create, updateMaintenanceRequest);

module.exports = router;