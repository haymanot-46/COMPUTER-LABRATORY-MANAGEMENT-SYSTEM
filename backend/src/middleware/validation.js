// Simple validation without express-validator

// Validation error handler
const validate = (req, res, next) => {
  if (req.validationErrors) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: req.validationErrors
    });
  }
  next();
};

// User validation rules
const userValidation = {
  register: (req, res, next) => {
    const { email, password, name } = req.body;
    const errors = [];
    
    if (!email || !email.includes('@')) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }
    if (!password || password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }
    if (!name) {
      errors.push({ field: 'name', message: 'Name is required' });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    next();
  },
  
  login: (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];
    
    if (!email || !email.includes('@')) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }
    if (!password) {
      errors.push({ field: password, message: 'Password is required' });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    next();
  }
};

// Computer validation rules
const computerValidation = {
  create: (req, res, next) => {
    const { name, model, lab } = req.body;
    const errors = [];
    
    if (!name) errors.push({ field: 'name', message: 'Computer name is required' });
    if (!model) errors.push({ field: 'model', message: 'Model is required' });
    if (!lab) errors.push({ field: 'lab', message: 'Laboratory is required' });
    
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    next();
  },
  
  updateStatus: (req, res, next) => {
    const { status } = req.body;
    const validStatuses = ['available', 'in-use', 'maintenance', 'damaged'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      });
    }
    next();
  }
};

// Schedule validation rules
const scheduleValidation = {
  create: (req, res, next) => {
    const { title, lab, date, startTime, endTime } = req.body;
    const errors = [];
    
    if (!title) errors.push({ field: 'title', message: 'Title is required' });
    if (!lab) errors.push({ field: 'lab', message: 'Laboratory is required' });
    if (!date) errors.push({ field: 'date', message: 'Date is required' });
    if (!startTime) errors.push({ field: 'startTime', message: 'Start time is required' });
    if (!endTime) errors.push({ field: 'endTime', message: 'End time is required' });
    
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    next();
  },
  
  approve: (req, res, next) => {
    // Comments are optional
    next();
  },
  
  reject: (req, res, next) => {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rejection reason is required' 
      });
    }
    next();
  }
};

// Maintenance validation rules
const maintenanceValidation = {
  create: (req, res, next) => {
    const { title, computerId, lab, description } = req.body;
    const errors = [];
    
    if (!title) errors.push({ field: 'title', message: 'Title is required' });
    if (!computerId) errors.push({ field: 'computerId', message: 'Computer ID is required' });
    if (!lab) errors.push({ field: 'lab', message: 'Laboratory is required' });
    if (!description) errors.push({ field: 'description', message: 'Description is required' });
    
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    next();
  },
  
  assign: (req, res, next) => {
    const { technicianId } = req.body;
    if (!technicianId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Technician ID is required' 
      });
    }
    next();
  },
  
  complete: (req, res, next) => {
    const { resolution } = req.body;
    if (!resolution) {
      return res.status(400).json({ 
        success: false, 
        message: 'Resolution is required' 
      });
    }
    next();
  }
};

// Extend userValidation for profile updates
userValidation.updateProfile = (req, res, next) => {
  const { email, name } = req.body;
  const errors = [];
  if (email && !email.includes('@')) errors.push({ field: 'email', message: 'Valid email is required' });
  if (name && name.length < 2) errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

// ID param validation
const idValidation = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid ID parameter' 
    });
  }
  next();
};

// Pagination validation
const paginationValidation = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Page must be a positive integer' 
    });
  }
  
  if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Limit must be between 1 and 100' 
    });
  }
  
  next();
};

// Date range validation
const dateRangeValidation = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && isNaN(Date.parse(startDate))) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid start date format' 
    });
  }
  
  if (endDate && isNaN(Date.parse(endDate))) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid end date format' 
    });
  }
  
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Start date must be before end date' 
    });
  }
  
  next();
};

// Attendance validation rules
const attendanceValidation = {
  mark: (req, res, next) => {
    const { scheduleId, status } = req.body;
    const errors = [];
    if (!scheduleId) errors.push({ field: 'scheduleId', message: 'Schedule ID is required' });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    next();
  }
};

// Equipment validation rules
const equipmentValidation = {
  create: (req, res, next) => {
    const { name, category } = req.body;
    const errors = [];
    if (!name) errors.push({ field: 'name', message: 'Equipment name is required' });
    if (!category) errors.push({ field: 'category', message: 'Category is required' });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    next();
  },
  borrow: (req, res, next) => {
    const { equipmentId } = req.body;
    const errors = [];
    if (!equipmentId) errors.push({ field: 'equipmentId', message: 'Equipment ID is required' });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    next();
  }
};

module.exports = {
  userValidation,
  computerValidation,
  scheduleValidation,
  maintenanceValidation,
  attendanceValidation,
  equipmentValidation,
  idValidation,
  paginationValidation,
  dateRangeValidation
};
