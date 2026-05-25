const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/borrowingController');

router.post('/', protect, authorize('asset'), ctrl.createBorrowing);
router.get('/my', protect, ctrl.getMyBorrowings);
router.get('/:id', protect, ctrl.getBorrowingById);
router.put('/:id/issue', protect, authorize('asset', 'admin'), ctrl.issueBorrowing);
router.put('/:id/return', protect, authorize('lab_assistant', 'asset'), ctrl.returnBorrowing);

module.exports = router;
