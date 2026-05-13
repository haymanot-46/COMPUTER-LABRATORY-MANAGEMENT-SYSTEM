// backend/utils/helpers.js
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Generate random token
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate random OTP
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// Hash data
const hashData = async (data) => {
  return await bcrypt.hash(data, 10);
};

// Compare hash
const compareHash = async (data, hash) => {
  return await bcrypt.compare(data, hash);
};

// Sleep/delay
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry operation
const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay);
  }
};

// Deep clone object
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Pick specific fields from object
const pick = (obj, keys) => {
  const result = {};
  for (const key of keys) {
    if (obj && obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  }
  return result;
};

// Omit specific fields from object
const omit = (obj, keys) => {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
};

// Group array by key
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

// Calculate percentage
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

// Get date range (start and end of day)
const getDateRange = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

// Get week range
const getWeekRange = (date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  
  const monday = new Date(start.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { start: monday, end: sunday };
};

// Get month range
const getMonthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

// Check if two time ranges overlap
const isTimeOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

// Generate slug from string
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

// Parse query string for filters
const parseFilters = (query, allowedFields) => {
  const filters = {};
  for (const field of allowedFields) {
    if (query[field]) {
      filters[field] = query[field];
    }
  }
  return filters;
};

// Parse sort parameters
const parseSort = (sortBy, sortOrder = 'DESC') => {
  return [[sortBy, sortOrder]];
};

// Calculate age from date of birth
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Get Ethiopian time (EAT)
const getEthiopianTime = () => {
  const now = new Date();
  const eatOffset = 3 * 60 * 60 * 1000; // UTC+3
  return new Date(now.getTime() + eatOffset);
};

// Format Ethiopian date
const formatEthiopianDate = (date) => {
  // This is a simplified version; actual Ethiopian calendar conversion is complex
  return moment(date).format('YYYY-MM-DD');
};

// Generate random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Check if value is empty (null, undefined, empty string, empty array, empty object)
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Safe JSON parse
const safeJsonParse = (json, defaultValue = null) => {
  try {
    return JSON.parse(json);
  } catch (error) {
    return defaultValue;
  }
};

module.exports = {
  generateToken,
  generateOTP,
  hashData,
  compareHash,
  sleep,
  retry,
  deepClone,
  pick,
  omit,
  groupBy,
  calculatePercentage,
  getDateRange,
  getWeekRange,
  getMonthRange,
  isTimeOverlap,
  generateSlug,
  parseFilters,
  parseSort,
  calculateAge,
  getEthiopianTime,
  formatEthiopianDate,
  getRandomColor,
  isEmpty,
  safeJsonParse
};