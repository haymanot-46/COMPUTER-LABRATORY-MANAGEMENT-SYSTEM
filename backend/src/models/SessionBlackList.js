const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SessionBlacklist = sequelize.define('SessionBlacklist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tokenHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'token_hash'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  userEmail: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'user_email'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  blacklistedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'blacklisted_at'
  },
  blacklistReason: {
    type: DataTypes.ENUM('logout', 'expired', 'revoked', 'security'),
    defaultValue: 'logout',
    field: 'blacklist_reason'
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
  tableName: 'session_blacklist',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['token_hash']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['expires_at']
    }
  ]
});

// Instance method to check if token is blacklisted
SessionBlacklist.isBlacklisted = async function(token) {
  const crypto = require('crypto');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  const blacklisted = await this.findOne({
    where: {
      tokenHash,
      expiresAt: { [Op.gt]: new Date() }
    }
  });
  
  return !!blacklisted;
};

// Static method to add token to blacklist
SessionBlacklist.addToBlacklist = async function(token, userId, userEmail, reason = 'logout', ipAddress = null, userAgent = null) {
  const crypto = require('crypto');
  const jwt = require('jsonwebtoken');
  
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  // Get token expiry from JWT
  let expiresAt = new Date();
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      expiresAt = new Date(decoded.exp * 1000);
    } else {
      expiresAt.setDate(expiresAt.getDate() + 1);
    }
  } catch (error) {
    expiresAt.setDate(expiresAt.getDate() + 1);
  }
  
  return await this.create({
    token,
    tokenHash,
    userId,
    userEmail,
    expiresAt,
    blacklistReason: reason,
    ipAddress,
    userAgent
  });
};

// Static method to clean expired blacklist entries
SessionBlacklist.cleanExpired = async function() {
  return await this.destroy({
    where: {
      expiresAt: { [Op.lt]: new Date() }
    }
  });
};

module.exports = SessionBlacklist;