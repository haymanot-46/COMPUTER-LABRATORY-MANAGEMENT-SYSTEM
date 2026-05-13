const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

const UPLOADS_PATH = path.join(__dirname, '../../uploads');
const TEMP_PATH = path.join(__dirname, '../../temp');

// Ensure directories exist
fs.ensureDirSync(UPLOADS_PATH);
fs.ensureDirSync(TEMP_PATH);

class StorageService {
  // Save file
  async saveFile(file, folder = 'general', userId = null) {
    try {
      const targetDir = path.join(UPLOADS_PATH, folder);
      fs.ensureDirSync(targetDir);
      
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${uuidv4()}${ext}`;
      const filepath = path.join(targetDir, filename);
      
      await fs.move(file.path, filepath, { overwrite: true });
      
      const relativePath = `/uploads/${folder}/${filename}`;
      const fileSize = fs.statSync(filepath).size;
      
      return {
        success: true,
        filename,
        filepath: relativePath,
        size: fileSize,
        originalName: file.originalname,
        mimeType: file.mimetype
      };
    } catch (error) {
      logger.error('Save file error:', error);
      throw error;
    }
  }

  // Save multiple files
  async saveMultipleFiles(files, folder = 'general', userId = null) {
    try {
      const results = [];
      
      for (const file of files) {
        const result = await this.saveFile(file, folder, userId);
        results.push(result);
      }
      
      return { success: true, files: results };
    } catch (error) {
      logger.error('Save multiple files error:', error);
      throw error;
    }
  }

  // Delete file
  async deleteFile(filepath) {
    try {
      const fullPath = path.join(UPLOADS_PATH, filepath.replace('/uploads/', ''));
      
      if (fs.existsSync(fullPath)) {
        await fs.remove(fullPath);
        logger.info(`File deleted: ${filepath}`);
        return { success: true };
      }
      
      return { success: false, message: 'File not found' };
    } catch (error) {
      logger.error('Delete file error:', error);
      throw error;
    }
  }

  // Get file info
  async getFileInfo(filepath) {
    try {
      const fullPath = path.join(UPLOADS_PATH, filepath.replace('/uploads/', ''));
      
      if (!fs.existsSync(fullPath)) {
        throw new Error('File not found');
      }
      
      const stats = fs.statSync(fullPath);
      
      return {
        success: true,
        data: {
          filename: path.basename(fullPath),
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          path: filepath
        }
      };
    } catch (error) {
      logger.error('Get file info error:', error);
      throw error;
    }
  }

  // List files in folder
  async listFiles(folder = 'general') {
    try {
      const targetDir = path.join(UPLOADS_PATH, folder);
      
      if (!fs.existsSync(targetDir)) {
        return { success: true, files: [] };
      }
      
      const files = fs.readdirSync(targetDir);
      const fileList = [];
      
      for (const file of files) {
        const filePath = path.join(targetDir, file);
        const stats = fs.statSync(filePath);
        
        fileList.push({
          filename: file,
          path: `/uploads/${folder}/${file}`,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        });
      }
      
      return { success: true, files: fileList };
    } catch (error) {
      logger.error('List files error:', error);
      throw error;
    }
  }

  // Create temporary file
  async createTempFile(data, extension = '.tmp') {
    try {
      const filename = `${Date.now()}-${uuidv4()}${extension}`;
      const filepath = path.join(TEMP_PATH, filename);
      
      await fs.writeFile(filepath, data);
      
      return {
        success: true,
        filename,
        filepath,
        size: data.length
      };
    } catch (error) {
      logger.error('Create temp file error:', error);
      throw error;
    }
  }

  // Delete temporary file
  async deleteTempFile(filename) {
    try {
      const filepath = path.join(TEMP_PATH, filename);
      
      if (fs.existsSync(filepath)) {
        await fs.remove(filepath);
        return { success: true };
      }
      
      return { success: false, message: 'Temp file not found' };
    } catch (error) {
      logger.error('Delete temp file error:', error);
      throw error;
    }
  }

  // Clean temporary files
  async cleanTempFiles(ageHours = 24) {
    try {
      const files = fs.readdirSync(TEMP_PATH);
      const now = Date.now();
      const cutoff = ageHours * 60 * 60 * 1000;
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(TEMP_PATH, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtimeMs > cutoff) {
          await fs.remove(filePath);
          deletedCount++;
        }
      }
      
      logger.info(`Cleaned ${deletedCount} temporary files`);
      return { success: true, deletedCount };
    } catch (error) {
      logger.error('Clean temp files error:', error);
      throw error;
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      let totalSize = 0;
      let fileCount = 0;
      
      const scanDir = (dir) => {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory()) {
            scanDir(filePath);
          } else {
            totalSize += stats.size;
            fileCount++;
          }
        }
      };
      
      scanDir(UPLOADS_PATH);
      
      return {
        success: true,
        data: {
          totalSize: this.formatBytes(totalSize),
          totalSizeBytes: totalSize,
          fileCount,
          uploadPath: UPLOADS_PATH
        }
      };
    } catch (error) {
      logger.error('Get storage stats error:', error);
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
}

module.exports = new StorageService();