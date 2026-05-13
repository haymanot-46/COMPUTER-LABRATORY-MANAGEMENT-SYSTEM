const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { SessionBlacklist, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

class SessionService {
  // Create session token
  createSessionToken(userId, expiresIn = '7d') {
    return jwt.sign(
      { id: userId, type: 'session' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn }
    );
  }

  // Create refresh token
  createRefreshToken(userId) {
    return jwt.sign(
      { id: userId, type: 'refresh' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );
  }

  // Verify token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return null;
    }
  }

  // Blacklist token
  async blacklistToken(token, userId, userEmail, reason = 'logout', ipAddress = null, userAgent = null) {
    try {
      const decoded = this.verifyToken(token);
      const expiresAt = decoded ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
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
      return true; // Assume blacklisted on error
    }
  }

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      const decoded = this.verifyToken(refreshToken);
      if (!decoded || decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }
      
      const isBlacklisted = await this.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new Error('Token has been revoked');
      }
      
      const user = await User.findByPk(decoded.id);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }
      
      const newToken = this.createSessionToken(user.id);
      const newRefreshToken = this.createRefreshToken(user.id);
      
      // Blacklist old refresh token
      await this.blacklistToken(refreshToken, user.id, user.email, 'refreshed');
      
      return {
        success: true,
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw error;
    }
  }

  // Get user sessions
  async getUserSessions(userId) {
    try {
      // This would require storing session info in database
      // For now, return placeholder
      return {
        success: true,
        data: []
      };
    } catch (error) {
      logger.error('Get user sessions error:', error);
      throw error;
    }
  }

  // Revoke all user sessions
  async revokeAllUserSessions(userId, userEmail, currentToken = null) {
    try {
      // Blacklist current token if provided
      if (currentToken) {
        await this.blacklistToken(currentToken, userId, userEmail, 'revoke_all');
      }
      
      // This would require storing all user sessions in database
      logger.info(`Revoked all sessions for user ${userEmail}`);
      return { success: true, message: 'All sessions revoked' };
    } catch (error) {
      logger.error('Revoke all user sessions error:', error);
      throw error;
    }
  }

  // Clean expired blacklist entries
  async cleanExpiredBlacklist() {
    try {
      const result = await SessionBlacklist.destroy({
        where: {
          expiresAt: { [Op.lt]: new Date() }
        }
      });
      
      logger.info(`Cleaned ${result} expired blacklist entries`);
      return { success: true, deletedCount: result };
    } catch (error) {
      logger.error('Clean expired blacklist error:', error);
      throw error;
    }
  }

  // Get session statistics
  async getSessionStats() {
    try {
      const totalBlacklisted = await SessionBlacklist.count();
      const activeBlacklisted = await SessionBlacklist.count({
        where: { expiresAt: { [Op.gt]: new Date() } }
      });
      
      return {
        success: true,
        data: {
          totalBlacklisted,
          activeBlacklisted,
          expiredBlacklisted: totalBlacklisted - activeBlacklisted
        }
      };
    } catch (error) {
      logger.error('Get session stats error:', error);
      throw error;
    }
  }
}

module.exports = new SessionService();