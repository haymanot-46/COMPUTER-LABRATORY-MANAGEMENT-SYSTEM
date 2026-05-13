import api from './ApiService';

const settingsService = {
    // ============================================
    // GET SETTINGS
    // ============================================
    
    // Get all settings
    getAll: async () => {
        try {
            const response = await api.get('/settings');
            return response;
        } catch (error) {
            console.error('Error fetching settings:', error);
            return { success: false, message: 'Failed to fetch settings', data: {} };
        }
    },
    
    // Get setting by key
    getByKey: async (key) => {
        try {
            const response = await api.get(`/settings/${key}`);
            return response;
        } catch (error) {
            console.error(`Error fetching setting '${key}':`, error);
            return { success: false, message: 'Failed to fetch setting', data: null };
        }
    },
    
    // Get settings by category
    getByCategory: async (category) => {
        try {
            const response = await api.get(`/settings/category/${category}`);
            return response;
        } catch (error) {
            console.error(`Error fetching settings category '${category}':`, error);
            return { success: false, message: 'Failed to fetch settings', data: {} };
        }
    },
    
    // ============================================
    // UPDATE SETTINGS
    // ============================================
    
    // Update single setting
    update: async (key, value) => {
        try {
            const response = await api.put(`/settings/${key}`, { value });
            return response;
        } catch (error) {
            console.error(`Error updating setting '${key}':`, error);
            return { success: false, message: 'Failed to update setting' };
        }
    },
    
    // Update multiple settings at once
    updateMultiple: async (settings) => {
        try {
            const response = await api.put('/settings/multiple', { settings });
            return response;
        } catch (error) {
            console.error('Error updating multiple settings:', error);
            return { success: false, message: 'Failed to update settings' };
        }
    },
    
    // Update system settings (maintenance mode, registration, etc.)
    updateSystemSettings: async (systemSettings) => {
        try {
            const response = await api.put('/settings/multiple', { settings: systemSettings });
            return response;
        } catch (error) {
            console.error('Error updating system settings:', error);
            return { success: false, message: 'Failed to update system settings' };
        }
    },
    
    // ============================================
    // RESET SETTINGS
    // ============================================
    
    // Reset all settings to default
    resetAll: async () => {
        try {
            const response = await api.post('/settings/reset');
            return response;
        } catch (error) {
            console.error('Error resetting settings:', error);
            return { success: false, message: 'Failed to reset settings' };
        }
    },
    
    // Reset settings by category
    resetByCategory: async (category) => {
        try {
            const response = await api.post('/settings/reset', { category });
            return response;
        } catch (error) {
            console.error(`Error resetting settings category '${category}':`, error);
            return { success: false, message: 'Failed to reset settings' };
        }
    },
    
    // Reset single setting
    resetByKey: async (key) => {
        try {
            const response = await api.post('/settings/reset', { key });
            return response;
        } catch (error) {
            console.error(`Error resetting setting '${key}':`, error);
            return { success: false, message: 'Failed to reset setting' };
        }
    },
    
    // ============================================
    // LOCAL STORAGE HELPERS (for user preferences)
    // ============================================
    
    // Save user preference to localStorage
    saveUserPreference: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return { success: true };
        } catch (error) {
            console.error('Error saving preference:', error);
            return { success: false, message: 'Failed to save preference' };
        }
    },
    
    // Get user preference from localStorage
    getUserPreference: (key, defaultValue = null) => {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('Error getting preference:', error);
            return defaultValue;
        }
    },
    
    // Clear user preferences
    clearUserPreferences: () => {
        try {
            const preferences = ['theme', 'notifications', 'autoSave', 'itemsPerPage'];
            preferences.forEach(pref => localStorage.removeItem(pref));
            return { success: true };
        } catch (error) {
            console.error('Error clearing preferences:', error);
            return { success: false, message: 'Failed to clear preferences' };
        }
    },
    
    // ============================================
    // SYSTEM STATUS HELPERS
    // ============================================
    
    // Check if system is in maintenance mode
    checkMaintenanceMode: async () => {
        try {
            const response = await settingsService.getByKey('maintenance_mode');
            return response.success ? response.data.value === true : false;
        } catch (error) {
            console.error('Error checking maintenance mode:', error);
            return false;
        }
    },
    
    // Get system version
    getSystemVersion: async () => {
        try {
            const response = await settingsService.getByKey('system_version');
            return response.success ? response.data.value : '1.0.0';
        } catch (error) {
            console.error('Error getting system version:', error);
            return '1.0.0';
        }
    },
    
    // Get current semester
    getCurrentSemester: async () => {
        try {
            const response = await settingsService.getByKey('current_semester');
            return response.success ? response.data.value : '1st Semester 2025';
        } catch (error) {
            console.error('Error getting current semester:', error);
            return '1st Semester 2025';
        }
    },
    
    // ============================================
    // BULK OPERATIONS
    // ============================================
    
    // Get all system settings (maintenance, registration, etc.)
    getSystemSettings: async () => {
        try {
            const response = await settingsService.getByCategory('system');
            return response;
        } catch (error) {
            console.error('Error fetching system settings:', error);
            return { success: false, data: {} };
        }
    },
    
    // Get all academic settings
    getAcademicSettings: async () => {
        try {
            const response = await settingsService.getByCategory('academic');
            return response;
        } catch (error) {
            console.error('Error fetching academic settings:', error);
            return { success: false, data: {} };
        }
    },
    
    // Get all security settings
    getSecuritySettings: async () => {
        try {
            const response = await settingsService.getByCategory('security');
            return response;
        } catch (error) {
            console.error('Error fetching security settings:', error);
            return { success: false, data: {} };
        }
    },
    
    // Get all notification settings
    getNotificationSettings: async () => {
        try {
            const response = await settingsService.getByCategory('notification');
            return response;
        } catch (error) {
            console.error('Error fetching notification settings:', error);
            return { success: false, data: {} };
        }
    },
    
    // Get all backup settings
    getBackupSettings: async () => {
        try {
            const response = await settingsService.getByCategory('backup');
            return response;
        } catch (error) {
            console.error('Error fetching backup settings:', error);
            return { success: false, data: {} };
        }
    },
    
    // ============================================
    // EMAIL SETTINGS (Admin only)
    // ============================================
    
    // Get email settings
    getEmailSettings: async () => {
        try {
            const response = await settingsService.getByCategory('email');
            return response;
        } catch (error) {
            console.error('Error fetching email settings:', error);
            return { success: false, data: {} };
        }
    },
    
    // Test email configuration
    testEmailConfig: async (email) => {
        try {
            const response = await api.post('/settings/test-email', { email });
            return response;
        } catch (error) {
            console.error('Error testing email config:', error);
            return { success: false, message: 'Failed to send test email' };
        }
    },
};

export default settingsService;