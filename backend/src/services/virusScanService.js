const clamd = require('clamdjs');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../config/logger');

const UPLOADS_PATH = path.join(__dirname, '../../uploads');
const QUARANTINE_PATH = path.join(__dirname, '../../quarantine');

// Ensure directories exist
fs.ensureDirSync(UPLOADS_PATH);
fs.ensureDirSync(QUARANTINE_PATH);

class VirusScanService {
  constructor() {
    this.scanner = null;
    this.isAvailable = false;
    this.initScanner();
  }

  initScanner() {
    try {
      this.scanner = clamd('localhost', 3310);
      this.isAvailable = true;
      logger.info('Virus scanner initialized');
    } catch (error) {
      this.isAvailable = false;
      logger.warn('ClamAV not available, virus scanning disabled');
    }
  }

  // Scan a single file
  async scanFile(filePath) {
    if (!this.isAvailable) {
      logger.warn('Virus scanner not available, skipping scan');
      return { success: true, isInfected: false, message: 'Scanner not available' };
    }
    
    try {
      const result = await this.scanner.scanFile(filePath);
      const isInfected = result !== 'OK';
      
      if (isInfected) {
        logger.warn(`Virus detected in file: ${filePath} - ${result}`);
        
        // Move to quarantine
        const quarantinePath = path.join(QUARANTINE_PATH, path.basename(filePath));
        await fs.move(filePath, quarantinePath, { overwrite: true });
        
        return {
          success: true,
          isInfected: true,
          virusName: result,
          quarantinePath
        };
      }
      
      return { success: true, isInfected: false };
    } catch (error) {
      logger.error(`Virus scan failed for ${filePath}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Scan multiple files
  async scanFiles(filePaths) {
    const results = [];
    
    for (const filePath of filePaths) {
      const result = await this.scanFile(filePath);
      results.push({ filePath, ...result });
    }
    
    const infectedCount = results.filter(r => r.isInfected).length;
    logger.info(`Scanned ${results.length} files, ${infectedCount} infected`);
    
    return { success: true, results, infectedCount };
  }

  // Scan all files in uploads directory
  async scanAllFiles() {
    if (!this.isAvailable) {
      logger.warn('Virus scanner not available');
      return { success: true, scanned: 0, infected: 0, message: 'Scanner not available' };
    }
    
    try {
      const files = this.getAllFiles(UPLOADS_PATH);
      const results = await this.scanFiles(files);
      
      return {
        success: true,
        scanned: files.length,
        infected: results.infectedCount,
        infectedFiles: results.results.filter(r => r.isInfected).map(r => r.filePath)
      };
    } catch (error) {
      logger.error('Scan all files error:', error);
      throw error;
    }
  }

  // Get all files recursively
  getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        arrayOfFiles = this.getAllFiles(filePath, arrayOfFiles);
      } else {
        arrayOfFiles.push(filePath);
      }
    }
    
    return arrayOfFiles;
  }

  // Scan uploaded file (middleware helper)
  async scanUploadedFile(file) {
    if (!file || !file.path) {
      return { success: true, isInfected: false };
    }
    
    return await this.scanFile(file.path);
  }

  // Quarantine file
  async quarantineFile(filePath, reason = 'suspicious') {
    try {
      const quarantinePath = path.join(QUARANTINE_PATH, path.basename(filePath));
      await fs.move(filePath, quarantinePath, { overwrite: true });
      
      logger.info(`File quarantined: ${filePath} - Reason: ${reason}`);
      return { success: true, quarantinePath };
    } catch (error) {
      logger.error('Quarantine file error:', error);
      throw error;
    }
  }

  // Restore file from quarantine
  async restoreFile(quarantineFileName, originalPath = null) {
    try {
      const quarantinePath = path.join(QUARANTINE_PATH, quarantineFileName);
      
      if (!fs.existsSync(quarantinePath)) {
        throw new Error('Quarantine file not found');
      }
      
      const restorePath = originalPath || path.join(UPLOADS_PATH, quarantineFileName);
      await fs.move(quarantinePath, restorePath);
      
      logger.info(`File restored: ${quarantineFileName}`);
      return { success: true, restorePath };
    } catch (error) {
      logger.error('Restore file error:', error);
      throw error;
    }
  }

  // Delete quarantined file
  async deleteQuarantinedFile(quarantineFileName) {
    try {
      const quarantinePath = path.join(QUARANTINE_PATH, quarantineFileName);
      
      if (!fs.existsSync(quarantinePath)) {
        throw new Error('Quarantine file not found');
      }
      
      await fs.remove(quarantinePath);
      logger.info(`Quarantined file deleted: ${quarantineFileName}`);
      return { success: true };
    } catch (error) {
      logger.error('Delete quarantined file error:', error);
      throw error;
    }
  }

  // List quarantined files
  async listQuarantinedFiles() {
    try {
      const files = fs.readdirSync(QUARANTINE_PATH);
      const quarantined = [];
      
      for (const file of files) {
        const filePath = path.join(QUARANTINE_PATH, file);
        const stats = fs.statSync(filePath);
        
        quarantined.push({
          name: file,
          path: filePath,
          size: stats.size,
          quarantinedAt: stats.birthtime
        });
      }
      
      return { success: true, data: quarantined };
    } catch (error) {
      logger.error('List quarantined files error:', error);
      throw error;
    }
  }

  // Clean quarantine folder (older than days)
  async cleanQuarantine(days = 30) {
    try {
      const files = fs.readdirSync(QUARANTINE_PATH);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(QUARANTINE_PATH, file);
        const stats = fs.statSync(filePath);
        
        if (stats.birthtime < cutoffDate) {
          await fs.remove(filePath);
          deletedCount++;
        }
      }
      
      logger.info(`Cleaned ${deletedCount} old quarantined files`);
      return { success: true, deletedCount };
    } catch (error) {
      logger.error('Clean quarantine error:', error);
      throw error;
    }
  }

  // Get virus scan statistics
  async getScanStats() {
    try {
      const quarantinedFiles = await this.listQuarantinedFiles();
      
      return {
        success: true,
        data: {
          isScannerAvailable: this.isAvailable,
          quarantinedCount: quarantinedFiles.data.length,
          quarantinePath: QUARANTINE_PATH,
          uploadsPath: UPLOADS_PATH
        }
      };
    } catch (error) {
      logger.error('Get scan stats error:', error);
      throw error;
    }
  }
}

module.exports = new VirusScanService();