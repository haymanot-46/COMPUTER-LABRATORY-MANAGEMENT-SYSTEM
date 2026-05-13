import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useNotification } from '../../../hooks';
import { authService } from '../../../services';
import './VerifyEmailPage.css';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { addToast } = useNotification();
  
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setVerifying(false);
    }
  }, [token]);

  const verifyEmail = async () => {
    setVerifying(true);
    const result = await authService.verifyEmail(token);
    
    if (result.success) {
      setSuccess(true);
      addToast(result.message, 'success');
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(result.message || 'Verification failed');
    }
    
    setVerifying(false);
  };

  const handleResendVerification = async () => {
    if (!email) {
      addToast('Please enter your email address', 'error');
      return;
    }
    
    setResendDisabled(true);
    setCountdown(60);
    
    const result = await authService.resendVerification(email);
    
    if (result.success) {
      addToast(result.message, 'success');
    } else {
      addToast(result.message || 'Failed to resend verification', 'error');
    }
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (verifying && token) {
    return (
      <div className="verify-container">
        <div className="verify-card">
          <div className="loading-spinner"></div>
          <h2>Verifying Your Email</h2>
          <p>Please wait while we verify your email address...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="verify-container">
        <div className="verify-card">
          <div className="success-icon">✅</div>
          <h2>Email Verified!</h2>
          <p>Your email has been successfully verified.</p>
          <p>Redirecting to login page...</p>
          <Link to="/login" className="login-link">Go to Login</Link>
        </div>
      </div>
    );
  }

  if (error && token) {
    return (
      <div className="verify-container">
        <div className="verify-card">
          <div className="error-icon">❌</div>
          <h2>Verification Failed</h2>
          <p>{error}</p>
          <Link to="/login" className="login-link">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-container">
      <div className="verify-card">
        <div className="email-icon">📧</div>
        <h1>Verify Your Email Address</h1>
        <p>
          We've sent a verification link to your email address.
          Please check your inbox and click the verification link to activate your account.
        </p>

        <div className="resend-section">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button 
            onClick={handleResendVerification} 
            disabled={resendDisabled}
          >
            {resendDisabled ? `Resend in ${countdown}s` : 'Resend Verification Email'}
          </button>
        </div>

        <div className="help-text">
          <p>Didn't receive the email?</p>
          <ul>
            <li>Check your spam/junk folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>Contact support if you continue having issues</li>
          </ul>
        </div>

        <div className="login-link">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;