import apiClient from './apiClient';

export const scheduleService = {
  getSchedules: (params) => apiClient.get('/schedules', params),
  getStudentSchedules: (studentId) => apiClient.get(`/students/${studentId}/schedules`),
  getMySchedules: () => apiClient.get('/schedules/my-schedules'),
  getPendingApprovals: () => apiClient.get('/schedules?status=pending'),
  getLaboratories: () => apiClient.get('/laboratories'),
  getCourses: () => apiClient.get('/schedules/courses'),
  getBatches: () => apiClient.get('/schedules/batches'),
  createSchedule: (data) => apiClient.post('/schedules', data),
  batchCreateSchedules: (data) => apiClient.post('/schedules/batch', data),
  checkAvailability: (labId, date, startTime, endTime) =>
    apiClient.get('/schedules/check-availability', { labId, date, startTime, endTime }),
  approveSchedule: (id, comments) => apiClient.patch(`/schedules/${id}/approve`, { comments }),
  rejectSchedule: (id, reason) => apiClient.patch(`/schedules/${id}/reject`, { reason }),
  cancelSchedule: (id, reason) => apiClient.patch(`/schedules/${id}/cancel`, { reason }),
  exportSchedules: (params) => apiClient.get('/schedules/export', params),
};

export default scheduleService;
