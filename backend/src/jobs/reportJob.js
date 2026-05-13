const { reportQueue } = require('../config/queue');
const { 
  generateAttendanceReport, 
  generateEquipmentReport,
  generateMaintenanceReport 
} = require('../controllers/reportController');
const { sendCustomEmailJob } = require('./emailJob');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../config/logger');

const REPORTS_PATH = path.join(__dirname, '../generated_reports');
fs.ensureDirSync(REPORTS_PATH);

// Process report queue
reportQueue.process(async (job) => {
  const { reportType, filters, format, userId, email } = job.data;
  logger.info(`Processing report job: ${reportType} (${format})`);
  
  try {
    // Generate report based on type
    let reportData;
    switch (reportType) {
      case 'attendance':
        reportData = await generateAttendanceReport({ body: filters }, { json: () => {} });
        break;
      case 'equipment':
        reportData = await generateEquipmentReport({ body: filters }, { json: () => {} });
        break;
      case 'maintenance':
        reportData = await generateMaintenanceReport({ body: filters }, { json: () => {} });
        break;
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
    
    // Save report to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${reportType}_report_${timestamp}.${format}`;
    const filepath = path.join(REPORTS_PATH, filename);
    
    if (format === 'json') {
      await fs.writeJson(filepath, reportData, { spaces: 2 });
    } else if (format === 'csv') {
      // Convert to CSV
      const csvContent = convertToCSV(reportData);
      await fs.writeFile(filepath, csvContent);
    }
    
    // Send email with report if requested
    if (email) {
      await sendCustomEmailJob(
        email,
        `${reportType.toUpperCase()} Report`,
        `<p>Your ${reportType} report has been generated.</p>
         <p>Format: ${format.toUpperCase()}</p>
         <p>Generated at: ${new Date().toLocaleString()}</p>`,
        [{ filename: path.basename(filepath), path: filepath }]
      );
    }
    
    logger.info(`Report generated: ${filename}`);
    return { success: true, filepath, filename };
  } catch (error) {
    logger.error(`Report job failed: ${reportType}`, error);
    throw error;
  }
});

// Convert report data to CSV
const convertToCSV = (data) => {
  if (!data || !data.data || !data.data.records) return '';
  
  const records = data.data.records;
  if (records.length === 0) return '';
  
  const headers = Object.keys(records[0]);
  const csvRows = [headers.join(',')];
  
  for (const record of records) {
    const values = headers.map(header => {
      const value = record[header] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

// Report job creators
const generateReportJob = async (reportType, filters, format, userId, email = null) => {
  return await reportQueue.add({
    reportType,
    filters,
    format,
    userId,
    email
  });
};

const generateScheduledReport = async (scheduleId) => {
  // Get schedule configuration from database
  // This would fetch the saved report schedule
  const schedule = { reportType: 'attendance', format: 'pdf', recipients: [] };
  
  return await generateReportJob(
    schedule.reportType,
    {},
    schedule.format,
    null,
    schedule.recipients
  );
};

// Clean old report files (older than 7 days)
const cleanOldReports = async () => {
  try {
    const files = fs.readdirSync(REPORTS_PATH);
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(REPORTS_PATH, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtimeMs > sevenDays) {
        fs.removeSync(filePath);
        deletedCount++;
      }
    }
    
    logger.info(`Cleaned ${deletedCount} old report files`);
    return { success: true, deletedCount };
  } catch (error) {
    logger.error('Clean old reports failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateReportJob,
  generateScheduledReport,
  cleanOldReports
};