const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  course_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'course_name'
  },
  laboratory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'laboratory_id',
    references: {
      model: 'laboratories',
      key: 'id'
    }
  },
  requester_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'requester_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approver_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'approver_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  batch_name: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'batch_name'
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_time'
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_time'
  },
  expected_students: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'expected_students'
  },
  recurring_type: {
    type: DataTypes.ENUM('none', 'daily', 'weekly', 'monthly'),
    defaultValue: 'none',
    field: 'recurring_type'
  },
  recurring_end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'recurring_end_date'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'schedules',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Schedule.associate = (models) => {
  Schedule.belongsTo(models.User, { as: 'requester', foreignKey: 'requester_id' });
  Schedule.belongsTo(models.User, { as: 'approver', foreignKey: 'approver_id' });
  Schedule.belongsTo(models.Laboratory, { as: 'laboratory', foreignKey: 'laboratory_id' });
};

module.exports = Schedule;