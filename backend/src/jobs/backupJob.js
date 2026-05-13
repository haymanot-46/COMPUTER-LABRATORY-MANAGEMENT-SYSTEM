// backend/jobs/backupJob.js
const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

const BACKUP_PATH = process.env.BACKUP_PATH || './backups';
const BACKUP_RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;

// Ensure backup directory exists
fs.ensureDirSync(BACKUP_PATH);

// Database backup
const backupDatabase = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_PATH, `database_backup_${timestamp}.sql`);
    
    const config = sequelize.config;
    const { exec } = require('child_process');
    const dumpCommand = `mysqldump -h ${config.host} -P ${config.port} -u ${config.username} -p${config.password} ${config.database} > "${backupFile}"`;
    
    return new Promise((resolve, reject) => {
      exec(dumpCommand, (error, stdout, stderr) => {
        if (error) {
          logger.error('Database backup failed:', error);
          reject(error);
        } else {
          const stats = fs.statSync(backupFile);
          logger.info(`Database backup created: ${backupFile} (${stats.size} bytes)`);
          resolve({ success: true, file: backupFile, size: stats.size });
        }
      });
    });
  } catch (error) {
    logger.error('Backup failed:', error);
    throw error;
  }
};

// File system backup
const backupUploads = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_PATH, `uploads_backup_${timestamp}.zip`);
    const uploadsPath = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsPath)) {
      logger.info('No uploads folder to backup');
      return { success: true, message: 'No uploads folder' };
    }
    
    const output = fs.createWriteStream(backupFile);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    return new Promise((resolve, reject) => {
      output.on('close', () => {
        const stats = fs.statSync(backupFile);
        logger.info(`Uploads backup created: ${backupFile} (${stats.size} bytes)`);
        resolve({ success: true, file: backupFile, size: stats.size });
      });
      
      archive.on('error', (err) => {
        logger.error('Uploads backup failed:', err);
        reject(err);
      });
      
      archive.pipe(output);
      archive.directory(uploadsPath, false);
      archive.finalize();
    });
  } catch (error) {
    logger.error('Uploads backup failed:', error);
    throw error;
  }
};

// Clean old backups
const cleanOldBackups = async () => {
  try {
    const files = fs.readdirSync(BACKUP_PATH);
    const now = Date.now();
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(BACKUP_PATH, file);
      const stats = fs.statSync(filePath);
      const ageInDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);
      
      if (ageInDays > BACKUP_RETENTION_DAYS) {
        fs.removeSync(filePath);
        deletedCount++;
        logger.info(`Deleted old backup: ${file}`);
      }
    }
    
    logger.info(`Cleaned ${deletedCount} old backups`);
    return { success: true, deletedCount };
  } catch (error) {
    logger.error('Clean old backups failed:', error);
    throw error;
  }
};

// Main backup job
const performBackup = async (type = 'full') => {
  const results = {
    database: null,
    uploads: null,
    cleanup: null,
    timestamp: new Date().toISOString()
  };
  
  try {
    if (type === 'full' || type === 'database') {
      results.database = await backupDatabase();
    }
    
    if (type === 'full' || type === 'uploads') {
      results.uploads = await backupUploads();
    }
    
    results.cleanup = await cleanOldBackups();
    
    logger.info('Backup completed successfully', results);
    return results;
  } catch (error) {
    logger.error('Backup job failed:', error);
    throw error;
  }
};

// Scheduled backup (using node-cron instead of Bull)
const scheduleBackup = () => {
  const cron = require('node-cron');
  cron.schedule('0 2 * * *', async () => {
    logger.info('Running scheduled backup');
    await performBackup('full');
  });
  console.log('✅ Backup scheduler initialized');
};

module.exports = {
  performBackup,
  backupDatabase,
  backupUploads,
  cleanOldBackups,
  scheduleBackup
};