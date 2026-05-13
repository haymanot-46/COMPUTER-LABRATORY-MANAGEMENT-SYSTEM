const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, SessionBlacklist } = require('../models');
const { sendWelcomeEmail, sendPasswordResetEmail, sendEmailVerification } = require('../config/mail');
const logger = require('../config/logger');

class AuthService {
  // Generate JWT token
  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
  }

  // Generate refresh token
  generateRefreshToken(userId) {
    return jwt.sign(
      { id: userId, type: 'refresh' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '60d' }
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

  // Register new user
  async register(userData) {
    try {
      const { email, password, firstName, lastName, role, phone, studentId, department } = userData;

      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Create verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Create user
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role: role || 'student',
        phone,
        studentId,
        department,
        emailVerificationToken: verificationToken,
        isEmailVerified: false
      });

      // Send welcome email with verification link
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      await sendEmailVerification(email, `${firstName} ${lastName}`, verificationUrl);

      // Generate tokens
      const token = this.generateToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      return {
        success: true,
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          department: user.department,
          studentId: user.studentId,
          isEmailVerified: user.isEmailVerified
        }
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(email, password, ipAddress, userAgent) {
    try {
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact admin.');
      }

      if (user.isLocked()) {
        throw new Error('Account is locked. Please try again later.');
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await user.incrementFailedAttempts();
        throw new Error('Invalid email or password');
      }

      // Reset failed attempts on successful login
      await user.resetFailedAttempts();
      await user.update({ 
        lastLogin: new Date(),
        lastLoginIp: ipAddress
      });

      const token = this.generateToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      return {
        success: true,
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          department: user.department,
          studentId: user.studentId,
          phone: user.phone,
          profilePicture: user.profilePicture,
          isEmailVerified: user.isEmailVerified
        }
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  async logout(token, userId, userEmail, ipAddress, userAgent) {
    try {
      await SessionBlacklist.addToBlacklist(token, userId, userEmail, 'logout', ipAddress, userAgent);
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      const decoded = this.verifyToken(refreshToken);
      if (!decoded || decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      const user = await User.findByPk(decoded.id);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      const newToken = this.generateToken(user.id);
      const newRefreshToken = this.generateRefreshToken(user.id);

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

  // Verify email
  async verifyEmail(token) {
    try {
      const user = await User.findOne({ where: { emailVerificationToken: token } });
      
      if (!user) {
        throw new Error('Invalid verification token');
      }

      if (user.isEmailVerified) {
        throw new Error('Email already verified');
      }

      await user.update({
        isEmailVerified: true,
        emailVerificationToken: null
      });

      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        throw new Error('User not found with this email');
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await user.update({
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetTokenExpiry
      });

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await sendPasswordResetEmail(email, `${user.firstName} ${user.lastName}`, resetToken, resetUrl);

      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const user = await User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpiry: { [Op.gt]: new Date() }
        }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      user.password = newPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpiry = null;
      await user.save();

      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }

      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      user.password = newPassword;
      await user.save();

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get user error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      await user.update(profileData);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          department: user.department,
          profilePicture: user.profilePicture
        }
      };
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();