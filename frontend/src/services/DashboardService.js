import api from './ApiService';

class DashboardService {
  // Get admin dashboard stats
  async getAdminStats() {
    try {
      const response = await api.get('/dashboard/admin/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to load dashboard data' 
      };
    }
  }

  // Get teacher dashboard stats
  async getTeacherDashboard() {
    try {
      const response = await api.get('/dashboard/teacher/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to load dashboard' 
      };
    }
  }

  // Get student dashboard stats
  async getStudentDashboard() {
    try {
      const response = await api.get('/dashboard/student/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to load dashboard' 
      };
    }
  }

  // Get lab manager dashboard stats
  async getLabManagerDashboard() {
    try {
      const response = await api.get('/dashboard/lab-manager/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to load dashboard' 
      };
    }
  }

  // Get dean dashboard stats
  async getDeanDashboard() {
    try {
      const response = await api.get('/dashboard/dean/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to load dashboard' 
      };
    }
  }

  // Get ICT dashboard stats
  async getICTdashboard() {
    try {
      const response = await api.get('/dashboard/ict/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to load dashboard' 
      };
    }
  }

  // Get asset dashboard stats
  async getAssetDashboard() {
    try {
      const response = await api.get('/dashboard/asset/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to load dashboard' 
      };
    }
  }

  // Get recent activities
  async getRecentActivities(limit = 10) {
    try {
      const response = await api.get(`/dashboard/activities?limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to load activities',
        data: []
      };
    }
  }

  // Get notifications
  async getNotifications() {
    try {
      const response = await api.get('/dashboard/notifications');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to load notifications',
        data: []
      };
    }
  }

  // Mark notification as read
  async markNotificationRead(notificationId) {
    try {
      const response = await api.put(`/dashboard/notifications/${notificationId}/read`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to mark notification as read' 
      };
    }
  }
}

export default new DashboardService();