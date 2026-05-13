const axios = require('axios');
require('dotenv').config();

// SMS configuration for Ethio Telecom (or other providers)
const smsConfig = {
  apiKey: process.env.SMS_API_KEY,
  sender: process.env.SMS_SENDER || 'CLMS',
  apiUrl: process.env.SMS_API_URL || 'https://api.ethiotelecom.et/sms',
  timeout: 10000
};

// Mock SMS provider for development (when no real SMS service)
const mockSendSMS = async (phoneNumber, message) => {
  console.log(`📱 [MOCK SMS] To: ${phoneNumber}`);
  console.log(`📝 Message: ${message}`);
  console.log(`✅ [MOCK SMS] Sent successfully`);
  return { success: true, messageId: `mock_${Date.now()}` };
};

// Real SMS provider (Ethio Telecom)
const sendRealSMS = async (phoneNumber, message) => {
  try {
    const response = await axios.post(
      smsConfig.apiUrl,
      {
        to: phoneNumber,
        from: smsConfig.sender,
        message: message,
        type: 'text'
      },
      {
        headers: {
          'Authorization': `Bearer ${smsConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: smsConfig.timeout
      }
    );
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('SMS sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Main send SMS function (uses mock if no API key)
const sendSMS = async (phoneNumber, message) => {
  if (!phoneNumber) {
    return { success: false, error: 'Phone number is required' };
  }
  
  // Use mock in development or if no API key
  if (process.env.NODE_ENV === 'development' || !smsConfig.apiKey) {
    return mockSendSMS(phoneNumber, message);
  }
  
  return sendRealSMS(phoneNumber, message);
};

// Send attendance notification
const sendAttendanceNotification = async (phoneNumber, studentName, courseName, status, date) => {
  const message = `CLMS: ${studentName}, your attendance for ${courseName} on ${date} has been marked as ${status}.`;
  return await sendSMS(phoneNumber, message);
};

// Send maintenance notification
const sendMaintenanceNotification = async (phoneNumber, computerName, status, notes) => {
  const message = `CLMS: Maintenance request for ${computerName} is now ${status}. ${notes || ''}`;
  return await sendSMS(phoneNumber, message);
};

// Send schedule reminder
const sendScheduleReminder = async (phoneNumber, courseName, lab, date, time) => {
  const message = `CLMS: Reminder - ${courseName} lab session in ${lab} on ${date} at ${time}.`;
  return await sendSMS(phoneNumber, message);
};

// Send emergency alert
const sendEmergencyAlert = async (phoneNumber, message, priority = 'high') => {
  const alertMessage = `⚠️ CLMS ALERT: ${message}`;
  return await sendSMS(phoneNumber, alertMessage);
};

// Send OTP for verification
const sendOTP = async (phoneNumber, otp) => {
  const message = `CLMS: Your verification code is ${otp}. Valid for 10 minutes.`;
  return await sendSMS(phoneNumber, message);
};

// Bulk send SMS
const sendBulkSMS = async (recipients, message) => {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendSMS(recipient.phone, message);
    results.push({
      phone: recipient.phone,
      name: recipient.name,
      success: result.success,
      error: result.error
    });
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`📱 Bulk SMS sent: ${successCount}/${recipients.length} successful`);
  
  return { success: true, results, successCount, total: recipients.length };
};

// Validate Ethiopian phone number
const validateEthiopianPhone = (phoneNumber) => {
  // Ethiopian phone numbers: 09XXXXXXXX or 07XXXXXXXX
  const ethiopianRegex = /^(09|07)[0-9]{8}$/;
  return ethiopianRegex.test(phoneNumber);
};

// Format phone number to international format
const formatPhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's Ethiopian number
  if (cleaned.startsWith('09') || cleaned.startsWith('07')) {
    return `+251${cleaned.substring(1)}`;
  }
  
  return phoneNumber;
};

module.exports = {
  sendSMS,
  sendAttendanceNotification,
  sendMaintenanceNotification,
  sendScheduleReminder,
  sendEmergencyAlert,
  sendOTP,
  sendBulkSMS,
  validateEthiopianPhone,
  formatPhoneNumber,
  smsConfig
};