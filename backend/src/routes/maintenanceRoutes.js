const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/maintenanceController');

router.get('/export', ctrl.exportMaintenance);
router.get('/statistics', protect, ctrl.getMaintenanceStats);
router.get('/', protect, ctrl.getMaintenanceRequests);
router.get('/:id', protect, ctrl.getMaintenanceById);
router.post('/', protect, ctrl.createMaintenance);
router.put('/:id', protect, ctrl.updateMaintenance);
router.patch('/:id/assign', protect, authorize('ict', 'admin'), ctrl.assignMaintenance);
router.patch('/:id/start', ctrl.startMaintenance);
router.patch('/:id/complete', protect, ctrl.completeMaintenance);
router.patch('/:id/cancel', protect, ctrl.cancelMaintenance);

module.exports = router;
