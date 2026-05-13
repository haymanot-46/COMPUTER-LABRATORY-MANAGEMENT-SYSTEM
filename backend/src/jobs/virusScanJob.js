// backend/jobs/virusScanJob.js
const fs = require('fs-extra');
const path = require('path');
const logger = require('../config/logger');

const UPLOADS_PATH = path.join(__dirname, '../uploads');
const QUARANTINE_PATH = path.join(__dirname, '../quarantine');

fs.ensureDirSync(UPLOADS_PATH);
fs.ensureDirSync(QUARANTINE_PATH);

// Mock virus scanner (since ClamAV may not be installed)
const scanFile = async (filePath) => {
  logger.info(`[MOCK] Scanning file: ${filePath}`);
  return { success: true, isInfected: false };
};

// Scan all files
const scanAllFiles = async () => {
  try {
    const files = fs.readdirSync(UPLOADS_PATH);
    const results = { scanned: 0, infected: 0 };
    
    for (const file of files) {
      const filePath = path.join(UPLOADS_PATH, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const result = await scanFile(filePath);
        results.scanned++;
        if (result.isInfected) results.infected++;
      }
    }
    
    logger.info(`Virus scan completed: ${results.scanned} files scanned`);
    return { success: true, ...results };
  } catch (error) {
    logger.error('Virus scan failed:', error);
    return { success: false, error: error.message };
  }
};

// Schedule virus scan
const scheduleVirusScan = () => {
  const cron = require('node-cron');
  cron.schedule('0 4 * * *', async () => {
    logger.info('Running scheduled virus scan');
    await scanAllFiles();
  });
  console.log('✅ Virus scan scheduler initialized');
};

module.exports = {
  scanFile,
  scanAllFiles,
  scheduleVirusScan
};