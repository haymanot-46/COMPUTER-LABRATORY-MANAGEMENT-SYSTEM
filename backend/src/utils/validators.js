// backend/utils/validators.js
const validator = require('validator');

// Validate email
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

// Validate Ethiopian phone number
const isValidEthiopianPhone = (phone) => {
  const ethiopianRegex = /^(09|07)[0-9]{8}$/;
  return ethiopianRegex.test(phone);
};

// Validate password strength
const isStrongPassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
    lengthValid: password.length >= minLength
  };
};

// Validate date range
const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }
  
  return start <= end;
};

// Validate time slot
const isValidTimeSlot = (startTime, endTime) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return false;
  }
  
  return startTime < endTime;
};

// Validate ID
const isValidId = (id) => {
  const num = parseInt(id);
  return !isNaN(num) && num > 0;
};

// Validate pagination params
const isValidPagination = (page, limit) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  return {
    page: !isNaN(pageNum) && pageNum > 0 ? pageNum : 1,
    limit: !isNaN(limitNum) && limitNum > 0 && limitNum <= 100 ? limitNum : 10
  };
};

// Validate URL
const isValidUrl = (url) => {
  return validator.isURL(url);
};

// Validate IP Address
const isValidIpAddress = (ip) => {
  return validator.isIP(ip);
};

// Validate MAC Address
const isValidMacAddress = (mac) => {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
};

// Validate date
const isValidDate = (date) => {
  const d = new Date(date);
  return !isNaN(d.getTime());
};

// Validate future date
const isFutureDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
};

// Validate past date
const isPastDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};

// Validate object has required fields
const hasRequiredFields = (obj, requiredFields) => {
  for (const field of requiredFields) {
    if (!obj[field] || obj[field].toString().trim() === '') {
      return false;
    }
  }
  return true;
};

// Validate email domain
const isValidEmailDomain = (email, allowedDomains = ['clms.com', 'gmail.com', 'yahoo.com']) => {
  const domain = email.split('@')[1];
  return allowedDomains.includes(domain);
};

// Validate Ethiopian student ID format
const isValidStudentId = (studentId) => {
  const regex = /^[A-Z]{3}\/\d{4}\/\d{2}$/;
  return regex.test(studentId);
};

// Validate file type
const isValidFileType = (mimeType, allowedTypes) => {
  return allowedTypes.includes(mimeType);
};

// Validate file size
const isValidFileSize = (size, maxSizeMB = 20) => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return size <= maxBytes;
};

// Validate username
const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// Validate year (academic year)
const isValidYear = (year) => {
  const currentYear = new Date().getFullYear();
  return year >= 2000 && year <= currentYear + 5;
};

module.exports = {
  isValidEmail,
  isValidEthiopianPhone,
  isStrongPassword,
  isValidDateRange,
  isValidTimeSlot,
  isValidId,
  isValidPagination,
  isValidUrl,
  isValidIpAddress,
  isValidMacAddress,
  isValidDate,
  isFutureDate,
  isPastDate,
  hasRequiredFields,
  isValidEmailDomain,
  isValidStudentId,
  isValidFileType,
  isValidFileSize,
  isValidUsername,
  isValidYear
};