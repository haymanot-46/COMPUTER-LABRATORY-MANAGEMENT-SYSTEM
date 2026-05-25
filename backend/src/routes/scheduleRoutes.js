const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/scheduleController');

router.get('/', ctrl.getSchedules);
router.get('/my-schedules', protect, ctrl.getMySchedules);
router.get('/check-availability', ctrl.checkAvailability);
router.get('/export', ctrl.exportSchedules);
router.get('/courses', ctrl.getCourses);
router.get('/batches', ctrl.getBatches);
router.post('/', ctrl.createSchedule);
router.post('/batch', ctrl.batchCreateSchedules);
router.patch('/:id/approve', ctrl.approveSchedule);
router.patch('/:id/reject', ctrl.rejectSchedule);
router.patch('/:id/cancel', protect, ctrl.cancelSchedule);

module.exports = router;
