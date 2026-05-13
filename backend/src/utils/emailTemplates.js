// backend/utils/emailTemplates.js

// Welcome email template
const welcomeEmail = (name, loginUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a3a4f 0%, #0f2b3d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .logo { font-size: 32px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🖥️</div>
          <h1>Welcome to CLMS</h1>
          <p>Computer Laboratory Management System</p>
        </div>
        <div class="content">
          <h2>Dear ${name},</h2>
          <p>Welcome to the Computer Laboratory Management System (CLMS) at Injibara University!</p>
          <p>Your account has been successfully created. You can now log in to access laboratory management features, schedule lab sessions, track attendance, and more.</p>
          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Login to Your Account</a>
          </div>
          <p><strong>Login URL:</strong> ${loginUrl}</p>
          <p>If you have any questions or need assistance, please contact the system administrator.</p>
          <p>Best regards,<br>CLMS Team<br>Injibara University</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Injibara University - Computer Laboratory Management System</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Password reset email template
const passwordResetEmail = (name, resetUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a3a4f 0%, #0f2b3d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🔐</div>
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Dear ${name},</h2>
          <p>We received a request to reset your password for your CLMS account.</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul style="margin: 10px 0 0 20px;">
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>For security reasons, do not share this link with anyone</li>
            </ul>
          </div>
          <p>Best regards,<br>CLMS Team<br>Injibara University</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Injibara University - Computer Laboratory Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email verification template
const emailVerificationTemplate = (name, verificationUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a3a4f 0%, #0f2b3d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📧</div>
          <h1>Verify Your Email Address</h1>
        </div>
        <div class="content">
          <h2>Dear ${name},</h2>
          <p>Thank you for registering with CLMS! Please verify your email address to complete your registration.</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          <p>Or copy this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>After verification, you'll have full access to all CLMS features.</p>
          <p>Best regards,<br>CLMS Team<br>Injibara University</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Injibara University - Computer Laboratory Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Attendance summary email template
const attendanceSummaryTemplate = (name, summary, reportUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a3a4f 0%, #0f2b3d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; text-align: center; }
        .stat-box { background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); flex: 1; margin: 0 5px; }
        .stat-value { font-size: 24px; font-weight: bold; color: #1a3a4f; }
        .stat-label { font-size: 12px; color: #666; }
        .progress-bar { background: #e0e0e0; border-radius: 10px; height: 20px; overflow: hidden; margin: 20px 0; }
        .progress-fill { background: #10b981; height: 100%; width: ${summary.rate}%; }
        .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📊</div>
          <h1>Attendance Summary</h1>
        </div>
        <div class="content">
          <h2>Dear ${name},</h2>
          <p>Here is your attendance summary for the current period:</p>
          
          <div class="stats">
            <div class="stat-box">
              <div class="stat-value">${summary.total}</div>
              <div class="stat-label">Total Sessions</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${summary.present}</div>
              <div class="stat-label">Present</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${summary.absent}</div>
              <div class="stat-label">Absent</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${summary.late}</div>
              <div class="stat-label">Late</div>
            </div>
          </div>
          
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <p style="text-align: center;"><strong>Overall Attendance Rate: ${summary.rate}%</strong></p>
          
          <div style="text-align: center;">
            <a href="${reportUrl}" class="button">View Full Report</a>
          </div>
          
          <p>Login to your account to view detailed attendance records and download reports.</p>
          <p>Best regards,<br>CLMS Team<br>Injibara University</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Injibara University - Computer Laboratory Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Schedule reminder email template
const scheduleReminderTemplate = (name, schedule, calendarUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a3a4f 0%, #0f2b3d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .schedule-details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .detail-row { display: flex; margin: 10px 0; }
        .detail-label { width: 100px; font-weight: bold; color: #666; }
        .detail-value { flex: 1; color: #333; }
        .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📅</div>
          <h1>Lab Session Reminder</h1>
        </div>
        <div class="content">
          <h2>Dear ${name},</h2>
          <p>This is a reminder for your upcoming lab session:</p>
          
          <div class="schedule-details">
            <div class="detail-row">
              <div class="detail-label">Course:</div>
              <div class="detail-value"><strong>${schedule.course}</strong></div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Title:</div>
              <div class="detail-value">${schedule.title}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Laboratory:</div>
              <div class="detail-value">${schedule.lab}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Date:</div>
              <div class="detail-value">${schedule.date}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Time:</div>
              <div class="detail-value">${schedule.startTime} - ${schedule.endTime}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Instructor:</div>
              <div class="detail-value">${schedule.instructor}</div>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${calendarUrl}" class="button">Add to Calendar</a>
          </div>
          
          <p>Please arrive on time and bring your student ID.</p>
          <p>Best regards,<br>CLMS Team<br>Injibara University</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Injibara University - Computer Laboratory Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Maintenance notification email template
const maintenanceNotificationTemplate = (name, request, status, notes) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a3a4f 0%, #0f2b3d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status { display: inline-block; padding: 5px 10px; border-radius: 5px; font-weight: bold; }
        .status-completed { background: #d1fae5; color: #10b981; }
        .status-in-progress { background: #dbeafe; color: #3b82f6; }
        .status-pending { background: #fef3c7; color: #d97706; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🔧</div>
          <h1>Maintenance Request Update</h1>
        </div>
        <div class="content">
          <h2>Dear ${name},</h2>
          <p>Your maintenance request has been updated:</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Request #:</strong> ${request.id}</p>
            <p><strong>Computer:</strong> ${request.computer}</p>
            <p><strong>Issue:</strong> ${request.issue}</p>
            <p><strong>Status:</strong> <span class="status status-${status}">${status.toUpperCase()}</span></p>
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          </div>
          
          <p>You can track the progress of your request by logging into the CLMS portal.</p>
          <p>Best regards,<br>CLMS Team<br>Injibara University</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Injibara University - Computer Laboratory Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Equipment borrowing notification template
const equipmentBorrowingTemplate = (name, equipment, borrowDate, returnDate) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a3a4f 0%, #0f2b3d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📦</div>
          <h1>Equipment Borrowing Confirmation</h1>
        </div>
        <div class="content">
          <h2>Dear ${name},</h2>
          <p>Your equipment borrowing request has been confirmed:</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Equipment:</strong> ${equipment.name} (${equipment.code})</p>
            <p><strong>Borrowed Date:</strong> ${borrowDate}</p>
            <p><strong>Expected Return Date:</strong> ${returnDate}</p>
          </div>
          
          <p>Please return the equipment by the specified date in good condition.</p>
          <p>Best regards,<br>CLMS Team<br>Injibara University</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Injibara University - Computer Laboratory Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// System alert email template
const systemAlertTemplate = (alert) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #dc2626; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚠️</div>
          <h1>System Alert</h1>
        </div>
        <div class="content">
          <div class="alert-details">
            <p><strong>Alert Type:</strong> ${alert.type}</p>
            <p><strong>Severity:</strong> ${alert.severity}</p>
            <p><strong>Message:</strong> ${alert.message}</p>
            <p><strong>Time:</strong> ${alert.timestamp}</p>
            ${alert.action ? `<p><strong>Action Required:</strong> ${alert.action}</p>` : ''}
          </div>
          
          <p>Please take necessary action as soon as possible.</p>
          <p>Best regards,<br>CLMS Team<br>Injibara University</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Injibara University - Computer Laboratory Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  welcomeEmail,
  passwordResetEmail,
  emailVerificationTemplate,
  attendanceSummaryTemplate,
  scheduleReminderTemplate,
  maintenanceNotificationTemplate,
  equipmentBorrowingTemplate,
  systemAlertTemplate
};