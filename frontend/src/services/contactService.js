import apiClient from './apiClient';

export const contactService = {
  submit: (data) => apiClient.post('/contact/submit', data),
  getMessages: (status) => apiClient.get('/contact/messages', { status }),
  getMessageById: (id) => apiClient.get(`/contact/messages/${id}`),
  reply: (id, data) => apiClient.post(`/contact/messages/${id}/reply`, data),
  deleteMessage: (id) => apiClient.delete(`/contact/messages/${id}`),
};

export default contactService;
