const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/reportController');

router.post('/attendance', ctrl.generateAttendanceReport);
router.post('/computers', ctrl.generateComputerReport);
router.post('/maintenance', ctrl.generateMaintenanceReport);
router.get('/saved', ctrl.getSavedReports);
router.post('/save', ctrl.saveReport);
router.delete('/saved/:id', ctrl.deleteSavedReport);
router.get('/export/:id', ctrl.exportSavedReport);
router.get('/scheduled', ctrl.getScheduledReports);
router.post('/schedule', ctrl.scheduleReport);
router.put('/scheduled/:id', ctrl.updateScheduledReport);
router.delete('/scheduled/:id', ctrl.deleteScheduledReport);
router.post('/scheduled/:id/run', ctrl.runScheduledReport);
router.get('/lab-utilization/export', ctrl.exportLabUtilization);
router.get('/lab-utilization', ctrl.getLabUtilization);
router.get('/course', ctrl.getCourseReport);
router.get('/department/export', ctrl.exportDepartmentReport);
router.get('/course/export', ctrl.exportCourseReport);
router.get('/department', ctrl.getDepartmentReport);
router.get('/stats', ctrl.getReportStats);
router.get('/attendance', ctrl.getAttendanceReportData);

module.exports = router;
