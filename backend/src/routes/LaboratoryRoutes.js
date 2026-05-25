const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/LaboratoryController');

router.get('/', ctrl.getLaboratories);
router.get('/:id', ctrl.getLaboratoryById);
router.post('/', protect, authorize('admin', 'lab_manager'), ctrl.createLaboratory);
router.put('/:id', protect, authorize('admin', 'lab_manager'), ctrl.updateLaboratory);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteLaboratory);

module.exports = router;
