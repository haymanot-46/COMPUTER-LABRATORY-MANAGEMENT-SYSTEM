import React, { useState } from 'react';
import './ForgotPassword.css';

const ForgotPassword = ({ onSubmit, loading: externalLoading, error: externalError }) => {
  const [email, setEmail] = useState('');
  const [internalError, setInternalError] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const loading = externalLoading !== undefined ? externalLoading : internalLoading;
  const error = externalError || internalError;

  const validateForm = () => {
    if (!email) {
      setInternalError('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setInternalError('Please enter a valid email address');
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

    const result = await onSubmit(email);

    if (result && result.success) {
      setSuccess(result.message);
      setEmail(''); // Clear email on success
    } else if (result && !result.success) {
      setInternalError(result.message);
    }

    setInternalLoading(false);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-header">
          <a href="/login" className="back-link">← Back to Login</a>
          <div className="forgot-logo">🔒</div>
          <h2>Forgot Password?</h2>
          <p>Enter your email to receive a reset link</p>
        </div>

        {success && (
          <div className="forgot-success-message">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}

        {error && (
          <div className="forgot-error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="forgot-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="forgot-footer">
          <p>Remember your password? <a href="/login">Sign In</a></p>
          <p>Don't have an account? <a href="/register">Create Account</a></p>
        </div>

        <div className="forgot-help">
          <p>💡 Tips:</p>
          <ul>
            <li>Check your spam/junk folder if you don't see the email</li>
            <li>Make sure you entered the correct email address</li>
            <li>Contact support if you continue having issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;