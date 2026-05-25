const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/computerController');

router.get('/', ctrl.getComputers);
router.get('/:id', ctrl.getComputerById);
router.post('/', protect, authorize('admin', 'lab_manager'), ctrl.createComputer);
router.put('/:id', protect, authorize('admin', 'lab_manager', 'ict'), ctrl.updateComputer);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteComputer);

module.exports = router;
