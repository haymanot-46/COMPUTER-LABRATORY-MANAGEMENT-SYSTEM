const { emailQueue } = require('../config/queue');
const { sendEmail, sendWelcomeEmail, sendPasswordResetEmail, sendAttendanceSummary } = require('../config/mail');
const logger = require('../config/logger');

// Process email queue
emailQueue.process(async (job) => {
  const { type, data } = job.data;
  logger.info(`Processing email job: ${type}`);
  
  try {
    let result;
    
    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(data.email, data.name);
        break;
      case 'password_reset':
        result = await sendPasswordResetEmail(data.email, data.name, data.resetToken, data.resetUrl);
        break;
      case 'attendance_summary':
        result = await sendAttendanceSummary(data.email, data.name, data.summary);
        break;
      case 'custom':
        result = await sendEmail(data);
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }
    
    logger.info(`Email job completed: ${type} to ${data.email}`);
    return result;
  } catch (error) {
    logger.error(`Email job failed: ${type}`, error);
    throw error;
  }
});

// Email job creators
const sendWelcomeEmailJob = async (email, name) => {
  return await emailQueue.add({
    type: 'welcome',
    data: { email, name }
  });
};

const sendPasswordResetEmailJob = async (email, name, resetToken, resetUrl) => {
  return await emailQueue.add({
    type: 'password_reset',
    data: { email, name, resetToken, resetUrl }
  });
};

const sendAttendanceSummaryJob = async (email, name, summary) => {
  return await emailQueue.add({
    type: 'attendance_summary',
    data: { email, name, summary }
  });
};

const sendCustomEmailJob = async (to, subject, html, attachments = []) => {
  return await emailQueue.add({
    type: 'custom',
    data: { to, subject, html, attachments }
  });
};

// Bulk email job
const sendBulkEmailJob = async (recipients, subject, html) => {
  const jobs = [];
  for (const recipient of recipients) {
    jobs.push(
      emailQueue.add({
        type: 'custom',
        data: { to: recipient.email, subject, html }
      })
    );
  }
  
  const results = await Promise.all(jobs);
  logger.info(`Queued ${results.length} bulk emails`);
  return results;
};

module.exports = {
  sendWelcomeEmailJob,
  sendPasswordResetEmailJob,
  sendAttendanceSummaryJob,
  sendCustomEmailJob,
  sendBulkEmailJob
};