import api from './ApiService';

// Laboratory Service - Handles all laboratory-related API calls
const laboratoryService = {
    // ============================================
    // Laboratory CRUD Operations
    // ============================================
    
    // Get all laboratories
    getAll: (params = {}) => {
        return api.get('/laboratories', { params });
    },
    
    // Get active laboratories (for dropdowns)
    getActive: () => {
        return api.get('/laboratories', { params: { status: 'active' } });
    },
    
    // Get single laboratory by ID
    getById: (id) => {
        return api.get(`/laboratories/${id}`);
    },
    
    // Create new laboratory
    create: (laboratoryData) => {
        return api.post('/laboratories', laboratoryData);
    },
    
    // Update laboratory
    update: (id, laboratoryData) => {
        return api.put(`/laboratories/${id}`, laboratoryData);
    },
    
    // Delete laboratory
    delete: (id) => {
        return api.delete(`/laboratories/${id}`);
    },
    
    // Update laboratory status
    updateStatus: (id, status) => {
        return api.patch(`/laboratories/${id}/status`, { status });
    },
    
    // ============================================
    // Laboratory Computers Management
    // ============================================
    
    // Get computers in a specific laboratory
    getComputers: (labId) => {
        return api.get(`/laboratories/${labId}/computers`);
    },
    
    // Get available computers in a laboratory
    getAvailableComputers: (labId) => {
        return api.get(`/laboratories/${labId}/computers`, { params: { status: 'available' } });
    },
    
    // Add computer to laboratory
    addComputer: (labId, computerData) => {
        return api.post(`/laboratories/${labId}/computers`, computerData);
    },
    
    // Remove computer from laboratory
    removeComputer: (labId, computerId) => {
        return api.delete(`/laboratories/${labId}/computers/${computerId}`);
    },
    
    // ============================================
    // Laboratory Statistics
    // ============================================
    
    // Get laboratory statistics (computer count, usage, etc.)
    getStatistics: (labId) => {
        return api.get(`/laboratories/${labId}/statistics`);
    },
    
    // Get all laboratories statistics
    getAllStatistics: () => {
        return api.get('/laboratories/statistics');
    },
    
    // Get laboratory utilization data
    getUtilization: (labId, startDate, endDate) => {
        return api.get(`/laboratories/${labId}/utilization`, {
            params: { startDate, endDate }
        });
    },
    
    // ============================================
    // Laboratory Schedule Management
    // ============================================
    
    // Get schedules for a laboratory
    getSchedules: (labId, startDate, endDate) => {
        return api.get(`/laboratories/${labId}/schedules`, {
            params: { startDate, endDate }
        });
    },
    
    // Check laboratory availability
    checkAvailability: (labId, date, startTime, endTime) => {
        return api.get(`/laboratories/${labId}/availability`, {
            params: { date, startTime, endTime }
        });
    },
    
    // Get upcoming schedules for a laboratory
    getUpcomingSchedules: (labId, days = 7) => {
        return api.get(`/laboratories/${labId}/upcoming`, { params: { days } });
    },
    
    // ============================================
    // Laboratory Equipment Management
    // ============================================
    
    // Get equipment in a laboratory
    getEquipment: (labId) => {
        return api.get(`/laboratories/${labId}/equipment`);
    },
    
    // Add equipment to laboratory
    addEquipment: (labId, equipmentData) => {
        return api.post(`/laboratories/${labId}/equipment`, equipmentData);
    },
    
    // Update equipment in laboratory
    updateEquipment: (labId, equipmentId, equipmentData) => {
        return api.put(`/laboratories/${labId}/equipment/${equipmentId}`, equipmentData);
    },
    
    // Remove equipment from laboratory
    removeEquipment: (labId, equipmentId) => {
        return api.delete(`/laboratories/${labId}/equipment/${equipmentId}`);
    },
    
    // ============================================
    // Laboratory Staff Management
    // ============================================
    
    // Get staff assigned to laboratory
    getStaff: (labId) => {
        return api.get(`/laboratories/${labId}/staff`);
    },
    
    // Assign staff to laboratory
    assignStaff: (labId, staffId, role) => {
        return api.post(`/laboratories/${labId}/staff`, { staffId, role });
    },
    
    // Remove staff from laboratory
    removeStaff: (labId, staffId) => {
        return api.delete(`/laboratories/${labId}/staff/${staffId}`);
    },
    
    // ============================================
    // Laboratory Maintenance
    // ============================================
    
    // Report maintenance issue
    reportMaintenance: (labId, issueData) => {
        return api.post(`/laboratories/${labId}/maintenance`, issueData);
    },
    
    // Get maintenance history
    getMaintenanceHistory: (labId) => {
        return api.get(`/laboratories/${labId}/maintenance`);
    },
    
    // Resolve maintenance issue
    resolveMaintenance: (labId, issueId, resolution) => {
        return api.patch(`/laboratories/${labId}/maintenance/${issueId}`, { resolution });
    },
    
    // ============================================
    // Laboratory Reports
    // ============================================
    
    // Generate laboratory usage report
    generateUsageReport: (labId, startDate, endDate) => {
        return api.get(`/laboratories/${labId}/reports/usage`, {
            params: { startDate, endDate },
            responseType: 'blob'
        });
    },
    
    // Generate laboratory inventory report
    generateInventoryReport: (labId) => {
        return api.get(`/laboratories/${labId}/reports/inventory`, {
            responseType: 'blob'
        });
    },
    
    // ============================================
    // Helper Methods
    // ============================================
    
    // Format laboratory name for display
    formatLabName: (lab) => {
        if (!lab) return '';
        return `${lab.name} (${lab.code})`;
    },
    
    // Get laboratory capacity status
    getCapacityStatus: (lab) => {
        if (!lab) return { status: 'unknown', percentage: 0 };
        const computerCount = lab.computer_count || 0;
        const capacity = lab.capacity || 0;
        const percentage = capacity > 0 ? (computerCount / capacity) * 100 : 0;
        
        if (percentage >= 90) return { status: 'critical', percentage, color: '#ef4444' };
        if (percentage >= 70) return { status: 'warning', percentage, color: '#f59e0b' };
        return { status: 'good', percentage, color: '#10b981' };
    },
    
    // Get laboratory status badge
    getStatusBadge: (isActive) => {
        if (isActive) {
            return { label: 'Active', color: '#10b981', bg: '#d1fae5' };
        }
        return { label: 'Inactive', color: '#6b7280', bg: '#f3f4f6' };
    }
};

// Export as default
export default laboratoryService;

// Also export as named export for compatibility
export { laboratoryService };