import api from './ApiService';

const maintenanceService = {
    // Get all maintenance requests
    getRequests: (filters = {}) => {
        return api.get('/maintenance', { params: filters });
    },
    
    // Get single request
    getRequestById: (id) => {
        return api.get(`/maintenance/${id}`);
    },
    
    // Create new request
    createRequest: (data) => {
        return api.post('/maintenance', data);
    },
    
    // Update request
    updateRequest: (id, data) => {
        return api.put(`/maintenance/${id}`, data);
    },
    
    // Assign technician
    assignTechnician: (id, technicianId, notes) => {
        return api.patch(`/maintenance/${id}/assign`, { technicianId, notes });
    },
    
    // Complete request
    completeRequest: (id, resolution, partsUsed) => {
        return api.patch(`/maintenance/${id}/complete`, { resolution, partsUsed });
    },
    
    // Cancel request
    cancelRequest: (id, reason) => {
        return api.patch(`/maintenance/${id}/cancel`, { reason });
    },
    
    // Export requests
    exportRequests: () => {
        return api.get('/maintenance/export', { responseType: 'blob' });
    },
    
    // Get maintenance statistics
    getStatistics: () => {
        return api.get('/maintenance/statistics');
    }
};

export default maintenanceService;