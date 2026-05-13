const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EmailVerification = sequelize.define('EmailVerification', {
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
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified'
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent'
  }
}, {
  tableName: 'email_verifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['token']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['expires_at']
    }
  ]
});

// Instance method to check if token is expired
EmailVerification.prototype.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Instance method to mark as verified
EmailVerification.prototype.markAsVerified = async function() {
  this.isVerified = true;
  this.verifiedAt = new Date();
  await this.save();
};

// Static method to create verification token
EmailVerification.createVerification = async function(userId, email, token, ipAddress, userAgent) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry
  
  return await this.create({
    userId,
    email,
    token,
    expiresAt,
    ipAddress,
    userAgent
  });
};

module.exports = EmailVerification;