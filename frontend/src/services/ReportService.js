// frontend/src/services/ReportService.js
import api from './ApiService';

const reportService = {
  // ============================================
  // REPORT GENERATION
  // ============================================
  
  // Generate attendance report
  generateAttendanceReport: async (filters) => {
    try {
      const response = await api.post('/reports/attendance', filters);
      return response;
    } catch (error) {
      console.error('Error generating attendance report:', error);
      return { success: false, message: 'Failed to generate report' };
    }
  },

  // Generate computer report
  generateComputerReport: async (filters) => {
    try {
      const response = await api.post('/reports/computers', filters);
      return response;
    } catch (error) {
      console.error('Error generating computer report:', error);
      return { success: false, message: 'Failed to generate report' };
    }
  },

  // Generate maintenance report
  generateMaintenanceReport: async (filters) => {
    try {
      const response = await api.post('/reports/maintenance', filters);
      return response;
    } catch (error) {
      console.error('Error generating maintenance report:', error);
      return { success: false, message: 'Failed to generate report' };
    }
  },

  // Generate department report (for Dean)
  generateDepartmentReport: async (filters) => {
    try {
      const response = await api.post('/reports/department', filters);
      return response;
    } catch (error) {
      console.error('Error generating department report:', error);
      return { success: false, message: 'Failed to generate department report' };
    }
  },

  // Generate lab utilization report (for Dean)
  generateLabUtilizationReport: async (filters) => {
    try {
      const response = await api.post('/reports/lab-utilization', filters);
      return response;
    } catch (error) {
      console.error('Error generating lab utilization report:', error);
      return { success: false, message: 'Failed to generate lab utilization report' };
    }
  },

  // Generate course report (for Dean)
  generateCourseReport: async (filters) => {
    try {
      const response = await api.post('/reports/course', filters);
      return response;
    } catch (error) {
      console.error('Error generating course report:', error);
      return { success: false, message: 'Failed to generate course report' };
    }
  },

  // ============================================
  // GET REPORTS (for preview)
  // ============================================
  
  // Get department report data
  getDepartmentReport: async (params) => {
    try {
      const response = await api.get('/reports/department', { params });
      return response;
    } catch (error) {
      console.error('Error getting department report:', error);
      return { success: false, message: 'Failed to get department report', data: null };
    }
  },

  // Get lab utilization report data
  getLabUtilizationReport: async (params) => {
    try {
      const response = await api.get('/reports/lab-utilization', { params });
      return response;
    } catch (error) {
      console.error('Error getting lab utilization report:', error);
      return { success: false, message: 'Failed to get lab utilization report', data: null };
    }
  },

  // Get course report data
  getCourseReport: async (params) => {
    try {
      const response = await api.get('/reports/course', { params });
      return response;
    } catch (error) {
      console.error('Error getting course report:', error);
      return { success: false, message: 'Failed to get course report', data: null };
    }
  },

  // ============================================
  // EXPORT REPORTS
  // ============================================
  
  // Export report with format
  exportReport: async (params) => {
    try {
      const { type, startDate, endDate, department, course, lab, format } = params;
      
      let endpoint = '';
      switch (type) {
        case 'attendance':
          endpoint = '/reports/attendance/export';
          break;
        case 'department':
          endpoint = '/reports/department/export';
          break;
        case 'lab':
          endpoint = '/reports/lab-utilization/export';
          break;
        case 'course':
          endpoint = '/reports/course/export';
          break;
        default:
          endpoint = '/reports/attendance/export';
      }
      
      const response = await api.get(endpoint, {
        params: { startDate, endDate, department, course, lab, format },
        responseType: 'blob'
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error exporting report:', error);
      return { success: false, message: 'Failed to export report' };
    }
  },

  // Legacy export method (kept for compatibility)
  exportReportLegacy: async (params) => {
    try {
      const { reportType, format, startDate, endDate } = params;
      const response = await api.post(`/reports/${reportType}`, 
        { startDate, endDate, format },
        { responseType: 'text' }
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error exporting report:', error);
      return { success: false, message: 'Failed to export report' };
    }
  },

  // ============================================
  // SCHEDULED REPORTS
  // ============================================

  // Get scheduled reports
  getScheduledReports: async () => {
    try {
      const response = await api.get('/reports/scheduled');
      return response;
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
      return { success: false, message: 'Failed to fetch scheduled reports', data: [] };
    }
  },

  // Create scheduled report
  createScheduledReport: async (scheduleData) => {
    try {
      const response = await api.post('/reports/schedule', scheduleData);
      return response;
    } catch (error) {
      return { success: false, message: 'Failed to create schedule' };
    }
  },

  // Update scheduled report
  updateScheduledReport: async (id, scheduleData) => {
    try {
      const response = await api.put(`/reports/scheduled/${id}`, scheduleData);
      return response;
    } catch (error) {
      return { success: false, message: 'Failed to update schedule' };
    }
  },

  // Delete scheduled report
  deleteScheduledReport: async (id) => {
    try {
      const response = await api.delete(`/reports/scheduled/${id}`);
      return response;
    } catch (error) {
      return { success: false, message: 'Failed to delete schedule' };
    }
  },

  // Run scheduled report
  runScheduledReport: async (id) => {
    try {
      const response = await api.post(`/reports/scheduled/${id}/run`);
      return response;
    } catch (error) {
      return { success: false, message: 'Failed to run report' };
    }
  },

  // ============================================
  // SAVED REPORTS
  // ============================================

  // Get saved reports
  getSavedReports: async () => {
    try {
      const response = await api.get('/reports/saved');
      return response;
    } catch (error) {
      return { success: false, message: 'Failed to fetch reports', data: [] };
    }
  },

  // Save report
  saveReport: async (reportData) => {
    try {
      const response = await api.post('/reports/save', reportData);
      return response;
    } catch (error) {
      return { success: false, message: 'Failed to save report' };
    }
  },

  // Delete saved report
  deleteSavedReport: async (id) => {
    try {
      const response = await api.delete(`/reports/saved/${id}`);
      return response;
    } catch (error) {
      return { success: false, message: 'Failed to delete report' };
    }
  },

  // ============================================
  // QUICK STATISTICS
  // ============================================

  // Get dashboard statistics for reports page
  getReportStats: async () => {
    try {
      const response = await api.get('/reports/stats');
      return response;
    } catch (error) {
      return { 
        success: false, 
        data: {
          departments: 4,
          courses: 8,
          laboratories: 5,
          totalReports: 45
        }
      };
    }
  }
};

export default reportService;