import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Divider
} from '@mui/material';
import {
  AccountCircle,
  Lock,
  Visibility,
  VisibilityOff,
  Computer
} from '@mui/icons-material';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Demo login - In production, this will call your backend API
    setTimeout(() => {
      setLoading(false);
      
      // Demo credentials check
      if (formData.email === 'admin@clms.com' && formData.password === 'admin123') {
        localStorage.setItem('token', 'demo-token-admin');
        localStorage.setItem('userRole', 'admin');
        navigate('/admin/dashboard');
      } 
      else if (formData.email === 'manager@clms.com' && formData.password === 'manager123') {
        localStorage.setItem('token', 'demo-token-manager');
        localStorage.setItem('userRole', 'lab-manager');
        navigate('/lab-manager/dashboard');
      }
      else if (formData.email === 'teacher@clms.com' && formData.password === 'teacher123') {
        localStorage.setItem('token', 'demo-token-teacher');
        localStorage.setItem('userRole', 'teacher');
        navigate('/teacher/dashboard');
      }
      else if (formData.email === 'dean@clms.com' && formData.password === 'dean123') {
        localStorage.setItem('token', 'demo-token-dean');
        localStorage.setItem('userRole', 'dean');
        navigate('/dean/dashboard');
      }
      else if (formData.email === 'student@clms.com' && formData.password === 'student123') {
        localStorage.setItem('token', 'demo-token-student');
        localStorage.setItem('userRole', 'student');
        navigate('/student/dashboard');
      }
      else if (formData.email === 'assistant@clms.com' && formData.password === 'assistant123') {
        localStorage.setItem('token', 'demo-token-assistant');
        localStorage.setItem('userRole', 'lab-assistant');
        navigate('/lab-assistant/dashboard');
      }
      else if (formData.email === 'ict@clms.com' && formData.password === 'ict123') {
        localStorage.setItem('token', 'demo-token-ict');
        localStorage.setItem('userRole', 'ict');
        navigate('/ict/dashboard');
      }
      else if (formData.email === 'asset@clms.com' && formData.password === 'asset123') {
        localStorage.setItem('token', 'demo-token-asset');
        localStorage.setItem('userRole', 'asset');
        navigate('/asset/dashboard');
      }
      else {
        setError('Invalid email or password. Please try again.');
      }
    }, 1000);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 3 }}>
          {/* Logo and Title */}
          <Box textAlign="center" mb={3}>
            <Computer sx={{ fontSize: 60, color: '#667eea' }} />
            <Typography variant="h4" fontWeight="bold" color="primary" mt={1}>
              CLMS
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Computer Laboratory Management System
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Injibara University
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h5" textAlign="center" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" textAlign="center" color="textSecondary" mb={3}>
            Sign in to access your dashboard
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle color="primary" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1} mb={2}>
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
              <Button color="primary" size="small">
                Forgot Password?
              </Button>
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ py: 1.5, mb: 2 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Typography variant="body2" textAlign="center" color="textSecondary">
              Demo Credentials:
            </Typography>
            <Box sx={{ mt: 1, fontSize: '0.75rem', textAlign: 'center' }}>
              <Typography variant="caption" display="block">
                Admin: admin@clms.com / admin123
              </Typography>
              <Typography variant="caption" display="block">
                Teacher: teacher@clms.com / teacher123
              </Typography>
              <Typography variant="caption" display="block">
                Student: student@clms.com / student123
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;