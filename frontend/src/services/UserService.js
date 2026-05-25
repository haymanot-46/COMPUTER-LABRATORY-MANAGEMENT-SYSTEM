import apiClient from './apiClient';

export const userService = {
  getUsers: (params) => apiClient.get('/users', params),
  getUserById: (id) => apiClient.get(`/admin/users/${id}`),
  createUser: (data) => apiClient.post('/users', data),
  updateUser: (id, data) => apiClient.put(`/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
  uploadProfileImage: (id, formData) => apiClient.put(`/admin/users/${id}/profile-image`, formData),
};

export default userService;
