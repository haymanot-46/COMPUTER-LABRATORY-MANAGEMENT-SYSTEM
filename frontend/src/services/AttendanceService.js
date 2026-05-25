import apiClient from './apiClient';

export const attendanceService = {
  getStudentsBySchedule: (scheduleId) => apiClient.get(`/schedules/${scheduleId}/students`),
  markBulk: (data) => apiClient.post('/attendance/bulk', data),
  getReport: (params) => apiClient.get('/attendance/report', params),
  exportReport: (params) => apiClient.get('/attendance/export', params),
};

export default attendanceService;
