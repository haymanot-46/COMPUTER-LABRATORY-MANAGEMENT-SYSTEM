// frontend/src/services/EquipmentService.js
import api from './ApiService';

const equipmentService = {
    // ============================================
    // GET ALL EQUIPMENT WITH FILTERS
    // ============================================
    getAll: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            
            if (filters.search && filters.search !== '') {
                params.append('search', filters.search);
            }
            if (filters.category && filters.category !== 'all' && filters.category !== 'undefined') {
                params.append('category', filters.category);
            }
            if (filters.status && filters.status !== 'all' && filters.status !== 'undefined') {
                params.append('status', filters.status);
            }
            if (filters.lab && filters.lab !== 'all' && filters.lab !== 'undefined') {
                params.append('lab', filters.lab);
            }
            
            const url = `/equipment${params.toString() ? `?${params}` : ''}`;
            const response = await api.get(url);
            return response;
        } catch (error) {
            console.error('Error fetching equipment:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to fetch equipment',
                data: [] 
            };
        }
    },

    // ============================================
    // GET SINGLE EQUIPMENT BY ID
    // ============================================
    getById: async (id) => {
        try {
            const response = await api.get(`/equipment/${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching equipment by ID:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Equipment not found',
                data: null 
            };
        }
    },

    // ============================================
    // CREATE NEW EQUIPMENT
    // ============================================
    create: async (equipmentData) => {
        try {
            // Validate required fields
            if (!equipmentData.code) {
                return { success: false, message: 'Equipment code is required' };
            }
            if (!equipmentData.name) {
                return { success: false, message: 'Equipment name is required' };
            }
            
            const response = await api.post('/equipment', equipmentData);
            return response;
        } catch (error) {
            console.error('Error creating equipment:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to create equipment',
                data: null 
            };
        }
    },

    // ============================================
    // UPDATE EQUIPMENT
    // ============================================
    update: async (id, equipmentData) => {
        try {
            if (!id) {
                return { success: false, message: 'Equipment ID is required' };
            }
            
            const response = await api.put(`/equipment/${id}`, equipmentData);
            return response;
        } catch (error) {
            console.error('Error updating equipment:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to update equipment',
                data: null 
            };
        }
    },

    // ============================================
    // DELETE EQUIPMENT
    // ============================================
    delete: async (id) => {
        try {
            if (!id) {
                return { success: false, message: 'Equipment ID is required' };
            }
            
            const response = await api.delete(`/equipment/${id}`);
            return response;
        } catch (error) {
            console.error('Error deleting equipment:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to delete equipment' 
            };
        }
    },

    // ============================================
    // GET EQUIPMENT CATEGORIES
    // ============================================
    getCategories: async () => {
        try {
            const response = await api.get('/equipment/categories');
            return response;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return { 
                success: true, 
                data: [
                    'Computer', 'Monitor', 'Printer', 'Projector', 
                    'Network', 'Software', 'Furniture', 'Other'
                ] 
            };
        }
    },

    // ============================================
    // GET EQUIPMENT STATUSES
    // ============================================
    getStatuses: () => {
        return {
            success: true,
            data: [
                { value: 'available', label: 'Available', color: '#10b981', icon: '✅' },
                { value: 'in-use', label: 'In Use', color: '#3b82f6', icon: '🔄' },
                { value: 'maintenance', label: 'Maintenance', color: '#f59e0b', icon: '🔧' },
                { value: 'damaged', label: 'Damaged', color: '#ef4444', icon: '⚠️' },
                { value: 'retired', label: 'Retired', color: '#6b7280', icon: '📦' }
            ]
        };
    },

    // ============================================
    // GET EQUIPMENT CONDITIONS
    // ============================================
    getConditions: () => {
        return {
            success: true,
            data: [
                { value: 'excellent', label: 'Excellent', color: '#10b981', icon: '🌟' },
                { value: 'good', label: 'Good', color: '#3b82f6', icon: '👍' },
                { value: 'fair', label: 'Fair', color: '#f59e0b', icon: '👌' },
                { value: 'poor', label: 'Poor', color: '#f97316', icon: '⚠️' },
                { value: 'damaged', label: 'Damaged', color: '#ef4444', icon: '❌' }
            ]
        };
    },

    // ============================================
    // GET EQUIPMENT STATISTICS
    // ============================================
    getStatistics: async () => {
        try {
            const response = await api.get('/equipment/statistics');
            return response;
        } catch (error) {
            console.error('Error fetching statistics:', error);
            return { 
                success: false, 
                data: {
                    total: 0,
                    byStatus: [],
                    byCondition: [],
                    byCategory: []
                } 
            };
        }
    },

    // ============================================
    // EXPORT EQUIPMENT AS CSV
    // ============================================
    exportEquipment: async () => {
        try {
            const response = await api.get('/equipment/export', { responseType: 'blob' });
            return response;
        } catch (error) {
            console.error('Error exporting equipment:', error);
            throw error;
        }
    },

    // ============================================
    // BULK IMPORT EQUIPMENT
    // ============================================
    bulkImport: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await api.post('/equipment/bulk-import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response;
        } catch (error) {
            console.error('Error bulk importing equipment:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to import equipment' 
            };
        }
    },

    // ============================================
    // GET EQUIPMENT BY LABORATORY
    // ============================================
    getByLaboratory: async (laboratoryId) => {
        try {
            const response = await api.get(`/equipment?lab=${laboratoryId}`);
            return response;
        } catch (error) {
            console.error('Error fetching equipment by laboratory:', error);
            return { success: false, data: [], message: 'Failed to fetch equipment' };
        }
    },

    // ============================================
    // GET EQUIPMENT BY CATEGORY
    // ============================================
    getByCategory: async (category) => {
        try {
            const response = await api.get(`/equipment?category=${category}`);
            return response;
        } catch (error) {
            console.error('Error fetching equipment by category:', error);
            return { success: false, data: [], message: 'Failed to fetch equipment' };
        }
    },

    // ============================================
    // UPDATE EQUIPMENT STATUS
    // ============================================
    updateStatus: async (id, status) => {
        try {
            const response = await api.patch(`/equipment/${id}/status`, { status });
            return response;
        } catch (error) {
            console.error('Error updating equipment status:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to update status' 
            };
        }
    },

    // ============================================
    // UPDATE EQUIPMENT CONDITION
    // ============================================
    updateCondition: async (id, condition) => {
        try {
            const response = await api.patch(`/equipment/${id}/condition`, { condition });
            return response;
        } catch (error) {
            console.error('Error updating equipment condition:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to update condition' 
            };
        }
    },

    // ============================================
    // SEARCH EQUIPMENT
    // ============================================
    search: async (query) => {
        try {
            const response = await api.get(`/equipment?search=${encodeURIComponent(query)}`);
            return response;
        } catch (error) {
            console.error('Error searching equipment:', error);
            return { success: false, data: [], message: 'Search failed' };
        }
    },

    // ============================================
    // GET LOW STOCK / EXPIRING WARRANTY EQUIPMENT
    // ============================================
    getExpiringWarranty: async (days = 30) => {
        try {
            const response = await api.get(`/equipment/expiring-warranty?days=${days}`);
            return response;
        } catch (error) {
            console.error('Error fetching expiring warranty equipment:', error);
            return { success: false, data: [] };
        }
    }
};

export default equipmentService;