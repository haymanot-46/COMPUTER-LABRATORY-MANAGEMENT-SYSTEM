import api from './ApiService';

const scheduleService = {
  // ADD THIS METHOD - getAll for compatibility with LabAssistantDashboard
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.labId) params.append('laboratory_id', filters.labId);
      
      const url = `/schedules${params.toString() ? `?${params}` : ''}`;
      const response = await api.get(url);
      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return { success: false, data: [], message: error.message };
    }
  },

  getSchedules: (filters = {}) => api.get('/schedules', { params: filters }),
  
  getMySchedules: async () => {
    try {
      const response = await api.get('/schedules/my-schedules');
      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Error fetching my schedules:', error);
      return { success: false, message: 'Failed to fetch schedules', data: [] };
    }
  },
  
  getPendingApprovals: async () => {
    try {
      const response = await api.get('/schedules/pending-approvals');
      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return { success: false, data: [] };
    }
  },
  
  createSchedule: async (scheduleData) => {
    try {
      const payload = {
        course_name: scheduleData.course_name,
        laboratory_id: parseInt(scheduleData.laboratory_id),
        start_time: scheduleData.start_time,
        end_time: scheduleData.end_time,
        expected_students: parseInt(scheduleData.expected_students) || 0,
        notes: scheduleData.notes || ''
      };
      
      console.log('📤 Sending to backend:', payload);
      const response = await api.post('/schedules', payload);
      console.log('✅ Response:', response);
      return { success: true, data: response.data, message: 'Schedule created successfully' };
    } catch (error) {
      console.error('❌ Create schedule error:', error);
      if (error.response?.status === 409) {
        return { success: false, conflict: true, message: error.response?.data?.message || 'Schedule conflict detected' };
      }
      if (error.response?.status === 400) {
        return { success: false, message: error.response?.data?.message || 'Invalid data format' };
      }
      return { success: false, message: error.response?.data?.message || 'Failed to create schedule' };
    }
  },
  
  updateSchedule: async (id, scheduleData) => {
    try {
      const response = await api.put(`/schedules/${id}`, scheduleData);
      return { success: true, message: 'Schedule updated successfully' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update schedule' };
    }
  },
  
  approveSchedule: async (id, comments = '') => {
    try {
      const response = await api.patch(`/schedules/${id}/approve`, { comments });
      return { success: true, message: 'Schedule approved successfully' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to approve schedule' };
    }
  },
  
  rejectSchedule: async (id, reason = '') => {
    try {
      const response = await api.patch(`/schedules/${id}/reject`, { reason });
      return { success: true, message: 'Schedule rejected' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to reject schedule' };
    }
  },
  
  cancelSchedule: async (id, reason = '') => {
    try {
      const response = await api.patch(`/schedules/${id}/cancel`, { reason });
      return { success: true, message: 'Schedule cancelled successfully' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to cancel schedule' };
    }
  },
  
  checkAvailability: async (labId, date, startTime, endTime) => {
    try {
      const response = await api.get('/schedules/check-availability', {
        params: { lab_id: labId, date, start_time: startTime, end_time: endTime }
      });
      return { success: true, available: response.available, conflicts: response.conflicts || [] };
    } catch (error) {
      console.error('Error checking availability:', error);
      return { success: false, available: false, conflicts: [] };
    }
  },
  
  getLaboratories: async () => {
    try {
      const response = await api.get('/laboratories');
      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Error fetching laboratories:', error);
      return { success: false, data: [] };
    }
  },
  
  getCourses: async () => {
    try {
      const response = await api.get('/courses');
      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { 
        success: true, 
        data: [
          { id: 1, name: 'Database Systems', code: 'CS311' },
          { id: 2, name: 'Computer Networks', code: 'CS312' },
          { id: 3, name: 'Software Engineering', code: 'CS313' },
          { id: 4, name: 'Web Development', code: 'CS314' }
        ] 
      };
    }
  },
  
  getBatches: async () => {
    try {
      const response = await api.get('/batches');
      return { success: true, data: response.data || [] };
    } catch (error) {
      return { success: false, data: [] };
    }
  },
  
  batchCreateSchedules: async (batchData) => {
    try {
      const response = await api.post('/schedules/batch', batchData);
      return { success: true, data: response.data, message: 'Batch schedule created successfully' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to create batch schedule' };
    }
  },
  
  exportSchedules: async () => {
    try {
      const response = await api.get('/schedules/export', { responseType: 'blob' });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, message: 'Failed to export schedules' };
    }
  }
};

export default scheduleService;
