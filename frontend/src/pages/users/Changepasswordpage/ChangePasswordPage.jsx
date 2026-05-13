import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useNotification } from '../../../hooks';
import { authService } from '../../../services';
import './ChangePasswordPage.css';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotification();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const toggleShowPassword = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    const password = formData.newPassword;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    const result = await authService.changePassword(
      formData.currentPassword,
      formData.newPassword
    );
    
    if (result.success) {
      addToast('Password changed successfully', 'success');
      navigate('/profile');
    } else {
      addToast(result.message || 'Failed to change password', 'error');
    }
    
    setLoading(false);
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="change-password-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Change Password</h1>
        <p>Update your account password</p>
      </div>

      <div className="change-password-card">
        <div className="card-header">
          <div className="header-icon">🔐</div>
          <h2>Security Settings</h2>
          <p>Choose a strong password to protect your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword.current ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => toggleShowPassword('current')}
              >
                {showPassword.current ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.currentPassword && <span className="error">{errors.currentPassword}</span>}
          </div>

          <div className="form-group">
            <label>New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => toggleShowPassword('new')}
              >
                {showPassword.new ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.newPassword && <span className="error">{errors.newPassword}</span>}
            {formData.newPassword && (
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
                type={showPassword.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => toggleShowPassword('confirm')}
              >
                {showPassword.confirm ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>

          <div className="password-requirements">
            <p>Password requirements:</p>
            <ul>
              <li className={formData.newPassword.length >= 6 ? 'valid' : ''}>
                • Minimum 6 characters
              </li>
              <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                • At least one uppercase letter
              </li>
              <li className={/[a-z]/.test(formData.newPassword) ? 'valid' : ''}>
                • At least one lowercase letter
              </li>
              <li className={/[0-9]/.test(formData.newPassword) ? 'valid' : ''}>
                • At least one number
              </li>
            </ul>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>

        <div className="info-box">
          <p>💡 Tips for a strong password:</p>
          <ul>
            <li>Use a mix of uppercase and lowercase letters</li>
            <li>Include numbers and special characters</li>
            <li>Avoid using personal information</li>
            <li>Don't reuse passwords from other accounts</li>
            <li>Change your password regularly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;