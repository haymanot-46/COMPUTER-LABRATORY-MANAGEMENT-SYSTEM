import apiClient from './apiClient';

export const assetService = {
  getEquipment: (params) => apiClient.get('/equipment', params),
  getEquipmentById: (id) => apiClient.get(`/equipment/${id}`),
  createEquipment: (data) => apiClient.post('/equipment', data),
  updateEquipment: (id, data) => apiClient.put(`/equipment/${id}`, data),
  deleteEquipment: (id) => apiClient.delete(`/equipment/${id}`),
  getCategories: () => apiClient.get('/equipment/categories'),
  getLaboratories: () => apiClient.get('/laboratories'),
};

export default assetService;
