import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
  Divider,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  Login as LoginIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  ArrowBack as ArrowBackIcon,
  Computer as ComputerIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useAuth, useNotification } from '../../../hooks';
import { authService } from '../../../services';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useNotification();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  // Function to normalize role (handle both underscore and hyphen)
  const normalizeRole = (role) => {
    const roleMap = {
      'lab-manager': 'lab_manager',
      'lab_manager': 'lab_manager',
      'lab-assistant': 'lab_assistant',
      'lab_assistant': 'lab_assistant',
      'admin': 'admin',
      'teacher': 'teacher',
      'student': 'student',
      'dean': 'dean',
      'ict': 'ict',
      'asset': 'asset'
    };
    return roleMap[role] || role;
  };

  // Function to get dashboard route from role
  const getDashboardRoute = (role) => {
    const normalizedRole = normalizeRole(role);
    
    const routeMap = {
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
      lab_manager: '/lab-manager/dashboard',
      dean: '/dean/dashboard',
      lab_assistant: '/lab-assistant/dashboard',
      ict: '/ict/dashboard',
      asset: '/asset/dashboard'
    };
    
    return routeMap[normalizedRole] || '/dashboard';
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));
    setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
        setError('Please enter both email and password');
        return;
    }
    
    setLoading(true);
    setError('');
    
    try {
        const result = await authService.login({
            email: formData.email,
            password: formData.password
        });
        
        if (result.success) {
            // ✅ Get normalized role
            const role = result.user.role;
            
            console.log('🔐 Login successful. Role:', role);
            
            // ✅ Map role to dashboard route
            const dashboardRoutes = {
                admin: '/admin/dashboard',
                teacher: '/teacher/dashboard',
                student: '/student/dashboard',
                lab_manager: '/lab-manager/dashboard',
                dean: '/dean/dashboard',
                lab_assistant: '/lab-assistant/dashboard',
                ict: '/ict/dashboard',
                asset: '/asset/dashboard'
            };
            
            const dashboardPath = dashboardRoutes[role];
            
            if (!dashboardPath) {
                console.error('❌ Unknown role:', role);
                setError(`Unknown role: ${role}. Please contact administrator.`);
                setLoading(false);
                return;
            }
            
            console.log('🎯 Redirecting to:', dashboardPath);
            
            addToast(`Welcome ${result.user.name}!`, 'success');
            
            setTimeout(() => {
                navigate(dashboardPath);
            }, 500);
            
        } else {
            setError(result.message || 'Invalid email or password');
        }
    } catch (err) {
        console.error('Login error:', err);
        setError('Unable to connect to server. Please try again.');
    } finally {
        setLoading(false);
    }
};

  const handleBack = () => {
    navigate('/');
  };

  const fillDemoCredentials = (email, password) => {
    setFormData({
      email: email,
      password: password,
      rememberMe: false
    });
    setError('');
  };

  return (
    <div className="login-page">
      {/* Background with gradient */}
      <div className="login-background">
        <div className="bg-gradient"></div>
      </div>

      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
        <Paper elevation={3} className="login-card">
          {/* Back Button */}
          <IconButton onClick={handleBack} className="back-button" aria-label="back">
            <ArrowBackIcon /> back to home
          </IconButton>

          {/* Header */}
          <Box className="login-header">
            <Avatar className="logo-avatar">
              <ComputerIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" className="title">
              Welcome Back
            </Typography>
            <Typography variant="body2" className="subtitle">
              Sign in to access computer laboratory management dashboard
            </Typography>
            <Typography variant="caption" className="university">
              Injibara University
            </Typography>
          </Box>

          <Divider className="divider" />

          {/* Error Alert */}
          {error && (
            <Alert severity="error" className="error-alert" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@clms.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              margin="normal"
              required
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              margin="normal"
              required
              disabled={loading}
            />

            <Box className="form-options">
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Remember me"
              />
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              className="login-button"
              startIcon={!loading && <LoginIcon />}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          {/* Register Link */}
          <Box className="register-link">
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link to="/register" className="register-link-text">
                Create Account
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={successOpen}
        autoHideDuration={2000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Login successful! Redirecting...
        </Alert>
      </Snackbar>
    </div>
  );
};

export default LoginPage;