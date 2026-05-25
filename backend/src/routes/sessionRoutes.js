const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/sessionController');

router.get('/', protect, ctrl.getSessions);
router.post('/', protect, authorize('teacher'), ctrl.createSession);
router.put('/:id/start', protect, ctrl.startSession);
router.post('/mark', protect, ctrl.markAttendance);
router.post('/mark/bulk', protect, ctrl.bulkMarkAttendance);
router.get('/:id/report', protect, ctrl.getSessionReport);
router.get('/student/:studentId/summary', protect, ctrl.getStudentSummary);
router.post('/offline/sync', protect, ctrl.syncOffline);
router.post('/assign-assistant', protect, authorize('dean', 'lab_manager'), ctrl.assignAssistant);

module.exports = router;
