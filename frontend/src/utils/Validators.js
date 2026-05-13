// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return emailRegex.test(email);
};

// Password validation (min 6 chars, at least one letter and one number)
export const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  return passwordRegex.test(password);
};

// Phone number validation (Ethiopian format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^09[0-9]{8}$/;
  return phoneRegex.test(phone);
};

// Student ID validation
export const isValidStudentId = (studentId) => {
  const studentIdRegex = /^[A-Z]{3}\/\d{4}\/\d{2}$/;
  return studentIdRegex.test(studentId);
};

// Required field validation
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

// Min length validation
export const minLength = (value, length) => {
  return value && value.length >= length;
};

// Max length validation
export const maxLength = (value, length) => {
  return value && value.length <= length;
};

// Number validation
export const isNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Positive number validation
export const isPositiveNumber = (value) => {
  return isNumber(value) && parseFloat(value) > 0;
};

// Date validation
export const isValidDate = (date) => {
  return !isNaN(Date.parse(date));
};

// Future date validation
export const isFutureDate = (date) => {
  return isValidDate(date) && new Date(date) > new Date();
};

// Past date validation
export const isPastDate = (date) => {
  return isValidDate(date) && new Date(date) < new Date();
};

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Form validation helper
export const validateForm = (data, rules) => {
  const errors = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    
    for (const [rule, param] of Object.entries(fieldRules)) {
      switch (rule) {
        case 'required':
          if (!isRequired(value)) {
            errors[field] = `${field} is required`;
          }
          break;
        case 'email':
          if (value && !isValidEmail(value)) {
            errors[field] = 'Invalid email format';
          }
          break;
        case 'password':
          if (value && !isValidPassword(value)) {
            errors[field] = 'Password must be at least 6 characters with letters and numbers';
          }
          break;
        case 'phone':
          if (value && !isValidPhone(value)) {
            errors[field] = 'Invalid phone number format';
          }
          break;
        case 'min':
          if (value && value.length < param) {
            errors[field] = `${field} must be at least ${param} characters`;
          }
          break;
        case 'max':
          if (value && value.length > param) {
            errors[field] = `${field} must not exceed ${param} characters`;
          }
          break;
        case 'match':
          if (value !== data[param]) {
            errors[field] = `${field} does not match ${param}`;
          }
          break;
      }
    }
  }
  
  return errors;
};

// Common validation rules
export const validationRules = {
  email: { required: true, email: true },
  password: { required: true, password: true },
  name: { required: true, min: 2, max: 100 },
  phone: { phone: true },
  studentId: { studentId: true },
  age: { number: true, positive: true }
};