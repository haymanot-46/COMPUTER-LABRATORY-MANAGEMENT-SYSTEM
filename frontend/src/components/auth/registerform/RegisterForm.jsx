import React, { useState } from 'react';
import './RegisterForm.css';

const RegisterForm = ({ onSubmit, loading: externalLoading, error: externalError }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: '',
    year: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [internalError, setInternalError] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);

  const loading = externalLoading !== undefined ? externalLoading : internalLoading;
  const error = externalError || internalError;

  const departments = [
    'Computer Science',
    'Software Engineering',
    'Information Technology',
    'Information Systems',
    'Computer Engineering'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setInternalError('');
  };

  const validateForm = () => {
    if (!formData.name) {
      setInternalError('Full name is required');
      return false;
    }
    if (!formData.email) {
      setInternalError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setInternalError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setInternalError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setInternalError('Passwords do not match');
      return false;
    }
    if (!formData.acceptTerms) {
      setInternalError('Please accept the terms and conditions');
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

  return (
    <div className="register-form-container">
      <div className="register-form-header">
        <div className="register-logo">🖥️</div>
        <h2>Create Account</h2>
        <p>Join the Computer Laboratory Management System</p>
        <p className="university">Injibara University</p>
      </div>

      {error && (
        <div className="register-error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Student ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="e.g., CNS/1234/12"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., 0912345678"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Department</label>
            <select name="department" value={formData.department} onChange={handleChange} disabled={loading}>
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Year of Study</label>
            <select name="year" value={formData.year} onChange={handleChange} disabled={loading}>
              <option value="">Select Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Password *</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
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
            <label>Confirm Password *</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
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
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              disabled={loading}
            />
            <span className="checkmark"></span>
            <span>I accept the <a href="/terms" target="_blank">Terms and Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a></span>
          </label>
        </div>

        <button type="submit" className="register-submit-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-small"></span>
              Creating Account...
            </>
          ) : (
            <>
              <span className="btn-icon">📝</span>
              Create Account
            </>
          )}
        </button>
      </form>

      <div className="register-footer">
        <p>Already have an account? <a href="/login">Sign In</a></p>
      </div>

      <div className="register-info">
        <p>📝 After registration, you will receive a verification email to activate your account.</p>
      </div>
    </div>
  );
};

export default RegisterForm;