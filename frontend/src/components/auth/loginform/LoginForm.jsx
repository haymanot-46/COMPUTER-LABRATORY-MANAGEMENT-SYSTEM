import React, { useState } from 'react';
import './LoginForm.css';

const LoginForm = ({ onSubmit, loading: externalLoading, error: externalError }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [internalError, setInternalError] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);

  const loading = externalLoading !== undefined ? externalLoading : internalLoading;
  const error = externalError || internalError;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setInternalError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    if (!formData.email) {
      setInternalError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setInternalError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setInternalError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setInternalLoading(true);
    setInternalError('');
    
    const result = await onSubmit(formData);
    
    if (result && !result.success) {
      setInternalError(result.message);
    }
    
    setInternalLoading(false);
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <div className="auth-logo">🖥️</div>
        <h2>Welcome Back</h2>
        <p>Sign in to access your dashboard</p>
      </div>

      {error && (
        <div className="auth-error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <span className="input-icon">📧</span>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <span className="input-icon">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
            <button 
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={loading}
            />
            <span className="checkmark"></span>
            <span>Remember me</span>
          </label>
          <a href="/forgot-password" className="forgot-link">Forgot Password?</a>
        </div>

        <button 
          type="submit" 
          className="auth-submit-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-small"></span>
              Signing in...
            </>
          ) : (
            <>
              <span className="btn-icon">🔑</span>
              Sign In
            </>
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>Don't have an account? <a href="/register">Create Account</a></p>
      </div>

      <div className="demo-credentials">
        <p>📋 Demo Credentials:</p>
        <div className="demo-grid">
          <div className="demo-item">
            <span className="demo-role">👑 Admin:</span>
            <code>admin@clms.com / admin123</code>
          </div>
          <div className="demo-item">
            <span className="demo-role">👨‍🏫 Teacher:</span>
            <code>teacher@clms.com / teacher123</code>
          </div>
          <div className="demo-item">
            <span className="demo-role">👨‍🎓 Student:</span>
            <code>student@clms.com / student123</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;