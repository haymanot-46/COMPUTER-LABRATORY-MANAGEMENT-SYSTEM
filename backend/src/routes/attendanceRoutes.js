const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/attendanceController');

router.get('/schedule/:scheduleId', ctrl.getAttendanceBySchedule);
router.get('/schedule/:scheduleId/students', ctrl.getScheduleStudents);
router.post('/mark', ctrl.markAttendanceApi);
router.post('/bulk', ctrl.bulkMarkAttendanceApi);
router.put('/:id', ctrl.updateAttendance);
router.get('/my', protect, ctrl.getMyAttendance);
router.get('/report', ctrl.getAttendanceReport);
router.get('/export', ctrl.exportAttendance);

module.exports = router;
