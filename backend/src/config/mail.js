const nodemailer = require('nodemailer');
require('dotenv').config();

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  from: process.env.SMTP_FROM || 'CLMS <noreply@clms.com>'
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Verify connection
const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service configured successfully');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

// Send email
const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  try {
    const mailOptions = {
      from: emailConfig.from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      attachments
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to CLMS - Computer Laboratory Management System';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a3a4f;">Welcome to CLMS!</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your account has been successfully created in the Computer Laboratory Management System.</p>
      <p>You can now log in using your email address.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Login URL:</strong> ${process.env.FRONTEND_URL || 'http://localhost:5173'}</p>
      </div>
      <p>If you have any questions, please contact the system administrator.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #888; font-size: 12px;">&copy; ${new Date().getFullYear()} CLMS - Injibara University</p>
    </div>
  `;
  
  return await sendEmail({ to: email, subject, html });
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, resetToken, resetUrl) => {
  const subject = 'Password Reset Request - CLMS';
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
  
  return await sendEmail({ to: email, subject, html });
};

// Send attendance summary email
const sendAttendanceSummary = async (email, name, summary) => {
  const subject = 'Attendance Summary - CLMS';
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
  
  return await sendEmail({ to: email, subject, html });
};

module.exports = {
  transporter,
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAttendanceSummary,
  verifyEmailConnection
};