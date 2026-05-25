import apiClient from './apiClient';

export const reportService = {
  getAssetReport: () => apiClient.get('/reports/asset'),
  getReportData: (endpoint, params) => apiClient.get(endpoint, params),
};

export default reportService;
