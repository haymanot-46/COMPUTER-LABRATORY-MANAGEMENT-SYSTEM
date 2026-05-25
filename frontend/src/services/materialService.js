import apiClient from './apiClient';

export const materialService = {
  getRequests: (status) => apiClient.get('/material-requests', { status }),
  approveRequest: (id) => apiClient.patch(`/material-requests/${id}/approve`),
  rejectRequest: (id, data) => apiClient.patch(`/material-requests/${id}/reject`, data),
};

export default materialService;
