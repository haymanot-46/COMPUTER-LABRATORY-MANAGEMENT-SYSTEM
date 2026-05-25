import apiClient from './apiClient';

export const equipmentService = {
  getAll: (params) => apiClient.get('/equipment', params),
  getById: (id) => apiClient.get(`/equipment/${id}`),
  create: (data) => apiClient.post('/equipment', data),
  update: (id, data) => apiClient.put(`/equipment/${id}`, data),
  delete: (id) => apiClient.delete(`/equipment/${id}`),
  getCategories: () => apiClient.get('/equipment/categories'),
};

export default equipmentService;
