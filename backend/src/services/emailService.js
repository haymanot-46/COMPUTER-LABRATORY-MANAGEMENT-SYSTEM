const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  init() {
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  async sendEmail(to, subject, html, text = null, attachments = []) {
    try {
      if (!this.transporter) {
        console.log('Email not configured. Would send:', { to, subject });
        return { success: true, message: 'Email would be sent (not configured)' };
      }

      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'CLMS <noreply@clms.com>',
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
        attachments
      });

      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Send email error:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email, name) {
    const subject = 'Welcome to CLMS';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a3a4f;">Welcome to CLMS!</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your account has been successfully created in the Computer Laboratory Management System.</p>
        <p>You can now log in using your email address.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Login URL:</strong> ${process.env.FRONTEND_URL}</p>
        </div>
        <p>If you have any questions, please contact the system administrator.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">&copy; ${new Date().getFullYear()} CLMS - Injibara University</p>
      </div>
    `;
    return await this.sendEmail(email, subject, html);
  }

  async sendPasswordResetEmail(email, name, resetToken, resetUrl) {
    const subject = 'Password Reset Request';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a3a4f;">Password Reset Request</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>We received a request to reset your password for your CLMS account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">&copy; ${new Date().getFullYear()} CLMS - Injibara University</p>
      </div>
    `;
    return await this.sendEmail(email, subject, html);
  }

  async sendEmailVerification(email, name, verificationUrl) {
    const subject = 'Verify Your Email Address';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a3a4f;">Verify Your Email Address</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Please verify your email address to complete your registration.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>Or copy this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">&copy; ${new Date().getFullYear()} CLMS - Injibara University</p>
      </div>
    `;
    return await this.sendEmail(email, subject, html);
  }

  async sendAttendanceSummary(email, name, summary) {
    const subject = 'Attendance Summary';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a3a4f;">Your Attendance Summary</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Here is your attendance summary for the current period:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Total Sessions:</strong> ${summary.total}</p>
          <p><strong>Present:</strong> ${summary.present}</p>
          <p><strong>Absent:</strong> ${summary.absent}</p>
          <p><strong>Late:</strong> ${summary.late}</p>
          <p><strong>Attendance Rate:</strong> ${summary.rate}%</p>
        </div>
        <p>Login to view detailed attendance reports.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">&copy; ${new Date().getFullYear()} CLMS - Injibara University</p>
      </div>
    `;
    return await this.sendEmail(email, subject, html);
  }

  async sendBulkEmail(recipients, subject, html) {
    const results = [];
    for (const recipient of recipients) {
      const result = await this.sendEmail(recipient.email, subject, html);
      results.push({ email: recipient.email, success: result.success });
    }
    return { success: true, results };
  }
}

module.exports = new EmailService();