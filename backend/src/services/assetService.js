import api from './ApiService';

const assetService = {
    // ============================================
    // EQUIPMENT CRUD
    // ============================================
    
    // Get all equipment with filters
    getEquipment: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/equipment${params ? `?${params}` : ''}`);
    },
    
    // Get single equipment
    getEquipmentById: (id) => api.get(`/equipment/${id}`),
    
    // Register new equipment
    registerEquipment: (data) => api.post('/equipment', data),
    
    // Update equipment
    updateEquipment: (id, data) => api.put(`/equipment/${id}`, data),
    
    // Delete equipment
    deleteEquipment: (id) => api.delete(`/equipment/${id}`),
    
    // Export equipment
    exportEquipment: () => api.get('/equipment/export', { responseType: 'blob' }),
    
    // ============================================
    // ASSET MANAGEMENT
    // ============================================
    
    // Get all assets
    getAll: () => api.get('/assets'),
    
    // Get single asset
    getById: (id) => api.get(`/assets/${id}`),
    
    // Create asset
    create: (data) => api.post('/assets', data),
    
    // Update asset
    update: (id, data) => api.put(`/assets/${id}`, data),
    
    // Delete asset
    delete: (id) => api.delete(`/assets/${id}`),
    
    // Get equipment by lab
    getEquipment: (params) => api.get('/equipment', { params }),
    
    // ============================================
    // AUDIT MANAGEMENT
    // ============================================
    
    // Get audit history
    getAudits: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/audits${params ? `?${params}` : ''}`);
    },
    
    // Get single audit
    getAuditById: (id) => api.get(`/audits/${id}`),
    
    // Create audit
    createAudit: (data) => api.post('/audits', data),
    
    // Update audit
    updateAudit: (id, data) => api.put(`/audits/${id}`, data),
    
    // Export audits
    exportAudits: () => api.get('/audits/export', { responseType: 'blob' }),
    
    // ============================================
    // BORROWING MANAGEMENT
    // ============================================
    
    // Get borrow requests
    getBorrowRequests: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/borrow-requests${params ? `?${params}` : ''}`);
    },
    
    // Get my borrow history
    getMyBorrowHistory: () => api.get('/borrow-requests/my'),
    
    // Create borrow request
    createBorrowRequest: (data) => api.post('/borrow-requests', data),
    
    // Update borrow request
    updateBorrowRequest: (id, data) => api.put(`/borrow-requests/${id}`, data),
    
    // Approve borrow request
    approveBorrowRequest: (id) => api.patch(`/borrow-requests/${id}/approve`),
    
    // Reject borrow request
    rejectBorrowRequest: (id, reason) => api.patch(`/borrow-requests/${id}/reject`, { reason }),
    
    // Return equipment
    returnEquipment: (id) => api.patch(`/borrow-requests/${id}/return`),
    
    // ============================================
    // WARRANTY MANAGEMENT
    // ============================================
    
    // Get warranties
    getWarranties: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/warranties${params ? `?${params}` : ''}`);
    },
    
    // Get expiring warranties
    getExpiringWarranties: (days = 30) => api.get(`/warranties/expiring?days=${days}`),
    
    // Update warranty
    updateWarranty: (id, data) => api.put(`/warranties/${id}`, data),
    
    // ============================================
    // STATISTICS
    // ============================================
    
    // Get asset statistics
    getAssetStats: () => api.get('/assets/statistics'),
    
    // Get equipment statistics
    getEquipmentStats: () => api.get('/equipment/statistics'),
    
    // Get audit statistics
    getAuditStats: () => api.get('/audits/statistics'),
    
    // ============================================
    // CATEGORIES & TYPES
    // ============================================
    
    // Get categories
    getCategories: () => api.get('/equipment/categories'),
    
    // Get conditions
    getConditions: () => api.get('/equipment/conditions'),
    
    // Get statuses
    getStatuses: () => api.get('/equipment/statuses'),
};

export default assetService;
