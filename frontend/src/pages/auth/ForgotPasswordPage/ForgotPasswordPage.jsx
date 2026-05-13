import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../../../hooks';
import { authService } from '../../../services';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await authService.forgotPassword(email);
    
    if (result.success) {
      setSubmitted(true);
      addToast(result.message, 'success');
    } else {
      addToast(result.message || 'Failed to send reset link', 'error');
    }
    
    setLoading(false);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="header">
          <Link to="/login" className="back-link">← Back to Login</Link>
          <div className="logo">🔒</div>
          <h1>Forgot Password?</h1>
          <p>Enter your email to receive a reset link</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="success-message">
            <div className="success-icon"></div>
            <h3>Check Your Email</h3>
            <p>We've sent a password reset link to <strong>{email}</strong></p>
            <p>Please check your inbox and follow the instructions.</p>
            <Link to="/login" className="back-to-login">Back to Login</Link>
          </div>
        )}

        <div className="help-text">
          <p>Remember your password? <Link to="/login">Sign In</Link></p>
          <p>Don't have an account? <Link to="/register">Create Account</Link></p>
        </div>

        <div className="info-box">
          <p> Tips:</p>
          <ul>
            <li>Check your spam/junk folder if you don't see the email</li>
            <li>Make sure you entered the correct email address</li>
            <li>The reset link expires after 1 hour</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;