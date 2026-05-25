import apiClient from './apiClient';

export const laboratoryService = {
  getAll: (params) => apiClient.get('/laboratories', params),
  getById: (id) => apiClient.get(`/laboratories/${id}`),
  create: (data) => apiClient.post('/laboratories', data),
  update: (id, data) => apiClient.put(`/laboratories/${id}`, data),
  delete: (id) => apiClient.delete(`/laboratories/${id}`),
};

export default laboratoryService;
