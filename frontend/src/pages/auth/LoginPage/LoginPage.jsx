import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Demo login - Replace with real API call
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
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">🖥️</div>
          <h1>CLMS</h1>
          <p>Computer Laboratory Management System</p>
          <p className="university">Injibara University</p>
        </div>

        <div className="divider"></div>

        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to access your dashboard</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="form-input"
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className="forgot-link">Forgot Password?</a>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials">
          <p>Demo Credentials:</p>
          <div className="credentials-grid">
            <div><strong>Admin:</strong> admin@clms.com / admin123</div>
            <div><strong>Teacher:</strong> teacher@clms.com / teacher123</div>
            <div><strong>Student:</strong> student@clms.com / student123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;