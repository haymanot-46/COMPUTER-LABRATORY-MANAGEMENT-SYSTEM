const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  computerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'computer_id'
  },
  laboratoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'laboratory_id',
    references: {
      model: 'laboratories',
      key: 'id'
    }
  },
  issueType: {
    type: DataTypes.ENUM('hardware', 'software', 'network', 'peripheral', 'other'),
    defaultValue: 'hardware',
    field: 'issue_type'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'in-progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  reportedBy: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'reported_by'
  },
  reportedEmail: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'reported_email'
  },
  assignedTo: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'assigned_to'
  },
  assignedToId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'assigned_to_id'
  },
  resolution: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  partsUsed: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'parts_used'
  },
  timeSpent: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'time_spent'
  },
  photoUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'photo_url'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  }
}, {
  tableName: 'maintenance_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MaintenanceRequest;