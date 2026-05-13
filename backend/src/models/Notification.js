const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('info', 'success', 'warning', 'error', 'reminder', 'alert'),
    defaultValue: 'info'
  },
  category: {
    type: DataTypes.ENUM('system', 'attendance', 'schedule', 'maintenance', 'equipment', 'academic'),
    defaultValue: 'system'
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'read_at'
  },
  link: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at'
  },
  sentBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'sent_by'
  },
  sentByEmail: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'sent_by_email'
  },
  isBroadcast: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_broadcast'
  },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('metadata');
      return rawValue ? JSON.parse(rawValue) : {};
    },
    set(value) {
      this.setDataValue('metadata', value ? JSON.stringify(value) : '{}');
    }
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['read']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['expires_at']
    }
  ]
});

// Instance method to mark as read
Notification.prototype.markAsRead = async function() {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
    await this.save();
  }
};

// Instance method to check if expired
Notification.prototype.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Static method to get unread count for user
Notification.getUnreadCount = async function(userId) {
  return await this.count({
    where: {
      userId,
      read: false,
      [Op.or]: [
        { expiresAt: null },
        { expiresAt: { [Op.gt]: new Date() } }
      ]
    }
  });
};

// Static method to clean expired notifications
Notification.cleanExpired = async function() {
  return await this.destroy({
    where: {
      expiresAt: { [Op.lt]: new Date() }
    }
  });
};

module.exports = Notification;