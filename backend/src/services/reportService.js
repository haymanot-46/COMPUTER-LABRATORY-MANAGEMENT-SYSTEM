const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');
const { Attendance, Schedule, Computer, MaintenanceRequest, Equipment, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

const REPORTS_PATH = path.join(__dirname, '../generated_reports');
fs.ensureDirSync(REPORTS_PATH);

class ReportService {
  // Generate attendance report
  async generateAttendanceReport(filters, format = 'json') {
    try {
      const { startDate, endDate, course, lab, department } = filters;
      
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
      
      const summary = {
        total: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length,
        attendanceRate: attendance.length > 0 
          ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(2)
          : 0
      };
      
      const reportData = { summary, records: attendance };
      
      if (format === 'excel') {
        return await this.exportToExcel(reportData, 'attendance_report');
      } else if (format === 'pdf') {
        return await this.exportToPDF(reportData, 'attendance_report');
      }
      
      return { success: true, data: reportData };
    } catch (error) {
      logger.error('Generate attendance report error:', error);
      throw error;
    }
  }

  // Generate computer report
  async generateComputerReport(filters, format = 'json') {
    try {
      const { lab, status } = filters;
      
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
        if (!summary.byLab[c.lab]) summary.byLab[c.lab] = 0;
        summary.byLab[c.lab]++;
      });
      
      const reportData = { summary, records: computers };
      
      if (format === 'excel') {
        return await this.exportToExcel(reportData, 'computer_report');
      } else if (format === 'pdf') {
        return await this.exportToPDF(reportData, 'computer_report');
      }
      
      return { success: true, data: reportData };
    } catch (error) {
      logger.error('Generate computer report error:', error);
      throw error;
    }
  }

  // Generate equipment report
  async generateEquipmentReport(filters, format = 'json') {
    try {
      const { category, laboratory, condition } = filters;
      
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
        if (!summary.byCategory[e.category]) summary.byCategory[e.category] = 0;
        summary.byCategory[e.category]++;
      });
      
      const reportData = { summary, records: equipment };
      
      if (format === 'excel') {
        return await this.exportToExcel(reportData, 'equipment_report');
      } else if (format === 'pdf') {
        return await this.exportToPDF(reportData, 'equipment_report');
      }
      
      return { success: true, data: reportData };
    } catch (error) {
      logger.error('Generate equipment report error:', error);
      throw error;
    }
  }

  // Generate maintenance report
  async generateMaintenanceReport(filters, format = 'json') {
    try {
      const { startDate, endDate, status, priority } = filters;
      
      let where = {};
      if (startDate && endDate) {
        where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      }
      if (status) where.status = status;
      if (priority) where.priority = priority;
      
      const maintenance = await MaintenanceRequest.findAll({
        where,
        include: [{ model: Computer, as: 'computer' }]
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
        avgCompletionTime: this.calculateAvgCompletionTime(maintenance)
      };
      
      const reportData = { summary, records: maintenance };
      
      if (format === 'excel') {
        return await this.exportToExcel(reportData, 'maintenance_report');
      } else if (format === 'pdf') {
        return await this.exportToPDF(reportData, 'maintenance_report');
      }
      
      return { success: true, data: reportData };
    } catch (error) {
      logger.error('Generate maintenance report error:', error);
      throw error;
    }
  }

  // Export to Excel
  async exportToExcel(reportData, filename) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Report');
      
      // Add summary sheet
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.addRow(['Metric', 'Value']);
      summarySheet.addRow(['Total Records', reportData.summary.total]);
      
      for (const [key, value] of Object.entries(reportData.summary)) {
        if (key !== 'total' && typeof value !== 'object') {
          summarySheet.addRow([key, value]);
        }
      }
      
      // Add data sheet
      if (reportData.records && reportData.records.length > 0) {
        const dataSheet = workbook.addWorksheet('Data');
        const headers = Object.keys(reportData.records[0].toJSON ? reportData.records[0].toJSON() : reportData.records[0]);
        dataSheet.addRow(headers);
        
        for (const record of reportData.records) {
          const row = record.toJSON ? record.toJSON() : record;
          dataSheet.addRow(headers.map(h => row[h] || ''));
        }
      }
      
      const filepath = path.join(REPORTS_PATH, `${filename}_${Date.now()}.xlsx`);
      await workbook.xlsx.writeFile(filepath);
      
      return { success: true, filepath };
    } catch (error) {
      logger.error('Export to Excel error:', error);
      throw error;
    }
  }

  // Export to PDF
  async exportToPDF(reportData, filename) {
    try {
      const doc = new PDFDocument();
      const filepath = path.join(REPORTS_PATH, `${filename}_${Date.now()}.pdf`);
      const stream = fs.createWriteStream(filepath);
      
      doc.pipe(stream);
      
      // Add header
      doc.fontSize(20).text('CLMS Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown();
      
      // Add summary
      doc.fontSize(14).text('Summary', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      
      for (const [key, value] of Object.entries(reportData.summary)) {
        if (typeof value !== 'object') {
          doc.text(`${key}: ${value}`);
        }
      }
      
      doc.end();
      
      return new Promise((resolve) => {
        stream.on('finish', () => {
          resolve({ success: true, filepath });
        });
      });
    } catch (error) {
      logger.error('Export to PDF error:', error);
      throw error;
    }
  }

  // Calculate average completion time
  calculateAvgCompletionTime(maintenance) {
    const completed = maintenance.filter(m => m.completedAt && m.createdAt);
    if (completed.length === 0) return 0;
    
    const totalHours = completed.reduce((sum, m) => {
      const hours = (new Date(m.completedAt) - new Date(m.createdAt)) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    
    return (totalHours / completed.length).toFixed(2);
  }

  // Clean old report files
  async cleanOldReports(days = 7) {
    try {
      const files = fs.readdirSync(REPORTS_PATH);
      const now = Date.now();
      const cutoff = days * 24 * 60 * 60 * 1000;
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(REPORTS_PATH, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtimeMs > cutoff) {
          fs.removeSync(filePath);
          deletedCount++;
        }
      }
      
      return { success: true, deletedCount };
    } catch (error) {
      logger.error('Clean old reports error:', error);
      throw error;
    }
  }
}

module.exports = new ReportService();