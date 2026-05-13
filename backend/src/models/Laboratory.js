const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Laboratory = sequelize.define('Laboratory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  building: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 }
  },
  computerCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'computer_count'
  },
  equipmentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'equipment_count'
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  supervisor: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  supervisorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'supervisor_id'
  },
  openingTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'opening_time'
  },
  closingTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'closing_time'
  },
  isWeekendOpen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_weekend_open'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  facilities: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('facilities');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('facilities', value ? JSON.stringify(value) : '[]');
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'laboratories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Instance method to get utilization rate
Laboratory.prototype.getUtilizationRate = async function() {
  const { Schedule } = require('./index');
  const today = new Date().toISOString().split('T')[0];
  const schedules = await Schedule.count({
    where: {
      laboratoryId: this.id,
      date: today,
      status: 'approved'
    }
  });
  
  const totalSlots = 8; // Assuming 8 time slots per day
  return (schedules / totalSlots) * 100;
};

// Instance method to check if lab is open
Laboratory.prototype.isOpen = function(date = new Date()) {
  const day = date.getDay();
  const isWeekend = day === 0 || day === 6;
  
  if (isWeekend && !this.isWeekendOpen) return false;
  
  const currentTime = date.toTimeString().slice(0, 5);
  return currentTime >= this.openingTime && currentTime <= this.closingTime;
};

module.exports = Laboratory;