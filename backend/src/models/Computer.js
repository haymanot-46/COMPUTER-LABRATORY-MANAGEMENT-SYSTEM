const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Computer = sequelize.define('Computer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  workstationNumber: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'workstation_number'
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  serialNumber: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: true,
    field: 'serial_number'
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
  processor: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  ram: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  storage: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  operatingSystem: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'operating_system'
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