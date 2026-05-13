// frontend/src/pages/NotFound/NotFoundPage.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [countdown, setCountdown] = useState(10);
  const [redirectPath, setRedirectPath] = useState('/login');
  const timerRef = useRef(null);
  const hasRedirected = useRef(false);

  const currentPath = location.pathname;

  // Set redirect path based on auth status
  useEffect(() => {
    if (!isAuthenticated) {
      setRedirectPath('/login');
    } else {
      const role = user?.role;
      const paths = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
        lab_manager: '/lab-manager/dashboard',
        dean: '/dean/dashboard',
        ict: '/ict/dashboard',
        asset: '/asset/dashboard',
        lab_assistant: '/lab-assistant/dashboard'
      };
      setRedirectPath(paths[role] || '/dashboard');
    }
  }, [isAuthenticated, user]);

  // Auto redirect timer
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1 && !hasRedirected.current) {
          // Clear timer immediately
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          hasRedirected.current = true;
          // Use navigate directly without setTimeout
          navigate(redirectPath);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [navigate, redirectPath]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleGoBack = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    navigate(-1);
  }, [navigate]);

  const handleGoHome = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    navigate(redirectPath);
  }, [navigate, redirectPath]);

  const suggestedLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', description: 'Go to your dashboard' },
    { path: '/computers', label: 'Computers', icon: '🖥️', description: 'View all computers' },
    { path: '/schedules', label: 'Schedules', icon: '📅', description: 'Check lab schedules' },
    { path: '/attendance', label: 'Attendance', icon: '📋', description: 'View attendance records' },
    { path: '/maintenance', label: 'Maintenance', icon: '🔧', description: 'Submit maintenance requests' },
    { path: '/reports', label: 'Reports', icon: '📊', description: 'Generate reports' }
  ];

  return (
    <div className="notfound-container">
      {/* Animated Background */}
      <div className="notfound-background">
        <div className="bg-gradient"></div>
        <div className="bg-particles">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i} 
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating Computers Animation */}
      <div className="floating-computers">
        <div className="floating-computer computer-1">🖥️</div>
        <div className="floating-computer computer-2">💻</div>
        <div className="floating-computer computer-3">🖥️</div>
        <div className="floating-computer computer-4">💻</div>
      </div>

      <div className="notfound-content">
        {/* 404 Number with Animation */}
        <div className="error-code">
          <div className="error-digit digit-4">4</div>
          <div className="error-digit digit-0">
            <span className="zero-icon">0</span>
            <span className="zero-face">😕</span>
          </div>
          <div className="error-digit digit-4">4</div>
        </div>

        {/* Error Message */}
        <div className="error-message">
          <h1>Page Not Found</h1>
          <div className="error-description">
            <p>Oops! The page you're looking for doesn't exist.</p>
            <p className="path-info">
              <span className="path-label">Requested path:</span>
              <code className="current-path">{currentPath}</code>
            </p>
          </div>
        </div>

        {/* Computer Status Humor */}
        <div className="computer-humor">
          <div className="humor-card">
            <span className="humor-icon">🖥️</span>
            <p>Error 404: The requested resource could not be found on this server.</p>
            <small>Even our computers couldn't find it! 🔍</small>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={handleGoBack} className="action-btn back-btn">
            <span className="btn-icon">←</span>
            Go Back
          </button>
          <button onClick={handleGoHome} className="action-btn home-btn">
            <span className="btn-icon">🏠</span>
            Go to Dashboard
          </button>
          <Link to="/" className="action-btn home-link" onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current);
          }}>
            <span className="btn-icon">🏢</span>
            Homepage
          </Link>
        </div>

        {/* Auto Redirect Timer */}
        <div className="redirect-timer">
          <div className="timer-circle">
            <svg className="timer-svg" viewBox="0 0 100 100">
              <circle
                className="timer-bg"
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                className="timer-progress"
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="8"
                strokeDasharray={`${(countdown / 10) * 283} 283`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span className="timer-text">{countdown}</span>
          </div>
          <p>Redirecting to dashboard in {countdown} seconds...</p>
        </div>

        {/* Suggested Links */}
        <div className="suggested-links">
          <h3>You might be looking for:</h3>
          <div className="links-grid">
            {suggestedLinks.map((link, index) => (
              <Link 
                key={index} 
                to={link.path}
                className="suggested-link"
                style={{
                  animationDelay: `${index * 0.05}s`
                }}
                onClick={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                }}
              >
                <span className="link-icon">{link.icon}</span>
                <div className="link-info">
                  <span className="link-label">{link.label}</span>
                  <span className="link-desc">{link.description}</span>
                </div>
                <span className="link-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="help-section">
          <div className="help-card">
            <span className="help-icon">💡</span>
            <div className="help-content">
              <h4>Need help finding something?</h4>
              <p>Contact support at <a href="mailto:support@clms.com">support@clms.com</a></p>
            </div>
          </div>
          <div className="help-card">
            <span className="help-icon">📚</span>
            <div className="help-content">
              <h4>Check our documentation</h4>
              <p>Visit our user guide for assistance with CLMS features</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="notfound-footer">
          <p>Injibara University - Computer Laboratory Management System</p>
          <p className="footer-time">{new Date().getFullYear()} © All rights reserved</p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;