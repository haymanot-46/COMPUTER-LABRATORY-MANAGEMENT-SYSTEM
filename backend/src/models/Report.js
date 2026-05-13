const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('attendance', 'equipment', 'maintenance', 'computer', 'schedule', 'user'),
    allowNull: false
  },
  format: {
    type: DataTypes.ENUM('json', 'pdf', 'excel', 'csv'),
    defaultValue: 'json'
  },
  filters: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('filters');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('filters', value ? JSON.stringify(value) : null);
    }
  },
  data: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('data');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('data', value ? JSON.stringify(value) : null);
    }
  },
  filePath: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'file_path'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'file_size'
  },
  generatedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'generated_by'
  },
  generatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'generated_at'
  },
  isScheduled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_scheduled'
  },
  scheduleConfig: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'schedule_config',
    get() {
      const rawValue = this.getDataValue('schedule_config');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('schedule_config', value ? JSON.stringify(value) : null);
    }
  },
  recipients: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('recipients');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('recipients', value ? JSON.stringify(value) : '[]');
    }
  }
}, {
  tableName: 'reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Report;