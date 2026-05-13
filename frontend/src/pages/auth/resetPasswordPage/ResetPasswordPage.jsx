import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useNotification } from '../../../hooks';
import { authService } from '../../../services';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { addToast } = useNotification();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Verify token
    setTimeout(() => {
      setVerifying(false);
      // In real app, verify token with backend
      setTokenValid(true);
    }, 1000);
  }, [token]);

  const validateForm = () => {
    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return false;
    }
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    const result = await authService.resetPassword(token, password);
    
    if (result.success) {
      setSubmitted(true);
      addToast(result.message, 'success');
      setTimeout(() => navigate('/login'), 3000);
    } else {
      addToast(result.message || 'Failed to reset password', 'error');
    }
    
    setLoading(false);
  };

  const getPasswordStrength = () => {
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

  if (verifying) {
    return (
      <div className="reset-container">
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
      <div className="reset-container">
        <div className="reset-card">
          <div className="error-icon">❌</div>
          <h2>Invalid Reset Link</h2>
          <p>This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="resend-link">Request New Reset Link</Link>
          <Link to="/login" className="back-link">Back to Login</Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="reset-container">
        <div className="reset-card">
          <div className="success-icon">✅</div>
          <h2>Password Reset Successful!</h2>
          <p>Your password has been changed successfully.</p>
          <p>Redirecting to login page...</p>
          <Link to="/login" className="login-link">Go to Login</Link>
        </div>
      </div>
    );
  }

  const passwordStrength = getPasswordStrength();

  return (
    <div className="reset-container">
      <div className="reset-card">
        <div className="reset-header">
          <div className="logo">🔐</div>
          <h1>Reset Password</h1>
          <p>Create a new password for your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {password && (
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
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>

          <div className="password-requirements">
            <p>Password must contain:</p>
            <ul>
              <li className={password.length >= 6 ? 'valid' : ''}>✓ At least 6 characters</li>
              <li className={/[A-Z]/.test(password) ? 'valid' : ''}>✓ At least one uppercase letter</li>
              <li className={/[a-z]/.test(password) ? 'valid' : ''}>✓ At least one lowercase letter</li>
              <li className={/[0-9]/.test(password) ? 'valid' : ''}>✓ At least one number</li>
            </ul>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="login-link">
          <Link to="/login">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;