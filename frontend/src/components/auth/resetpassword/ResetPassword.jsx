import React, { useState, useEffect } from 'react';
import './ResetPassword.css';

const ResetPassword = ({ token, onSubmit, loading: externalLoading, error: externalError }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [internalError, setInternalError] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [tokenValid, setTokenValid] = useState(true);
  const [verifying, setVerifying] = useState(true);

  const loading = externalLoading !== undefined ? externalLoading : internalLoading;
  const error = externalError || internalError;

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setVerifying(false);
        setInternalError('Invalid or missing reset token');
        return;
      }
      
      // Replace with actual API call
      try {
        // const response = await fetch(`/api/auth/verify-reset-token/${token}`);
        // if (!response.ok) throw new Error('Invalid token');
        
        // Simulate API call - Remove in production
        setTimeout(() => {
          setVerifying(false);
          setTokenValid(true);
        }, 1000);
      } catch (err) {
        setTokenValid(false);
        setVerifying(false);
        setInternalError('This reset link is invalid or has expired');
      }
    };
    
    verifyToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setInternalError('');
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setInternalError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setInternalError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setInternalLoading(true);
    setInternalError('');
    setSuccess('');

    const result = await onSubmit(token, formData.password);

    if (result && result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } else if (result && !result.success) {
      setInternalError(result.message);
    }

    setInternalLoading(false);
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

  if (verifying) {
    return (
      <div className="reset-password-container">
        <div className="reset-card">
          <div className="loading-spinner"></div>
          <h2>Verifying Reset Link</h2>
          <p>Please wait while we verify your password reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="reset-password-container">
        <div className="reset-card">
          <div className="error-icon">❌</div>
          <h2>Invalid Reset Link</h2>
          <p>{error || 'This password reset link is invalid or has expired.'}</p>
          <a href="/forgot-password" className="resend-link">Request New Reset Link</a>
          <a href="/login" className="back-link">Back to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-card">
        <div className="reset-header">
          <div className="reset-logo">🔐</div>
          <h2>Reset Password</h2>
          <p>Create a new password for your account</p>
        </div>

        {success && (
          <div className="reset-success-message">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}

        {error && (
          <div className="reset-error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="form-group">
            <label>New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formData.password && !loading && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div className="strength-fill" style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}></div>
                </div>
                <span className="strength-text" style={{ color: passwordStrength.color }}>
                  Strength: {passwordStrength.text}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && !loading && (
              <small className="error-hint">Passwords do not match</small>
            )}
          </div>

          <div className="password-requirements">
            <p>Password must contain:</p>
            <ul>
              <li className={formData.password.length >= 6 ? 'valid' : ''}>
                ✓ At least 6 characters
              </li>
              <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                ✓ At least one uppercase letter
              </li>
              <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>
                ✓ At least one lowercase letter
              </li>
              <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>
                ✓ At least one number
              </li>
            </ul>
          </div>

          <button type="submit" className="reset-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="reset-footer">
          <a href="/login">← Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;