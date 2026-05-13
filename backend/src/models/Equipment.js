const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Equipment = sequelize.define('Equipment', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  laboratory: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  serialNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'serial_number'
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  manufacturer: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  purchaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'purchase_date'
  },
  purchaseCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'purchase_cost'
  },
  currentValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'current_value'
  },
  warrantyExpiry: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'warranty_expiry'
  },
  condition: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'damaged'),
    defaultValue: 'good'
  },
  status: {
    type: DataTypes.ENUM('available', 'borrowed', 'maintenance', 'retired', 'lost'),
    defaultValue: 'available'
  },
  borrowerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'borrower_id'
  },
  borrowerName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'borrower_name'
  },
  borrowedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'borrowed_at'
  },
  expectedReturnDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'expected_return_date'
  },
  returnedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'returned_at'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'equipment',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Equipment;