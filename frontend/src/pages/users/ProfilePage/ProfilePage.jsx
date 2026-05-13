import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { userService, authService } from '../../../services';
import profileImageService from '../../../services/ProfileImageService';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser, updateUser: updateAuthUser } = useAuth();
  const { isAdmin } = useRole();
  const { addToast } = useNotification();
  const fileInputRef = useRef(null);
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const userId = id || currentUser?.id;
  const isOwnProfile = !id || id === currentUser?.id;
  const canEdit = isOwnProfile || isAdmin();

  useEffect(() => {
    loadProfile();
    loadProfileImage();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const result = await userService.getUserById(userId);
      if (result.success) {
        setProfileUser(result.data);
        setFormData(result.data);
      } else {
        addToast(result.message || 'Failed to load profile', 'error');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      addToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadProfileImage = () => {
    // Check if user has profile image from login
    if (currentUser?.profile_image) {
      setProfileImagePreview(currentUser.profile_image);
      setProfileImage(currentUser.profile_image);
    } else {
      // Try to load from localStorage
      const savedImage = localStorage.getItem('profileImage');
      if (savedImage) {
        setProfileImagePreview(savedImage);
        setProfileImage(savedImage);
      }
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size must be less than 5MB', 'error');
      return;
    }
    
    setUploadingPhoto(true);
    
    // Compress image before upload
    compressImage(file, async (compressedDataUrl) => {
      try {
        const result = await profileImageService.uploadProfileImage(compressedDataUrl);
        if (result.success) {
          setProfileImagePreview(compressedDataUrl);
          setProfileImage(compressedDataUrl);
          localStorage.setItem('profileImage', compressedDataUrl);
          
          // Update user context
          if (updateAuthUser && isOwnProfile) {
            updateAuthUser({ ...currentUser, profile_image: compressedDataUrl });
          }
          
          addToast('Profile photo updated successfully!', 'success');
        } else {
          addToast(result.message || 'Failed to upload photo', 'error');
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
        addToast('Failed to upload photo', 'error');
      } finally {
        setUploadingPhoto(false);
      }
    });
  };

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 200x200
        let width = img.width;
        let height = img.height;
        const maxSize = 200;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to 0.7 quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        callback(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const removeProfileImage = async () => {
    try {
      const result = await profileImageService.removeProfileImage();
      if (result.success) {
        setProfileImagePreview(null);
        setProfileImage(null);
        localStorage.removeItem('profileImage');
        
        // Update user context
        if (updateAuthUser && isOwnProfile) {
          updateAuthUser({ ...currentUser, profile_image: null });
        }
        
        addToast('Profile photo removed', 'success');
      } else {
        addToast(result.message || 'Failed to remove photo', 'error');
      }
    } catch (error) {
      console.error('Error removing photo:', error);
      addToast('Failed to remove photo', 'error');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsChangingPassword(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setFormData(profileUser);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    setPasswordError('');
  };

  const handleSave = async () => {
    try {
      const result = await userService.updateUser(userId, formData);
      if (result.success) {
        addToast('Profile updated successfully', 'success');
        setProfileUser(result.data);
        setIsEditing(false);
        
        if (isOwnProfile && updateAuthUser) {
          updateAuthUser({ ...result.data, profile_image: profileImage });
        }
        
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.id === userId) {
          localStorage.setItem('user', JSON.stringify({ ...storedUser, ...result.data, profile_image: profileImage }));
        }
      } else {
        addToast(result.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast('Failed to update profile', 'error');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    try {
      const result = await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (result.success) {
        addToast('Password changed successfully', 'success');
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordError('');
      } else {
        addToast(result.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      addToast('Failed to change password', 'error');
    }
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: '👑', teacher: '👨‍🏫', student: '👨‍🎓',
      lab_manager: '🔬', dean: '📚', lab_assistant: '🛠️',
      ict: '🔧', asset: '📦'
    };
    return icons[role] || '👤';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrator', teacher: 'Teacher', student: 'Student',
      lab_manager: 'Lab Manager', dean: 'Dean', lab_assistant: 'Lab Assistant',
      ict: 'ICT Specialist', asset: 'Asset Manager'
    };
    return labels[role] || role;
  };

  const getStatusBadge = (status) => {
    const configs = {
      active: { class: 'status-active', text: 'Active' },
      inactive: { class: 'status-inactive', text: 'Inactive' },
      suspended: { class: 'status-suspended', text: 'Suspended' }
    };
    const config = configs[status] || configs.active;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  // Get avatar display (image or initials)
  const getAvatarDisplay = () => {
    if (profileImagePreview) {
      return (
        <img 
          src={profileImagePreview} 
          alt={profileUser?.name || 'User'} 
          className="avatar-img"
        />
      );
    }
    return getRoleIcon(profileUser?.role);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="profile-not-found">
        <div className="not-found-icon">👤</div>
        <h2>User Not Found</h2>
        <p>The user you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header-section">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="profile-title">
          <h1>{isOwnProfile ? 'My Profile' : `${profileUser.name}'s Profile`}</h1>
          <p>View and manage your account information</p>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-container">
        {/* Edit Mode */}
        {isEditing ? (
          <div className="profile-edit-form">
            <div className="form-card">
              <h3>✏️ Edit Profile Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name || ''} 
                    onChange={handleChange} 
                    placeholder="Enter full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email || ''} 
                    onChange={handleChange} 
                    disabled={!isAdmin()}
                    placeholder="email@example.com"
                  />
                  {!isAdmin() && <small className="disabled-hint">Email cannot be changed. Contact admin for email updates.</small>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone || ''} 
                    onChange={handleChange} 
                    placeholder="0912345678"
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input 
                    type="text" 
                    name="department" 
                    value={formData.department || ''} 
                    onChange={handleChange} 
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                <button className="save-btn" onClick={handleSave}>Save Changes</button>
              </div>
            </div>
          </div>
        ) : isChangingPassword ? (
          <div className="profile-change-password">
            <div className="form-card">
              <h3>🔐 Change Password</h3>
              
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  name="currentPassword" 
                  value={passwordData.currentPassword} 
                  onChange={handlePasswordChange} 
                  placeholder="Enter current password"
                />
              </div>
              
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={passwordData.newPassword} 
                  onChange={handlePasswordChange} 
                  placeholder="Minimum 6 characters"
                />
              </div>
              
              <div className="form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={passwordData.confirmPassword} 
                  onChange={handlePasswordChange} 
                  placeholder="Confirm new password"
                />
              </div>
              
              {passwordError && <div className="error-message">{passwordError}</div>}
              
              <div className="form-actions">
                <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                <button className="save-btn" onClick={handleChangePassword}>Change Password</button>
              </div>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="profile-view">
            {/* Profile Card with Photo Upload */}
            <div className="profile-card">
              <div className="profile-avatar-container">
                <div 
                  className="profile-avatar"
                  onClick={() => isOwnProfile && fileInputRef.current?.click()}
                  style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}
                >
                  {getAvatarDisplay()}
                  {isOwnProfile && (
                    <div className="avatar-overlay">
                      <span>📷</span>
                      <span>Change Photo</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                  disabled={uploadingPhoto}
                />
                {isOwnProfile && profileImagePreview && (
                  <button 
                    className="remove-photo-btn"
                    onClick={removeProfileImage}
                    disabled={uploadingPhoto}
                  >
                    Remove Photo
                  </button>
                )}
                {uploadingPhoto && <p className="uploading-text">Uploading...</p>}
                {isOwnProfile && (
                  <p className="photo-hint">Click on the photo to upload/change</p>
                )}
              </div>
              <div className="profile-info">
                <h2>{profileUser.name}</h2>
                <p className="profile-role">{getRoleLabel(profileUser.role)}</p>
                <div className="profile-status">
                  {getStatusBadge(profileUser.status)}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="info-card">
              <h3>📋 Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Full Name:</span>
                  <span className="info-value">{profileUser.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{profileUser.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{profileUser.phone || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Department:</span>
                  <span className="info-value">{profileUser.department || 'Not assigned'}</span>
                </div>
                {profileUser.studentId && (
                  <div className="info-item">
                    <span className="info-label">Student ID:</span>
                    <span className="info-value">{profileUser.studentId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="info-card">
              <h3>📊 Account Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Role:</span>
                  <span className="info-value role-badge">{getRoleLabel(profileUser.role)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className="info-value">{getStatusBadge(profileUser.status)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Member Since:</span>
                  <span className="info-value">
                    {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Login:</span>
                  <span className="info-value">
                    {profileUser.lastLogin ? new Date(profileUser.lastLogin).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="profile-actions">
              {canEdit && (
                <>
                  <button className="action-btn edit" onClick={handleEdit}>
                    ✏️ Edit Profile
                  </button>
                  {isOwnProfile && (
                    <button className="action-btn password" onClick={() => setIsChangingPassword(true)}>
                      🔐 Change Password
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;