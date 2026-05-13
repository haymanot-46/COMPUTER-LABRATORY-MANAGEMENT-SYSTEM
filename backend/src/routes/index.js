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
const laboratoryRoutes = require('./laboratoryRoutes');
const adminRoutes = require('./adminRoutes');
const reportRoutes = require('./reportRoutes');
const notificationRoutes = require('./notificationRoutes');
const settingRoutes = require('./settingRoutes');

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