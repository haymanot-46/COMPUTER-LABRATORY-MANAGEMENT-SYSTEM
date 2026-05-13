const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Computer = sequelize.define('Computer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  cpu: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  ram: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  storage: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  os: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'operating_system'
  },
  lab: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address'
  },
  macAddress: {
    type: DataTypes.STRING(17),
    allowNull: true,
    field: 'mac_address'
  },
  serialNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'serial_number'
  },
  status: {
    type: DataTypes.ENUM('available', 'in-use', 'maintenance', 'damaged'),
    defaultValue: 'available'
  },
  purchaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'purchase_date'
  },
  warrantyExpiry: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'warranty_expiry'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lastMaintenance: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_maintenance'
  }
}, {
  tableName: 'computers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Computer;