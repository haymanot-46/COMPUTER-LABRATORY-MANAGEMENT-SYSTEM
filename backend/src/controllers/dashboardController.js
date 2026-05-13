const { User, Computer, Schedule, MaintenanceRequest, Equipment, Attendance } = require('../models');
const { Op } = require('sequelize');

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalComputers = await Computer.count();
    const activeLabs = 5;
    const maintenanceRequests = await MaintenanceRequest.count({ where: { status: { [Op.ne]: 'completed' } } });
    const totalReports = 89;
    const storageUsed = '78%';
    const totalEquipment = await Equipment.count();
    const totalAudits = 24;
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalComputers,
        activeLabs,
        maintenanceRequests,
        totalReports,
        storageUsed,
        totalEquipment,
        totalAudits
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get teacher dashboard stats
// @route   GET /api/dashboard/teacher/stats
// @access  Private/Teacher
const getTeacherStats = async (req, res) => {
  try {
    const myClasses = 4;
    const totalStudents = 120;
    const pendingAttendance = 2;
    const labSessions = 6;
    
    res.json({
      success: true,
      data: {
        myClasses,
        totalStudents,
        pendingAttendance,
        labSessions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get student dashboard stats
// @route   GET /api/dashboard/student/stats
// @access  Private/Student
const getStudentStats = async (req, res) => {
  try {
    const attendance = '85%';
    const labSessions = 12;
    const completedLabs = 10;
    const absences = 2;
    
    res.json({
      success: true,
      data: {
        attendance,
        labSessions,
        completedLabs,
        absences
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get lab manager dashboard stats
// @route   GET /api/dashboard/lab-manager/stats
// @access  Private/LabManager
const getLabManagerStats = async (req, res) => {
  try {
    const laboratories = 5;
    const computers = await Computer.count();
    const activeSessions = await Schedule.count({ where: { status: 'approved', date: new Date() } });
    const maintenance = await MaintenanceRequest.count({ where: { status: 'pending' } });
    
    res.json({
      success: true,
      data: {
        laboratories,
        computers,
        activeSessions,
        maintenance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get dean dashboard stats
// @route   GET /api/dashboard/dean/stats
// @access  Private/Dean
const getDeanStats = async (req, res) => {
  try {
    const departments = 4;
    const students = await User.count({ where: { role: 'student' } });
    const labUtilization = '72%';
    const activeCourses = 28;
    
    res.json({
      success: true,
      data: {
        departments,
        students,
        labUtilization,
        activeCourses
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get ICT dashboard stats
// @route   GET /api/dashboard/ict/stats
// @access  Private/ICT
const getICTStats = async (req, res) => {
  try {
    const totalComputers = await Computer.count();
    const maintenanceRequests = await MaintenanceRequest.count({ where: { status: 'pending' } });
    const pendingAssignments = 3;
    const completedTasks = 45;
    
    res.json({
      success: true,
      data: {
        totalComputers,
        maintenanceRequests,
        pendingAssignments,
        completedTasks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get asset dashboard stats
// @route   GET /api/dashboard/asset/stats
// @access  Private/Asset
const getAssetStats = async (req, res) => {
  try {
    const totalEquipment = await Equipment.count();
    const active = await Equipment.count({ where: { status: 'available' } });
    const maintenance = await Equipment.count({ where: { status: 'maintenance' } });
    const totalValue = '2.4M ETB';
    
    res.json({
      success: true,
      data: {
        totalEquipment,
        active,
        maintenance,
        totalValue
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAdminStats,
  getTeacherStats,
  getStudentStats,
  getLabManagerStats,
  getDeanStats,
  getICTStats,
  getAssetStats
};