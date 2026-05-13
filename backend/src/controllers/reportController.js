const { User, Computer, Schedule, Attendance, MaintenanceRequest, Equipment, Laboratory } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// @desc    Generate attendance report
// @route   POST /api/reports/attendance
// @access  Private/Admin/LabManager/Dean
const generateAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, course, lab, department, format = 'json' } = req.body;
    
    let where = {};
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    
    const attendance = await Attendance.findAll({
      where,
      include: [
        { 
          model: Schedule, 
          as: 'Schedule',
          where: {
            ...(course && { course }),
            ...(lab && { lab }),
            ...(department && { department })
          }
        },
        { model: User, as: 'student', attributes: ['firstName', 'lastName', 'studentId'] }
      ]
    });
    
    // Calculate summary
    const summary = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      attendanceRate: attendance.length > 0 
        ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(2)
        : 0
    };
    
    // Group by course
    const byCourse = {};
    attendance.forEach(a => {
      const courseName = a.Schedule?.course || 'Unknown';
      if (!byCourse[courseName]) {
        byCourse[courseName] = { total: 0, present: 0, absent: 0, late: 0 };
      }
      byCourse[courseName].total++;
      byCourse[courseName][a.status]++;
    });
    
    const reportData = { summary, byCourse, records: attendance };
    
    // Handle different formats
    if (format === 'pdf') {
      return await exportAttendancePDF(reportData, res);
    } else if (format === 'excel') {
      return await exportAttendanceExcel(reportData, res);
    }
    
    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate equipment report
// @route   POST /api/reports/equipment
// @access  Private/Admin/Asset
const generateEquipmentReport = async (req, res) => {
  try {
    const { category, laboratory, condition, format = 'json' } = req.body;
    
    let where = {};
    if (category) where.category = category;
    if (laboratory) where.laboratory = laboratory;
    if (condition) where.condition = condition;
    
    const equipment = await Equipment.findAll({ where });
    
    const summary = {
      total: equipment.length,
      byCategory: {},
      byStatus: {
        available: equipment.filter(e => e.status === 'available').length,
        borrowed: equipment.filter(e => e.status === 'borrowed').length,
        maintenance: equipment.filter(e => e.status === 'maintenance').length,
        retired: equipment.filter(e => e.status === 'retired').length
      },
      byCondition: {
        excellent: equipment.filter(e => e.condition === 'excellent').length,
        good: equipment.filter(e => e.condition === 'good').length,
        fair: equipment.filter(e => e.condition === 'fair').length,
        poor: equipment.filter(e => e.condition === 'poor').length,
        damaged: equipment.filter(e => e.condition === 'damaged').length
      }
    };
    
    equipment.forEach(e => {
      if (!summary.byCategory[e.category]) {
        summary.byCategory[e.category] = 0;
      }
      summary.byCategory[e.category]++;
    });
    
    const reportData = { summary, records: equipment };
    
    if (format === 'pdf') {
      return await exportEquipmentPDF(reportData, res);
    } else if (format === 'excel') {
      return await exportEquipmentExcel(reportData, res);
    }
    
    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate maintenance report
// @route   POST /api/reports/maintenance
// @access  Private/Admin/LabManager
const generateMaintenanceReport = async (req, res) => {
  try {
    const { startDate, endDate, status, priority, format = 'json' } = req.body;
    
    let where = {};
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    if (status) where.status = status;
    if (priority) where.priority = priority;
    
    const maintenance = await MaintenanceRequest.findAll({
      where,
      include: [
        { model: Computer, as: 'Computer', attributes: ['name', 'model', 'lab'] },
        { model: User, as: 'requester', attributes: ['firstName', 'lastName'] }
      ]
    });
    
    const summary = {
      total: maintenance.length,
      byStatus: {
        pending: maintenance.filter(m => m.status === 'pending').length,
        assigned: maintenance.filter(m => m.status === 'assigned').length,
        inProgress: maintenance.filter(m => m.status === 'in-progress').length,
        completed: maintenance.filter(m => m.status === 'completed').length,
        cancelled: maintenance.filter(m => m.status === 'cancelled').length
      },
      byPriority: {
        low: maintenance.filter(m => m.priority === 'low').length,
        medium: maintenance.filter(m => m.priority === 'medium').length,
        high: maintenance.filter(m => m.priority === 'high').length,
        urgent: maintenance.filter(m => m.priority === 'urgent').length
      },
      averageCompletionTime: calculateAverageCompletionTime(maintenance)
    };
    
    const reportData = { summary, records: maintenance };
    
    if (format === 'pdf') {
      return await exportMaintenancePDF(reportData, res);
    } else if (format === 'excel') {
      return await exportMaintenanceExcel(reportData, res);
    }
    
    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate computer inventory report
// @route   POST /api/reports/computers
// @access  Private/Admin/LabManager
const generateComputerReport = async (req, res) => {
  try {
    const { lab, status, format = 'json' } = req.body;
    
    let where = {};
    if (lab) where.lab = lab;
    if (status) where.status = status;
    
    const computers = await Computer.findAll({ where });
    
    const summary = {
      total: computers.length,
      byStatus: {
        available: computers.filter(c => c.status === 'available').length,
        inUse: computers.filter(c => c.status === 'in-use').length,
        maintenance: computers.filter(c => c.status === 'maintenance').length,
        damaged: computers.filter(c => c.status === 'damaged').length
      },
      byLab: {}
    };
    
    computers.forEach(c => {
      if (!summary.byLab[c.lab]) {
        summary.byLab[c.lab] = 0;
      }
      summary.byLab[c.lab]++;
    });
    
    const reportData = { summary, records: computers };
    
    if (format === 'pdf') {
      return await exportComputerPDF(reportData, res);
    } else if (format === 'excel') {
      return await exportComputerExcel(reportData, res);
    }
    
    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate schedule report
// @route   POST /api/reports/schedules
// @access  Private/Admin/LabManager/Dean
const generateScheduleReport = async (req, res) => {
  try {
    const { startDate, endDate, lab, status, format = 'json' } = req.body;
    
    let where = {};
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }
    if (lab) where.lab = lab;
    if (status) where.status = status;
    
    const schedules = await Schedule.findAll({
      where,
      include: [{ model: User, as: 'requester', attributes: ['firstName', 'lastName'] }]
    });
    
    const summary = {
      total: schedules.length,
      byStatus: {
        pending: schedules.filter(s => s.status === 'pending').length,
        approved: schedules.filter(s => s.status === 'approved').length,
        completed: schedules.filter(s => s.status === 'completed').length,
        cancelled: schedules.filter(s => s.status === 'cancelled').length
      },
      byLab: {},
      upcoming: schedules.filter(s => s.date >= new Date().toISOString().split('T')[0]).length
    };
    
    schedules.forEach(s => {
      if (!summary.byLab[s.lab]) {
        summary.byLab[s.lab] = 0;
      }
      summary.byLab[s.lab]++;
    });
    
    const reportData = { summary, records: schedules };
    
    if (format === 'pdf') {
      return await exportSchedulePDF(reportData, res);
    } else if (format === 'excel') {
      return await exportScheduleExcel(reportData, res);
    }
    
    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper functions for PDF/Excel exports
const calculateAverageCompletionTime = (maintenance) => {
  const completed = maintenance.filter(m => m.completedAt && m.createdAt);
  if (completed.length === 0) return 0;
  
  const totalHours = completed.reduce((sum, m) => {
    const hours = (new Date(m.completedAt) - new Date(m.createdAt)) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);
  
  return (totalHours / completed.length).toFixed(2);
};

const exportAttendancePDF = async (data, res) => {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.pdf');
  doc.pipe(res);
  
  doc.fontSize(20).text('Attendance Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown();
  doc.text(`Total Records: ${data.summary.total}`);
  doc.text(`Present: ${data.summary.present}`);
  doc.text(`Absent: ${data.summary.absent}`);
  doc.text(`Late: ${data.summary.late}`);
  doc.text(`Attendance Rate: ${data.summary.attendanceRate}%`);
  doc.end();
};

const exportAttendanceExcel = async (data, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance Report');
  
  worksheet.columns = [
    { header: 'Student Name', key: 'studentName', width: 20 },
    { header: 'Student ID', key: 'studentId', width: 15 },
    { header: 'Course', key: 'course', width: 20 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Status', key: 'status', width: 10 }
  ];
  
  data.records.forEach(record => {
    worksheet.addRow({
      studentName: record.studentName,
      studentId: record.studentNumber,
      course: record.Schedule?.course,
      date: record.createdAt.toISOString().split('T')[0],
      status: record.status
    });
  });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.xlsx');
  await workbook.xlsx.write(res);
  res.end();
};

const exportEquipmentPDF = async (data, res) => {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=equipment_report.pdf');
  doc.pipe(res);
  
  doc.fontSize(20).text('Equipment Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown();
  doc.text(`Total Equipment: ${data.summary.total}`);
  doc.text(`Available: ${data.summary.byStatus.available}`);
  doc.text(`Borrowed: ${data.summary.byStatus.borrowed}`);
  doc.text(`Maintenance: ${data.summary.byStatus.maintenance}`);
  doc.end();
};

const exportEquipmentExcel = async (data, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Equipment Report');
  
  worksheet.columns = [
    { header: 'Code', key: 'code', width: 15 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Laboratory', key: 'laboratory', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Condition', key: 'condition', width: 12 }
  ];
  
  data.records.forEach(record => {
    worksheet.addRow({
      code: record.code,
      name: record.name,
      category: record.category,
      laboratory: record.laboratory,
      status: record.status,
      condition: record.condition
    });
  });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=equipment_report.xlsx');
  await workbook.xlsx.write(res);
  res.end();
};

const exportMaintenancePDF = async (data, res) => {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=maintenance_report.pdf');
  doc.pipe(res);
  
  doc.fontSize(20).text('Maintenance Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown();
  doc.text(`Total Requests: ${data.summary.total}`);
  doc.text(`Pending: ${data.summary.byStatus.pending}`);
  doc.text(`In Progress: ${data.summary.byStatus.inProgress}`);
  doc.text(`Completed: ${data.summary.byStatus.completed}`);
  doc.text(`Average Completion Time: ${data.summary.averageCompletionTime} hours`);
  doc.end();
};

const exportMaintenanceExcel = async (data, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Maintenance Report');
  
  worksheet.columns = [
    { header: 'Title', key: 'title', width: 25 },
    { header: 'Computer', key: 'computer', width: 20 },
    { header: 'Lab', key: 'lab', width: 10 },
    { header: 'Issue Type', key: 'issueType', width: 15 },
    { header: 'Priority', key: 'priority', width: 10 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Reported By', key: 'reportedBy', width: 20 }
  ];
  
  data.records.forEach(record => {
    worksheet.addRow({
      title: record.title,
      computer: record.Computer?.name,
      lab: record.lab,
      issueType: record.issueType,
      priority: record.priority,
      status: record.status,
      reportedBy: record.reportedBy
    });
  });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=maintenance_report.xlsx');
  await workbook.xlsx.write(res);
  res.end();
};

const exportComputerPDF = async (data, res) => {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=computer_report.pdf');
  doc.pipe(res);
  
  doc.fontSize(20).text('Computer Inventory Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown();
  doc.text(`Total Computers: ${data.summary.total}`);
  doc.text(`Available: ${data.summary.byStatus.available}`);
  doc.text(`In Use: ${data.summary.byStatus.inUse}`);
  doc.text(`Maintenance: ${data.summary.byStatus.maintenance}`);
  doc.end();
};

const exportComputerExcel = async (data, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Computer Report');
  
  worksheet.columns = [
    { header: 'Name', key: 'name', width: 15 },
    { header: 'Model', key: 'model', width: 20 },
    { header: 'Lab', key: 'lab', width: 10 },
    { header: 'CPU', key: 'cpu', width: 15 },
    { header: 'RAM', key: 'ram', width: 10 },
    { header: 'Storage', key: 'storage', width: 12 },
    { header: 'Status', key: 'status', width: 12 }
  ];
  
  data.records.forEach(record => {
    worksheet.addRow({
      name: record.name,
      model: record.model,
      lab: record.lab,
      cpu: record.cpu,
      ram: record.ram,
      storage: record.storage,
      status: record.status
    });
  });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=computer_report.xlsx');
  await workbook.xlsx.write(res);
  res.end();
};

const exportSchedulePDF = async (data, res) => {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=schedule_report.pdf');
  doc.pipe(res);
  
  doc.fontSize(20).text('Schedule Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown();
  doc.text(`Total Schedules: ${data.summary.total}`);
  doc.text(`Approved: ${data.summary.byStatus.approved}`);
  doc.text(`Pending: ${data.summary.byStatus.pending}`);
  doc.text(`Completed: ${data.summary.byStatus.completed}`);
  doc.end();
};

const exportScheduleExcel = async (data, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Schedule Report');
  
  worksheet.columns = [
    { header: 'Title', key: 'title', width: 25 },
    { header: 'Course', key: 'course', width: 20 },
    { header: 'Lab', key: 'lab', width: 10 },
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Start Time', key: 'startTime', width: 10 },
    { header: 'End Time', key: 'endTime', width: 10 },
    { header: 'Status', key: 'status', width: 12 }
  ];
  
  data.records.forEach(record => {
    worksheet.addRow({
      title: record.title,
      course: record.course,
      lab: record.lab,
      date: record.date,
      startTime: record.startTime,
      endTime: record.endTime,
      status: record.status
    });
  });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=schedule_report.xlsx');
  await workbook.xlsx.write(res);
  res.end();
};

module.exports = {
  generateAttendanceReport,
  generateEquipmentReport,
  generateMaintenanceReport,
  generateComputerReport,
  generateScheduleReport
};