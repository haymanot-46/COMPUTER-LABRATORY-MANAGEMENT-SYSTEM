import envConfig from '../config/env';

const API_BASE = envConfig.getApiUrl() || 'http://localhost:5001/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options,
  };
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }
  const response = await fetch(url, config);
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `Request failed: ${response.status}`);
    return data;
  }
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response;
}

export const apiClient = {
  get: (endpoint, params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return request(`${endpoint}${query}`);
  },
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: data }),
  put: (endpoint, data) => request(endpoint, { method: 'PUT', body: data }),
  patch: (endpoint, data) => request(endpoint, { method: 'PATCH', body: data }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export default apiClient;
