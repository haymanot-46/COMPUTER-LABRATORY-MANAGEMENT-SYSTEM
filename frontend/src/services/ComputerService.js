import apiClient from './apiClient';

export const computerService = {
  getComputers: (params) => apiClient.get('/computers', params),
  getComputerById: (id) => apiClient.get(`/computers/${id}`),
  createComputer: (data) => apiClient.post('/computers', data),
  updateComputer: (id, data) => apiClient.put(`/computers/${id}`, data),
  deleteComputer: (id) => apiClient.delete(`/computers/${id}`),
  getLaboratories: () => apiClient.get('/laboratories'),
};

export default computerService;
