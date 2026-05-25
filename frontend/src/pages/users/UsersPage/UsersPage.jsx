import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../../services/ApiService';
import { userService } from '../../../services';
import { useAuth, useNotification } from '../../../hooks';
import './UsersPage.css';

const UsersPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { addToast } = useNotification();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'student',
    department: '',
    phone: '',
    studentId: ''
  });

  useEffect(() => {
    console.log('📄 UsersPage mounted');
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      
      if (!token) {
        console.warn('No token found, redirecting to login');
        navigate('/login');
        return;
      }
      
      const response = await userApi.getAll();
      console.log('📥 Users response:', response);
      
      if (response && response.success) {
        const usersData = Array.isArray(response.data) ? response.data : [];
        console.log('✅ Users loaded:', usersData.length);
        setUsers(usersData);
      } else {
        console.warn('Unexpected response format:', response);
        setUsers([]);
        setError(response?.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('❌ Error loading users:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load users');
      addToast('Failed to load users', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await userApi.getRoles();
      console.log('📥 Roles response:', response);
      
      if (response && response.success && Array.isArray(response.data)) {
        setRoles(response.data);
      } else {
        // Fallback roles
        setRoles([
          { value: 'admin', label: 'Admin', icon: '👑' },
          { value: 'teacher', label: 'Teacher', icon: '👨‍🏫' },
          { value: 'student', label: 'Student', icon: '👨‍🎓' },
          { value: 'lab_manager', label: 'Lab Manager', icon: '🔬' },
          { value: 'dean', label: 'Dean', icon: '📚' },
          { value: 'lab_assistant', label: 'Lab Assistant', icon: '🛠️' },
          { value: 'ict', label: 'ICT', icon: '💻' },
          { value: 'asset', label: 'Asset Manager', icon: '📦' }
        ]);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      setRoles([
        { value: 'admin', label: 'Admin', icon: '👑' },
        { value: 'teacher', label: 'Teacher', icon: '👨‍🏫' },
        { value: 'student', label: 'Student', icon: '👨‍🎓' },
        { value: 'lab_manager', label: 'Lab Manager', icon: '🔬' },
        { value: 'dean', label: 'Dean', icon: '📚' },
        { value: 'lab_assistant', label: 'Lab Assistant', icon: '🛠️' },
        { value: 'ict', label: 'ICT', icon: '💻' },
        { value: 'asset', label: 'Asset Manager', icon: '📦' }
      ]);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    console.log('🔵 Form Data being sent:', formData);
    
    if (!formData.name) {
      addToast('Name is required', 'error');
      return;
    }
    if (!formData.email) {
      addToast('Email is required', 'error');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    
    try {
      const userData = {
        email: formData.email.trim(),
        name: formData.name.trim(),
        password: formData.password,
        role: formData.role,
        department: formData.department || null,
        phone: formData.phone || null,
        studentId: formData.studentId || null
      };
      
      console.log('📤 Sending to API:', userData);
      
      const response = await userApi.create(userData);
      
      console.log('📥 API Response:', response);
      
      if (response && response.success) {
        addToast('User created successfully!', 'success');
        setShowAddModal(false);
        setFormData({ 
          email: '', 
          name: '', 
          password: '', 
          role: 'student', 
          department: '',
          phone: '',
          studentId: ''
        });
        loadUsers();
      } else {
        addToast(response?.message || 'Failed to create user', 'error');
      }
    } catch (error) {
      console.error('❌ Error creating user:', error);
      addToast(error.response?.data?.message || 'Failed to create user', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName, userRole) => {
    if (userRole === 'admin') {
      addToast('Cannot delete admin users', 'error');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        const response = await userApi.delete(userId);
        if (response && response.success) {
          addToast('User deleted successfully!', 'success');
          loadUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        addToast('Failed to delete user', 'error');
      }
    }
  };

  const openPhotoUpload = (user) => {
    setSelectedUser(user);
    setShowPhotoModal(true);
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedUser) return;
    
    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size must be less than 5MB', 'error');
      return;
    }
    
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const data = await userService.uploadProfileImage(selectedUser.id, { imageData: reader.result });
        if (data.success) {
          addToast(`Profile photo updated for ${selectedUser.name}`, 'success');
          setShowPhotoModal(false);
          loadUsers();
        } else {
          addToast('Failed to update photo', 'error');
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
        addToast('Failed to upload photo', 'error');
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: '👑',
      teacher: '👨‍🏫',
      student: '👨‍🎓',
      lab_manager: '🔬',
      dean: '📚',
      lab_assistant: '🛠️',
      ict: '💻',
      asset: '📦'
    };
    return icons[role] || '👤';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Admin',
      teacher: 'Teacher',
      student: 'Student',
      lab_manager: 'Lab Manager',
      dean: 'Dean',
      lab_assistant: 'Lab Assistant',
      ict: 'ICT',
      asset: 'Asset Manager'
    };
    return labels[role] || role;
  };

  const getAvatarDisplay = (user) => {
    if (user.profile_image) {
      return (
        <img 
          src={user.profile_image} 
          alt={user.name}
          className="user-avatar-img"
          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
        />
      );
    }
    return (
      <div className="user-avatar-placeholder" style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '50%', 
        background: `linear-gradient(135deg, #667eea, #764ba2)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px'
      }}>
        {user.name?.charAt(0).toUpperCase() || '?'}
      </div>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (error) {
    return (
      <div className="users-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Users</h3>
        <p>{error}</p>
        <button className="retry-btn" onClick={loadUsers}>Retry</button>
        <button className="back-btn" onClick={() => navigate('/dashboard/admin')}>Back to Dashboard</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="users-loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard/admin')}>← Back</button>
          <h1>👥 User Management</h1>
          <p>Manage all users in the Computer Laboratory Management System</p>
        </div>
        <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
          + Add New User
        </button>
      </div>

      <div className="users-filters">
        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          {roles.map(role => (
            <option key={role.value} value={role.value}>
              {getRoleIcon(role.value)} {role.label}
            </option>
          ))}
        </select>
      </div>

      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
          <div className="stat-label">Admins</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'teacher').length}</div>
          <div className="stat-label">Teachers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'student').length}</div>
          <div className="stat-label">Students</div>
        </div>
      </div>

      <div className="users-table-container">
        {filteredUsers.length === 0 ? (
          <div className="no-data">
            <div className="no-data-icon">👥</div>
            <h3>No Users Found</h3>
            <p>No users match your search criteria.</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="user-photo-cell">
                    {getAvatarDisplay(user)}
                  </td>
                  <td>{user.id}</td>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {getRoleIcon(user.role)} {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>{user.department || '-'}</td>
                  <td className="action-buttons-cell">
                    <button 
                      className="upload-photo-btn"
                      onClick={() => openPhotoUpload(user)}
                      title="Upload profile photo"
                    >
                      📷
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDeleteUser(user.id, user.name, user.role)}
                      disabled={user.role === 'admin'}
                      title={user.role === 'admin' ? 'Cannot delete admin users' : 'Delete user'}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="user@clms.com"
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {getRoleIcon(role.value)} {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="e.g., 0912345678"
                />
              </div>
              {formData.role === 'student' && (
                <div className="form-group">
                  <label>Student ID</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    placeholder="e.g., CNS/1234/12"
                  />
                </div>
              )}
              <div className="modal-buttons">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowPhotoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Profile Photo for {selectedUser.name}</h2>
              <button className="close-btn" onClick={() => setShowPhotoModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="photo-preview">
                {getAvatarDisplay(selectedUser)}
                <p className="photo-preview-label">Current Photo</p>
              </div>
              <div className="photo-upload-area">
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  style={{ display: 'none' }}
                />
                <label htmlFor="photo-upload" className="photo-upload-label">
                  {uploadingPhoto ? 'Uploading...' : '📁 Choose New Photo'}
                </label>
                <p className="photo-upload-hint">JPG, PNG, or GIF. Max 5MB.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowPhotoModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;