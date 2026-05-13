// frontend/src/services/AssetService.js
import api from './ApiService';

const assetService = {
    // ============================================
    // EQUIPMENT CRUD
    // ============================================
    
    // Get all equipment with filters
    getEquipment: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.category && filters.category !== 'all') params.append('category', filters.category);
            if (filters.status && filters.status !== 'all') params.append('status', filters.status);
            if (filters.lab && filters.lab !== 'all') params.append('lab', filters.lab);
            
            const response = await api.get(`/equipment${params.toString() ? `?${params}` : ''}`);
            return response;
        } catch (error) {
            console.error('Error fetching equipment:', error);
            return { success: false, data: [], message: error.message };
        }
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
    // WARRANTY MANAGEMENT
    // ============================================
    
    // Get expiring warranties
    getExpiringWarranties: async (days = 30) => {
        try {
            // First get all equipment, then filter on client side
            const response = await assetService.getEquipment();
            if (response.success && response.data) {
                const today = new Date();
                const futureDate = new Date();
                futureDate.setDate(today.getDate() + days);
                
                const expiring = response.data.filter(item => {
                    if (!item.warranty_expiry) return false;
                    const expiryDate = new Date(item.warranty_expiry);
                    return expiryDate <= futureDate && expiryDate >= today;
                }).map(item => ({
                    id: item.id,
                    name: item.name,
                    equipment: item.name,
                    daysLeft: Math.ceil((new Date(item.warranty_expiry) - today) / (1000 * 60 * 60 * 24)),
                    status: item.status
                }));
                
                return { success: true, data: expiring };
            }
            return { success: true, data: [] };
        } catch (error) {
            console.error('Error getting expiring warranties:', error);
            return { success: true, data: [] };
        }
    },
    
    // ============================================
    // STATISTICS
    // ============================================
    
    // Get equipment statistics
    getEquipmentStats: async () => {
        try {
            const response = await assetService.getEquipment();
            if (response.success && response.data) {
                const equipment = response.data;
                const stats = {
                    total: equipment.length,
                    available: equipment.filter(e => e.status === 'available').length,
                    inUse: equipment.filter(e => e.status === 'in-use' || e.status === 'borrowed').length,
                    maintenance: equipment.filter(e => e.status === 'maintenance').length,
                    damaged: equipment.filter(e => e.status === 'damaged').length,
                    categories: [...new Set(equipment.map(e => e.category).filter(Boolean))].length
                };
                return { success: true, data: stats };
            }
            return { success: false, data: null };
        } catch (error) {
            return { success: false, data: null };
        }
    },
    
    // ============================================
    // CATEGORIES & TYPES
    // ============================================
    
    // Get categories
    getCategories: async () => {
        try {
            const response = await assetService.getEquipment();
            if (response.success && response.data) {
                const categories = [...new Set(response.data.map(e => e.category).filter(Boolean))];
                return { success: true, data: categories };
            }
            return { success: true, data: [] };
        } catch (error) {
            return { success: true, data: [] };
        }
    }
};

export default assetService;