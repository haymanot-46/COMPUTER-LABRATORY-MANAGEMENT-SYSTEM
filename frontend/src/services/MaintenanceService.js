import apiClient from './apiClient';

export const maintenanceService = {
  getRequests: (params) => apiClient.get('/maintenance', params),
  getRequestById: (id) => apiClient.get(`/maintenance/${id}`),
  createRequest: (data) => apiClient.post('/maintenance', data),
  updateStatus: (id, data) => apiClient.patch(`/maintenance/${id}/status`, data),
};

export default maintenanceService;
