import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Avatar,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  CheckCircle as CheckCircleIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNotification } from '../../../hooks';
import { authService } from '../../../services';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: '',
    year: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});

  const departments = [
    'Computer Science',
    'Software Engineering',
    'Information Technology',
    'Information Systems',
    'Computer Engineering'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

  const steps = ['Profile Photo', 'Personal Information', 'Academic Details', 'Account Setup'];

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size must be less than 5MB', 'error');
      return;
    }
    
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result);
      setProfileImage(reader.result.split(',')[1]); // Store base64 without prefix
      addToast('Photo selected successfully!', 'success');
      setUploadingPhoto(false);
    };
    reader.onerror = () => {
      addToast('Failed to load image', 'error');
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const removeProfileImage = () => {
    setProfileImagePreview(null);
    setProfileImage(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep0 = () => {
    // Photo is optional, always valid
    return true;
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
    if (!formData.email.includes('.com') && !formData.email.includes('.edu.et')) {
      if (formData.email.includes('@')) {
        // Allow but warn
      }
    }
    if (formData.phone && !/^09[0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid Ethiopian phone number (e.g., 0912345678)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (formData.studentId && !/^[A-Z]{3}\/\d{4}\/\d{2}$/.test(formData.studentId)) {
      newErrors.studentId = 'Invalid format (e.g., CNS/1234/12)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    if (activeStep === 0) isValid = validateStep0();
    if (activeStep === 1) isValid = validateStep1();
    if (activeStep === 2) isValid = validateStep2();
    if (activeStep === 3) isValid = validateStep3();
    
    if (isValid) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/');
    } else {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    
    setLoading(true);
    
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: 'student',
      student_id: formData.studentId,
      department: formData.department,
      phone: formData.phone,
      profile_image: profileImage ? `data:image/jpeg;base64,${profileImage}` : null
    };
    
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        setSuccessOpen(true);
        addToast(result.message || 'Registration successful! Please login.', 'success');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        addToast(result.message || 'Registration failed', 'error');
        setActiveStep(0);
      }
    } catch (error) {
      console.error('Registration error:', error);
      addToast('Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { text: 'Weak', color: '#f44336', width: '33%' };
    if (strength <= 4) return { text: 'Medium', color: '#ff9800', width: '66%' };
    return { text: 'Strong', color: '#4caf50', width: '100%' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="register-page">
      <div className="register-background">
        <div className="bg-gradient"></div>
      </div>

      <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
        <Paper elevation={3} className="register-card">
          {/* Back Button */}
          <IconButton onClick={handleBack} className="back-button" aria-label="back">
            <ArrowBackIcon />
          </IconButton>

          {/* Header */}
          <Box className="register-header">
            <Avatar className="logo-avatar">
              <PersonAddIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" className="title">
              Create Account
            </Typography>
            <Typography variant="body2" className="subtitle">
              Join the Computer Laboratory Management System
            </Typography>
            <Typography variant="caption" className="university">
              Injibara University
            </Typography>
          </Box>

          {/* Stepper */}
          <Box sx={{ px: 2, pt: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Form */}
          <Box className="register-form-container">
            {activeStep === 0 && (
              <Box className="form-step" sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Profile Photo (Optional)
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Add a profile photo to personalize your account
                </Typography>
                
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <IconButton
                        sx={{
                          bgcolor: '#667eea',
                          color: 'white',
                          '&:hover': { bgcolor: '#5a67d8' },
                          width: 36,
                          height: 36
                        }}
                        component="label"
                        disabled={uploadingPhoto}
                      >
                        <PhotoCameraIcon sx={{ fontSize: 20 }} />
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </IconButton>
                    }
                  >
                    <Avatar
                      src={profileImagePreview}
                      sx={{
                        width: 150,
                        height: 150,
                        bgcolor: '#667eea',
                        fontSize: 60,
                        border: '4px solid white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    >
                      {!profileImagePreview && (formData.name?.charAt(0) || 'U')}
                    </Avatar>
                  </Badge>
                  
                  {profileImagePreview && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        bgcolor: '#ef4444',
                        color: 'white',
                        '&:hover': { bgcolor: '#dc2626' },
                        width: 32,
                        height: 32
                      }}
                      onClick={removeProfileImage}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Box>
                
                {uploadingPhoto && (
                  <Box sx={{ mt: 2 }}>
                    <CircularProgress size={24} />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      Loading...
                    </Typography>
                  </Box>
                )}
                
                <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                  Click the camera icon to upload a photo<br />
                  Max size: 5MB (JPG, PNG, GIF)
                </Typography>
              </Box>
            )}

            {activeStep === 1 && (
              <Box className="form-step">
                <TextField
                  fullWidth
                  label="Full Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name}
                />
                <TextField
                  fullWidth
                  label="Email Address *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  margin="normal"
                  error={!!errors.phone}
                  helperText={errors.phone || 'e.g., 0912345678'}
                />
              </Box>
            )}

            {activeStep === 2 && (
              <Box className="form-step">
                <TextField
                  fullWidth
                  label="Student ID"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="e.g., CNS/1234/12"
                  margin="normal"
                  error={!!errors.studentId}
                  helperText={errors.studentId || 'Format: XXX/YYYY/ZZ (Optional)'}
                />
                <TextField
                  fullWidth
                  select
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  margin="normal"
                  SelectProps={{ native: true }}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  select
                  label="Year of Study"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  margin="normal"
                  SelectProps={{ native: true }}
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </TextField>
              </Box>
            )}

            {activeStep === 3 && (
              <Box className="form-step">
                <TextField
                  fullWidth
                  label="Password *"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password || 'Minimum 6 characters'}
                />
                {formData.password && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={parseInt(passwordStrength.width)} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': { bgcolor: passwordStrength.color }
                      }} 
                    />
                    <Typography variant="caption" sx={{ color: passwordStrength.color }}>
                      Strength: {passwordStrength.text}
                    </Typography>
                  </Box>
                )}
                <TextField
                  fullWidth
                  label="Confirm Password *"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  margin="normal"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I accept the <Link to="/terms" target="_blank">Terms and Conditions</Link> and{' '}
                      <Link to="/privacy" target="_blank">Privacy Policy</Link>
                    </Typography>
                  }
                  sx={{ mt: 2 }}
                />
                {errors.acceptTerms && (
                  <Typography variant="caption" color="error">{errors.acceptTerms}</Typography>
                )}
              </Box>
            )}

            {/* Navigation Buttons */}
            <Box className="navigation-buttons">
              <Button
                variant="outlined"
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
              >
                {activeStep === 0 ? 'Back to Home' : 'Back'}
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  className="next-button"
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                </Button>
              )}
            </Box>
          </Box>

          {/* Footer */}
          <Box className="register-footer">
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/login" className="login-link-text">
                Sign In
              </Link>
            </Typography>
            <Typography variant="caption" className="info-note">
               After registration, you will receive a verification email to activate your account.
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" icon={<CheckCircleIcon />}>
          Registration successful! Redirecting to login...
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RegisterPage;