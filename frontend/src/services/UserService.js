import api from './ApiService';

class UserService {
  // Get all users
  async getUsers(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/users${params ? `?${params}` : ''}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch users',
        data: []
      };
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'User not found' 
      };
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      const response = await api.post('/users', userData);
      return { success: true, data: response.data, message: 'User created successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create user' 
      };
    }
  }

  // Update user
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return { success: true, data: response.data, message: 'User updated successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update user' 
      };
    }
  }

  // Delete user
  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to delete user' 
      };
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await api.get('/users/profile');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch profile' 
      };
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      return { success: true, data: response.data, message: 'Profile updated successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update profile' 
      };
    }
  }

  // Get user roles
  async getRoles() {
    try {
      const response = await api.get('/users/roles');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to fetch roles',
        data: []
      };
    }
  }

  // Bulk import users
  async bulkImportUsers(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/users/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { success: true, data: response.data, message: 'Users imported successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to import users' 
      };
    }
  }

  // Export users
  async exportUsers() {
    try {
      const response = await api.get('/users/export', { responseType: 'blob' });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to export users' 
      };
    }
  }
// Add this method to UserService.js if not present
async exportUserData() {
    try {
        // For now, get data from localStorage since backend endpoint may not exist
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('token');
        
        const exportData = {
            user: user,
            preferences: {
                theme: localStorage.getItem('theme'),
                notifications: localStorage.getItem('notifications'),
                autoSave: localStorage.getItem('autoSave'),
                itemsPerPage: localStorage.getItem('itemsPerPage')
            },
            exportDate: new Date().toISOString()
        };
        
        return { success: true, data: exportData };
    } catch (error) {
        console.error('Export error:', error);
        return { success: false, message: 'Failed to export data' };
    }
}

// Also add getProfile method if missing
async getProfile() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return { success: true, data: user };
    } catch (error) {
        return { success: false, message: 'Failed to fetch profile' };
    }
}
}
export default new UserService();