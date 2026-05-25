const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const studentRoutes = require('./studentRoutes');
const teacherRoutes = require('./teacherRoutes');
const labAssistantRoutes = require('./labAssistantRoutes');
const labManagerRoutes = require('./labManagerRoutes');  // Add this
const ictRoutes = require('./ictRoutes');
const assetRoutes = require('./assetRoutes');
const deanRoutes = require('./deanRoutes');
const computerRoutes = require('./computerRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const maintenanceRoutes = require('./maintenanceRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const laboratoryRoutes = require('./LaboratoryRoutes');
const adminRoutes = require('./adminRoutes');
const reportRoutes = require('./reportRoutes');
const notificationRoutes = require('./notificationRoutes');
const settingRoutes = require('./settingRoutes');
const contactRoutes = require('./contactRoutes');
const sessionRoutes = require('./sessionRoutes');
const equipmentRoutes = require('./equipmentRoutes');
const borrowingRoutes = require('./borrowingRoutes');
const auditRoutes = require('./auditRoutes');

// Register routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/student', studentRoutes);
router.use('/teacher', teacherRoutes);
router.use('/lab-assistant', labAssistantRoutes);
router.use('/lab-manager', labManagerRoutes);  // Add this
router.use('/ict', ictRoutes);
router.use('/asset', assetRoutes);
router.use('/dean', deanRoutes);
router.use('/computers', computerRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/laboratories', laboratoryRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', settingRoutes);
router.use('/contact', contactRoutes);
router.use('/sessions', sessionRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/borrowings', borrowingRoutes);
router.use('/audits', auditRoutes);

// Courses & Batches (used by schedule form dropdowns)
router.get('/courses', async (req, res) => {
  const courses = [
    { id: 1, name: 'Database Systems', code: 'CS311' },
    { id: 2, name: 'Computer Networks', code: 'CS312' },
    { id: 3, name: 'Software Engineering', code: 'CS313' },
    { id: 4, name: 'Web Development', code: 'CS314' },
    { id: 5, name: 'Data Structures', code: 'CS215' },
    { id: 6, name: 'Operating Systems', code: 'CS316' },
    { id: 7, name: 'C++ Programming', code: 'CS201' },
    { id: 8, name: 'Java Programming', code: 'CS202' },
  ];
  res.json({ success: true, data: courses });
});

router.get('/batches', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'CS 3rd Year - Batch A', semester: '1st Semester' },
      { id: 2, name: 'CS 3rd Year - Batch B', semester: '1st Semester' },
      { id: 3, name: 'CS 4th Year - Batch A', semester: '2nd Semester' },
      { id: 4, name: 'CS 4th Year - Batch B', semester: '2nd Semester' }
    ]
  });
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'CLMS API is running'
  });
});

module.exports = router;