// backend/utils/formatters.js
const moment = require('moment');

// Format date
const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return 'N/A';
  return moment(date).format(format);
};

// Format date with time
const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return 'N/A';
  return moment(date).format(format);
};

// Format time
const formatTime = (time, format = 'HH:mm') => {
  if (!time) return 'N/A';
  return moment(time, 'HH:mm:ss').format(format);
};

// Format currency (ETB)
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format number with commas
const formatNumber = (num) => {
  if (!num && num !== 0) return 'N/A';
  return new Intl.NumberFormat('en-US').format(num);
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format phone number
const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  // Format Ethiopian phone number: 0912345678 -> +251 91 234 5678
  if (phone.startsWith('09') || phone.startsWith('07')) {
    return `+251 ${phone.slice(1, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 10)}`;
  }
  return phone;
};

// Format student ID
const formatStudentId = (studentId) => {
  if (!studentId) return 'N/A';
  return studentId.toUpperCase();
};

// Format name (capitalize)
const formatName = (name) => {
  if (!name) return '';
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Truncate text
const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Format percentage
const formatPercentage = (value, decimals = 1) => {
  if (value === undefined || value === null) return 'N/A';
  return `${value.toFixed(decimals)}%`;
};

// Format duration (minutes to hours and minutes)
const formatDuration = (minutes) => {
  if (!minutes) return '0 min';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};

// Format computer specs
const formatComputerSpecs = (computer) => {
  return `${computer.cpu || 'N/A'} / ${computer.ram || 'N/A'} / ${computer.storage || 'N/A'}`;
};

// Format status to display text
const formatStatus = (status) => {
  const statusMap = {
    available: 'Available',
    'in-use': 'In Use',
    maintenance: 'Maintenance',
    damaged: 'Damaged',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    completed: 'Completed',
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
    active: 'Active',
    inactive: 'Inactive',
    borrowed: 'Borrowed',
    retired: 'Retired',
    lost: 'Lost'
  };
  return statusMap[status] || status;
};

// Format role to display text
const formatRole = (role) => {
  const roleMap = {
    admin: 'Administrator',
    teacher: 'Teacher',
    student: 'Student',
    lab_manager: 'Lab Manager',
    dean: 'Dean',
    lab_assistant: 'Lab Assistant',
    ict: 'ICT Staff',
    asset: 'Asset Manager'
  };
  return roleMap[role] || role;
};

// Format laboratory name
const formatLabName = (lab) => {
  return lab ? `Laboratory ${lab}` : 'Not Assigned';
};

// Format for CSV export
const toCSV = (data, headers) => {
  if (!data || data.length === 0) return '';
  
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

// Format for JSON response
const toJSON = (data, message = null, success = true) => {
  const response = { success };
  if (message) response.message = message;
  response.data = data;
  response.timestamp = new Date().toISOString();
  return response;
};

module.exports = {
  formatDate,
  formatDateTime,
  formatTime,
  formatCurrency,
  formatNumber,
  formatFileSize,
  formatPhoneNumber,
  formatStudentId,
  formatName,
  truncateText,
  formatPercentage,
  formatDuration,
  formatComputerSpecs,
  formatStatus,
  formatRole,
  formatLabName,
  toCSV,
  toJSON
};