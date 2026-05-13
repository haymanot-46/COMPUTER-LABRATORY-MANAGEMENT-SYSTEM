const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EquipmentAudit = sequelize.define('EquipmentAudit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  equipmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'equipment_id',
    references: {
      model: 'equipment',
      key: 'id'
    }
  },
  auditDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'audit_date'
  },
  auditedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'audited_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  auditedByName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'audited_by_name'
  },
  condition: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'damaged'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'borrowed', 'maintenance', 'retired', 'lost'),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  findings: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  issuesFound: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'issues_found'
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  actionTaken: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'action_taken'
  },
  nextAuditDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'next_audit_date'
  },
  attachments: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('attachments');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('attachments', value ? JSON.stringify(value) : '[]');
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'equipment_audits',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['equipment_id']
    },
    {
      fields: ['audit_date']
    },
    {
      fields: ['audited_by']
    }
  ]
});

// Instance method to get audit summary
EquipmentAudit.prototype.getSummary = function() {
  return {
    id: this.id,
    date: this.auditDate,
    auditor: this.auditedByName,
    condition: this.condition,
    status: this.status,
    issuesFound: this.issuesFound,
    actionTaken: this.actionTaken
  };
};

module.exports = EquipmentAudit;