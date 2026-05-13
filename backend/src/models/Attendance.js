const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  scheduleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'schedule_id'
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'student_id'
  },
  studentName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'student_name'
  },
  studentNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'student_number'
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late'),
    allowNull: false
  },
  checkInTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'check_in_time'
  },
  lateMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'late_minutes'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  markedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'marked_by'
  },
  markedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'marked_at'
  },
  isSynced: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_synced'
  },
  offlineId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'offline_id'
  }
}, {
  tableName: 'attendance',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['schedule_id', 'student_id']
    }
  ]
});

module.exports = Attendance;