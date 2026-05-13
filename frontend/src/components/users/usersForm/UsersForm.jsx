import React, { useState, useEffect, useRef } from 'react';
import RoleSelector from '../RoleSelactor/RoleSelector'; // Fixed import path
import './UsersForm.css';

const UserForm = ({ user, roles, onSubmit, onCancel }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: '',
    studentId: '',
    employeeId: '',
    phone: '',
    status: 'active',
    profile_image: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const departments = ['Computer Science', 'Software Engineering', 'Information Technology', 'Information Systems', 'Computer Engineering'];

  useEffect(() => {
    if (user) {
      setFormData({ 
        ...user, 
        password: '', 
        confirmPassword: '',
        profile_image: user.profile_image || null
      });
      if (user.profile_image) {
        setProfileImagePreview(user.profile_image);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
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

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }
    
    setUploadingPhoto(true);
    compressImage(file, (compressedDataUrl) => {
      setProfileImagePreview(compressedDataUrl);
      setFormData({ ...formData, profile_image: compressedDataUrl });
      setUploadingPhoto(false);
    });
  };

  const removeProfileImage = () => {
    setProfileImagePreview(null);
    setFormData({ ...formData, profile_image: null });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
    if (!user && !formData.password) newErrors.password = 'Password is required';
    if (!user && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!user && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    const submitData = { ...formData };
    if (!user) delete submitData.confirmPassword;
    await onSubmit(submitData);
    setLoading(false);
  };

  const getAvatarDisplay = () => {
    if (profileImagePreview) {
      return (
        <img 
          src={profileImagePreview} 
          alt="Profile Preview" 
          className="avatar-preview-img"
        />
      );
    }
    return (
      <div className="avatar-placeholder">
        {formData.name ? formData.name.charAt(0).toUpperCase() : '📷'}
      </div>
    );
  };

  return (
    <div className="user-form-modal">
      <div className="form-modal-overlay" onClick={onCancel}></div>
      <div className="form-modal-content">
        <div className="form-modal-header">
          <h2>{user ? 'Edit User' : 'Add New User'}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-sections">
            {/* Profile Photo Section */}
            <div className="form-section">
              <h3>📷 Profile Photo</h3>
              <div className="profile-photo-section">
                <div 
                  className="profile-avatar-upload"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: 'pointer' }}
                >
                  {getAvatarDisplay()}
                  <div className="avatar-overlay">
                    <span>📷</span>
                    <span>Change Photo</span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                  disabled={uploadingPhoto}
                />
                {profileImagePreview && (
                  <button 
                    type="button"
                    className="remove-photo-btn"
                    onClick={removeProfileImage}
                    disabled={uploadingPhoto}
                  >
                    Remove Photo
                  </button>
                )}
                {uploadingPhoto && <p className="uploading-text">Processing...</p>}
                <p className="photo-hint">Click to upload profile photo (JPG, PNG, max 5MB)</p>
              </div>
            </div>

            <div className="form-section">
              <h3>👤 Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full name" />
                  {errors.name && <span className="error">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="0912345678" />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select name="department" value={formData.department} onChange={handleChange}>
                    <option value="">Select Department</option>
                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>🔐 Account Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Role *</label>
                  <RoleSelector selectedRole={formData.role} onRoleChange={(role) => setFormData({ ...formData, role })} />
                  {errors.role && <span className="error">{errors.role}</span>}
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {(formData.role === 'student') && (
                <div className="form-group">
                  <label>Student ID</label>
                  <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} placeholder="e.g., CNS/1234/12" />
                </div>
              )}

              {(formData.role === 'teacher' || formData.role === 'lab-assistant') && (
                <div className="form-group">
                  <label>Employee ID</label>
                  <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="e.g., TCH-001" />
                </div>
              )}

              {!user && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Password *</label>
                      <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" />
                      {errors.password && <span className="error">{errors.password}</span>}
                    </div>
                    <div className="form-group">
                      <label>Confirm Password *</label>
                      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" />
                      {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="form-modal-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;