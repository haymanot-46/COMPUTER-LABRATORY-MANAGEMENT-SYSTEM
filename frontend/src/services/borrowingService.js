import apiClient from './apiClient';

export const borrowingService = {
  getAvailableEquipment: () => apiClient.get('/equipment', { status: 'available' }),
  createRequest: (data) => apiClient.post('/borrow-requests', data),
  getMyBorrowings: () => apiClient.get('/borrowings/my'),
  getAllBorrowings: () => apiClient.get('/borrowings'),
  createBorrowing: (data) => apiClient.post('/borrowings', data),
  returnBorrowing: (id) => apiClient.post(`/borrowings/${id}/return`),
};

export default borrowingService;
