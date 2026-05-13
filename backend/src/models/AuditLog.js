const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id'
  },
  userEmail: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'user_email'
  },
  userRole: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'user_role'
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'entity_type'
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'entity_id'
  },
  method: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  ip: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent'
  },
  requestBody: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'request_body'
  },
  responseStatus: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'response_status'
  },
  responseTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'response_time'
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'audit_logs',
  timestamps: false
});

module.exports = AuditLog;