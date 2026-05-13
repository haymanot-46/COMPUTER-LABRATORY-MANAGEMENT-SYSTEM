import React, { useState } from 'react';
import './UserProfile.css';

const UserProfile = ({ user, onEdit, onChangePassword, onClose }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [passwordError, setPasswordError] = useState('');

  const getRoleIcon = (role) => {
    const icons = { 
      admin: '👑', teacher: '👨‍🏫', student: '👨‍🎓', 
      'lab-manager': '🔬', dean: '📚', 'lab-assistant': '🛠️', 
      ict: '🔧', asset: '📦' 
    };
    return icons[role] || '👤';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    onChangePassword(passwordData);
    setShowPasswordForm(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Get avatar display (image or initials/icon)
  const getAvatarContent = () => {
    if (user.profile_image) {
      return (
        <img 
          src={user.profile_image} 
          alt={user.name || 'User'} 
          className="profile-avatar-img"
        />
      );
    }
    return (
      <div className="profile-avatar-initials">
        {getInitials(user.name)}
      </div>
    );
  };

  return (
    <div className="user-profile-modal">
      <div className="profile-overlay" onClick={onClose}></div>
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar">
            {getAvatarContent()}
          </div>
          <h2>{user.name}</h2>
          <p className="profile-role">{user.role}</p>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="profile-body">
          <div className="info-section">
            <h3>📋 Personal Information</h3>
            <div className="info-grid">
              <div><label>Full Name:</label><span>{user.name}</span></div>
              <div><label>Email:</label><span>{user.email}</span></div>
              <div><label>Phone:</label><span>{user.phone || 'Not provided'}</span></div>
              <div><label>Department:</label><span>{user.department || 'Not assigned'}</span></div>
              {user.studentId && <div><label>Student ID:</label><span>{user.studentId}</span></div>}
              {user.employeeId && <div><label>Employee ID:</label><span>{user.employeeId}</span></div>}
            </div>
          </div>

          <div className="info-section">
            <h3>📊 Account Information</h3>
            <div className="info-grid">
              <div><label>Role:</label><span className="role-badge">{user.role}</span></div>
              <div><label>Status:</label>
                <span className={`status-badge status-${user.status}`}>{user.status}</span>
              </div>
              <div><label>Joined:</label><span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span></div>
              <div><label>Last Login:</label><span>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</span></div>
            </div>
          </div>

          {showPasswordForm ? (
            <div className="password-section">
              <h3>🔐 Change Password</h3>
              <div className="password-form">
                <input 
                  type="password" 
                  placeholder="Current Password" 
                  value={passwordData.currentPassword} 
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} 
                />
                <input 
                  type="password" 
                  placeholder="New Password" 
                  value={passwordData.newPassword} 
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                />
                <input 
                  type="password" 
                  placeholder="Confirm New Password" 
                  value={passwordData.confirmPassword} 
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
                />
                {passwordError && <div className="error-message">{passwordError}</div>}
                <div className="password-actions">
                  <button className="cancel-btn" onClick={() => setShowPasswordForm(false)}>Cancel</button>
                  <button className="save-btn" onClick={handlePasswordChange}>Change Password</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-actions">
              <button className="action-btn edit" onClick={() => onEdit(user)}>✏️ Edit Profile</button>
              <button className="action-btn password" onClick={() => setShowPasswordForm(true)}>🔐 Change Password</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;