const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { exec } = require('child_process');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

const BACKUP_PATH = process.env.BACKUP_PATH || './backups';
const BACKUP_RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;

// Ensure backup directory exists
fs.ensureDirSync(BACKUP_PATH);

class BackupService {
  // Database backup using mysqldump
  async backupDatabase() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(BACKUP_PATH, `database_backup_${timestamp}.sql`);
      
      const config = sequelize.config;
      const dumpCommand = `mysqldump -h ${config.host} -P ${config.port} -u ${config.username} -p${config.password} ${config.database} > "${backupFile}"`;
      
      return new Promise((resolve, reject) => {
        exec(dumpCommand, (error, stdout, stderr) => {
          if (error) {
            logger.error('Database backup failed:', error);
            reject(error);
          } else {
            const stats = fs.statSync(backupFile);
            logger.info(`Database backup created: ${backupFile} (${stats.size} bytes)`);
            resolve({ success: true, file: backupFile, size: stats.size, type: 'database' });
          }
        });
      });
    } catch (error) {
      logger.error('Backup database error:', error);
      throw error;
    }
  }

  // Uploads backup
  async backupUploads() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(BACKUP_PATH, `uploads_backup_${timestamp}.zip`);
      const uploadsPath = path.join(__dirname, '../../uploads');
      
      if (!fs.existsSync(uploadsPath)) {
        logger.info('No uploads folder to backup');
        return { success: true, message: 'No uploads folder', type: 'uploads' };
      }
      
      const output = fs.createWriteStream(backupFile);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      return new Promise((resolve, reject) => {
        output.on('close', () => {
          const stats = fs.statSync(backupFile);
          logger.info(`Uploads backup created: ${backupFile} (${stats.size} bytes)`);
          resolve({ success: true, file: backupFile, size: stats.size, type: 'uploads' });
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
      logger.error('Backup uploads error:', error);
      throw error;
    }
  }

  // Full backup
  async fullBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(BACKUP_PATH, `full_backup_${timestamp}.zip`);
      const output = fs.createWriteStream(backupFile);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      // First create database backup
      const dbBackup = await this.backupDatabase();
      
      return new Promise((resolve, reject) => {
        output.on('close', () => {
          const stats = fs.statSync(backupFile);
          logger.info(`Full backup created: ${backupFile} (${stats.size} bytes)`);
          
          // Clean up temporary database backup file
          if (dbBackup.file && fs.existsSync(dbBackup.file)) {
            fs.removeSync(dbBackup.file);
          }
          
          resolve({ success: true, file: backupFile, size: stats.size, type: 'full' });
        });
        
        archive.on('error', (err) => {
          logger.error('Full backup failed:', err);
          reject(err);
        });
        
        archive.pipe(output);
        
        // Add database backup
        if (dbBackup.file && fs.existsSync(dbBackup.file)) {
          archive.file(dbBackup.file, { name: path.basename(dbBackup.file) });
        }
        
        // Add uploads folder
        const uploadsPath = path.join(__dirname, '../../uploads');
        if (fs.existsSync(uploadsPath)) {
          archive.directory(uploadsPath, 'uploads');
        }
        
        // Add config files
        const envPath = path.join(__dirname, '../../.env');
        if (fs.existsSync(envPath)) {
          archive.file(envPath, { name: '.env' });
        }
        
        archive.finalize();
      });
    } catch (error) {
      logger.error('Full backup error:', error);
      throw error;
    }
  }

  // Clean old backups
  async cleanOldBackups() {
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
      logger.error('Clean old backups error:', error);
      throw error;
    }
  }

  // List all backups
  async listBackups() {
    try {
      const files = fs.readdirSync(BACKUP_PATH);
      const backups = [];
      
      for (const file of files) {
        const filePath = path.join(BACKUP_PATH, file);
        const stats = fs.statSync(filePath);
        
        backups.push({
          name: file,
          size: stats.size,
          sizeFormatted: this.formatBytes(stats.size),
          createdAt: stats.mtime,
          type: file.includes('database') ? 'database' : file.includes('uploads') ? 'uploads' : 'full'
        });
      }
      
      backups.sort((a, b) => b.createdAt - a.createdAt);
      return { success: true, data: backups };
    } catch (error) {
      logger.error('List backups error:', error);
      throw error;
    }
  }

  // Restore backup
  async restoreBackup(backupFile) {
    try {
      const filePath = path.join(BACKUP_PATH, backupFile);
      
      if (!fs.existsSync(filePath)) {
        throw new Error('Backup file not found');
      }
      
      // This would need implementation based on backup type
      logger.info(`Restoring backup: ${backupFile}`);
      
      return { success: true, message: 'Restore initiated' };
    } catch (error) {
      logger.error('Restore backup error:', error);
      throw error;
    }
  }

  // Format bytes to human readable
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get backup statistics
  async getBackupStats() {
    try {
      const backups = await this.listBackups();
      const totalSize = backups.data.reduce((sum, b) => sum + b.size, 0);
      
      return {
        success: true,
        data: {
          totalBackups: backups.data.length,
          totalSize: this.formatBytes(totalSize),
          lastBackup: backups.data[0] || null,
          backupPath: BACKUP_PATH,
          retentionDays: BACKUP_RETENTION_DAYS
        }
      };
    } catch (error) {
      logger.error('Get backup stats error:', error);
      throw error;
    }
  }
}

module.exports = new BackupService();