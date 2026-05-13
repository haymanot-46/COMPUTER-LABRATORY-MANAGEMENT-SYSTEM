const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { SessionBlacklist } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

class TokenService {
  // Generate access token
  generateAccessToken(userId, userRole, additionalData = {}) {
    return jwt.sign(
      {
        id: userId,
        role: userRole,
        type: 'access',
        ...additionalData
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );
  }

  // Generate refresh token
  generateRefreshToken(userId, userRole) {
    return jwt.sign(
      {
        id: userId,
        role: userRole,
        type: 'refresh'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );
  }

  // Generate email verification token
  generateEmailVerificationToken(userId, email) {
    const payload = {
      id: userId,
      email,
      type: 'email_verification',
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 hours
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key');
  }

  // Generate password reset token
  generatePasswordResetToken(userId, email) {
    const payload = {
      id: userId,
      email,
      type: 'password_reset',
      exp: Math.floor(Date.now() / 1000) + 1 * 60 * 60 // 1 hour
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key');
  }

  // Generate API key
  generateApiKey(userId, name) {
    const apiKey = crypto.randomBytes(32).toString('hex');
    const apiSecret = crypto.randomBytes(32).toString('hex');
    
    // In production, store these in database
    logger.info(`API key generated for user ${userId}: ${name}`);
    
    return {
      apiKey,
      apiSecret,
      createdAt: new Date()
    };
  }

  // Verify token
  verifyToken(token, type = null) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      if (type && decoded.type !== type) {
        return null;
      }
      
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Decode token without verification
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded) return true;
      
      return decoded.exp < Math.floor(Date.now() / 1000);
    } catch (error) {
      return true;
    }
  }

  // Get token expiry time
  getTokenExpiry(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return null;
      
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  // Blacklist token
  async blacklistToken(token, userId, userEmail, reason = 'logout', ipAddress = null, userAgent = null) {
    try {
      const expiresAt = this.getTokenExpiry(token) || new Date(Date.now() + 24 * 60 * 60 * 1000);
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      await SessionBlacklist.create({
        token,
        tokenHash,
        userId,
        userEmail,
        expiresAt,
        blacklistReason: reason,
        ipAddress,
        userAgent
      });
      
      logger.info(`Token blacklisted for user ${userEmail}`);
      return { success: true };
    } catch (error) {
      logger.error('Blacklist token error:', error);
      throw error;
    }
  }

  // Check if token is blacklisted
  async isTokenBlacklisted(token) {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      const blacklisted = await SessionBlacklist.findOne({
        where: {
          tokenHash,
          expiresAt: { [Op.gt]: new Date() }
        }
      });
      
      return !!blacklisted;
    } catch (error) {
      logger.error('Check token blacklisted error:', error);
      return true;
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    try {
      const decoded = this.verifyToken(refreshToken, 'refresh');
      if (!decoded) {
        throw new Error('Invalid refresh token');
      }
      
      const isBlacklisted = await this.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new Error('Token has been revoked');
      }
      
      const newAccessToken = this.generateAccessToken(decoded.id, decoded.role);
      const newRefreshToken = this.generateRefreshToken(decoded.id, decoded.role);
      
      // Blacklist old refresh token
      await this.blacklistToken(refreshToken, decoded.id, decoded.email || '', 'refreshed');
      
      return {
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('Refresh access token error:', error);
      throw error;
    }
  }

  // Clean expired blacklisted tokens
  async cleanExpiredTokens() {
    try {
      const result = await SessionBlacklist.destroy({
        where: {
          expiresAt: { [Op.lt]: new Date() }
        }
      });
      
      logger.info(`Cleaned ${result} expired blacklisted tokens`);
      return { success: true, deletedCount: result };
    } catch (error) {
      logger.error('Clean expired tokens error:', error);
      throw error;
    }
  }
}

module.exports = new TokenService();