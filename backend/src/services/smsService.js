const axios = require('axios');
const logger = require('../config/logger');

class SMSService {
  constructor() {
    this.apiKey = process.env.SMS_API_KEY;
    this.sender = process.env.SMS_SENDER || 'CLMS';
    this.apiUrl = process.env.SMS_API_URL;
    this.isConfigured = !!(this.apiKey && this.apiUrl);
  }

  // Send SMS
  async sendSMS(phoneNumber, message) {
    try {
      if (!this.isConfigured) {
        logger.info(`[MOCK SMS] To: ${phoneNumber}, Message: ${message}`);
        return { success: true, messageId: `mock_${Date.now()}` };
      }
      
      const response = await axios.post(
        this.apiUrl,
        {
          to: phoneNumber,
          from: this.sender,
          message: message,
          type: 'text'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      logger.info(`SMS sent to ${phoneNumber}: ${response.data?.messageId || 'success'}`);
      return { success: true, data: response.data };
    } catch (error) {
      logger.error('Send SMS error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send bulk SMS
  async sendBulkSMS(recipients, message) {
    try {
      const results = [];
      
      for (const recipient of recipients) {
        const result = await this.sendSMS(recipient.phone, message);
        results.push({
          phone: recipient.phone,
          name: recipient.name,
          success: result.success,
          error: result.error
        });
      }
      
      const successCount = results.filter(r => r.success).length;
      logger.info(`Bulk SMS sent: ${successCount}/${recipients.length} successful`);
      
      return { success: true, results, successCount, total: recipients.length };
    } catch (error) {
      logger.error('Send bulk SMS error:', error);
      throw error;
    }
  }

  // Send attendance notification
  async sendAttendanceNotification(phoneNumber, studentName, courseName, status, date) {
    const message = `CLMS: ${studentName}, your attendance for ${courseName} on ${date} has been marked as ${status}.`;
    return await this.sendSMS(phoneNumber, message);
  }

  // Send schedule reminder
  async sendScheduleReminder(phoneNumber, courseName, lab, date, time) {
    const message = `CLMS: Reminder - ${courseName} lab session in ${lab} on ${date} at ${time}.`;
    return await this.sendSMS(phoneNumber, message);
  }

  // Send maintenance notification
  async sendMaintenanceNotification(phoneNumber, computerName, status, notes) {
    const message = `CLMS: Maintenance request for ${computerName} is now ${status}. ${notes || ''}`;
    return await this.sendSMS(phoneNumber, message);
  }

  // Send emergency alert
  async sendEmergencyAlert(phoneNumber, message, priority = 'high') {
    const alertMessage = `⚠️ CLMS ALERT: ${message}`;
    return await this.sendSMS(phoneNumber, alertMessage);
  }

  // Send OTP
  async sendOTP(phoneNumber, otp) {
    const message = `CLMS: Your verification code is ${otp}. Valid for 10 minutes.`;
    return await this.sendSMS(phoneNumber, message);
  }

  // Send system alert to all admins
  async sendAdminAlert(message) {
    // This would fetch admin phone numbers from database
    logger.info(`[ADMIN ALERT] ${message}`);
    return { success: true, message: 'Admin alert sent' };
  }

  // Validate Ethiopian phone number
  validateEthiopianPhone(phoneNumber) {
    const ethiopianRegex = /^(09|07)[0-9]{8}$/;
    return ethiopianRegex.test(phoneNumber);
  }

  // Format phone number to international format
  formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('09') || cleaned.startsWith('07')) {
      return `+251${cleaned.substring(1)}`;
    }
    
    return phoneNumber;
  }
}

module.exports = new SMSService();