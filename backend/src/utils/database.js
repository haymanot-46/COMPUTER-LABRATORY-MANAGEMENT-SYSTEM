// backend/utils/database.js
const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('./logger');

// Database helper functions
class DatabaseUtils {
  // Execute raw query with logging
  static async query(sql, options = {}) {
    try {
      const startTime = Date.now();
      const result = await sequelize.query(sql, options);
      const duration = Date.now() - startTime;
      logger.logQuery(sql, options.bind, duration);
      return result;
    } catch (error) {
      logger.error('Database query error:', error);
      throw error;
    }
  }

  // Check if table exists
  static async tableExists(tableName) {
    const result = await this.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = :tableName
      ) as exists`,
      {
        replacements: { tableName },
        type: Sequelize.QueryTypes.SELECT
      }
    );
    return result[0].exists === 1;
  }

  // Get table column info
  static async getTableColumns(tableName) {
    const result = await this.query(
      `SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        COLUMN_KEY,
        EXTRA
      FROM information_schema.columns 
      WHERE table_schema = DATABASE() 
      AND table_name = :tableName`,
      {
        replacements: { tableName },
        type: Sequelize.QueryTypes.SELECT
      }
    );
    return result;
  }

  // Get database size
  static async getDatabaseSize() {
    const result = await this.query(
      `SELECT 
        table_schema AS database_name,
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      GROUP BY table_schema`,
      {
        type: Sequelize.QueryTypes.SELECT
      }
    );
    return result[0] || { size_mb: 0 };
  }

  // Get table sizes
  static async getTableSizes() {
    const result = await this.query(
      `SELECT 
        table_name,
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb,
        table_rows
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      ORDER BY size_mb DESC`,
      {
        type: Sequelize.QueryTypes.SELECT
      }
    );
    return result;
  }

  // Get database statistics
  static async getDatabaseStats() {
    const [tableCount, totalSize, tableSizes] = await Promise.all([
      this.query(`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE()`, {
        type: Sequelize.QueryTypes.SELECT
      }),
      this.getDatabaseSize(),
      this.getTableSizes()
    ]);

    return {
      tableCount: tableCount[0].count,
      totalSizeMB: totalSize.size_mb,
      tableSizes
    };
  }

  // Backup database (simple version)
  static async backup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup_${timestamp}.sql`;
    const backupPath = path.join(__dirname, '../../backups', backupName);
    
    // Ensure backup directory exists
    const fs = require('fs-extra');
    fs.ensureDirSync(path.join(__dirname, '../../backups'));
    
    const { exec } = require('child_process');
    const config = sequelize.config;
    
    const command = `mysqldump -h ${config.host} -P ${config.port} -u ${config.username} -p${config.password} ${config.database} > "${backupPath}"`;
    
    return new Promise((resolve, reject) => {
      exec(command, (error) => {
        if (error) {
          logger.error('Database backup failed:', error);
          reject(error);
        } else {
          logger.info(`Database backup created: ${backupPath}`);
          resolve({ success: true, path: backupPath, name: backupName });
        }
      });
    });
  }

  // Optimize tables
  static async optimizeTables() {
    const tables = await this.getTableSizes();
    const results = [];
    
    for (const table of tables) {
      try {
        await this.query(`OPTIMIZE TABLE ${table.table_name}`);
        results.push({ table: table.table_name, optimized: true });
        logger.info(`Optimized table: ${table.table_name}`);
      } catch (error) {
        results.push({ table: table.table_name, optimized: false, error: error.message });
      }
    }
    
    return results;
  }

  // Check connection health
  static async checkHealth() {
    try {
      await sequelize.authenticate();
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }

  // Transaction helper
  static async transaction(callback) {
    const transaction = await sequelize.transaction();
    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Bulk insert with chunking
  static async bulkInsert(model, data, chunkSize = 1000) {
    const results = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const result = await model.bulkCreate(chunk);
      results.push(...result);
    }
    return results;
  }

  // Pagination helper
  static getPagination(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return { offset, limit: parseInt(limit) };
  }

  // Build where clause from filters
  static buildWhereClause(filters, allowedFields) {
    const where = {};
    for (const [key, value] of Object.entries(filters)) {
      if (allowedFields.includes(key) && value !== undefined && value !== null && value !== '') {
        where[key] = value;
      }
    }
    return where;
  }

  // Build search condition
  static buildSearchCondition(searchTerm, searchFields) {
    if (!searchTerm) return {};
    
    const { Op } = require('sequelize');
    return {
      [Op.or]: searchFields.map(field => ({
        [field]: { [Op.like]: `%${searchTerm}%` }
      }))
    };
  }

  // Get count of records
  static async getCount(model, where = {}) {
    return await model.count({ where });
  }

  // Check if record exists
  static async exists(model, where) {
    const count = await model.count({ where });
    return count > 0;
  }

  // Soft delete helper
  static async softDelete(model, id, userId = null) {
    const record = await model.findByPk(id);
    if (!record) throw new Error('Record not found');
    
    await record.update({
      deletedAt: new Date(),
      deletedBy: userId
    });
    
    return record;
  }

  // Hard delete helper
  static async hardDelete(model, id) {
    const record = await model.findByPk(id);
    if (!record) throw new Error('Record not found');
    
    await record.destroy({ force: true });
    return record;
  }

  // Restore soft deleted record
  static async restore(model, id) {
    const record = await model.findOne({ where: { id }, paranoid: false });
    if (!record) throw new Error('Record not found');
    
    await record.restore();
    return record;
  }
}

module.exports = DatabaseUtils;