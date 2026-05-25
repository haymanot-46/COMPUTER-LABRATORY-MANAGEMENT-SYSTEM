import apiClient from './apiClient';

export const auditService = {
  getAudits: (params) => apiClient.get('/audits', params),
  createAudit: (data) => apiClient.post('/audits', data),
  getLaboratories: () => apiClient.get('/laboratories'),
};

export default auditService;
