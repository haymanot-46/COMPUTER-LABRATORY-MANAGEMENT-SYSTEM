// frontend/src/services/ApiService.js
import axios from 'axios';
import envConfig from '../config/env';

// API Base URL - from env config, fallback to default
const API_BASE_URL = envConfig.getApiUrl() || 'http://localhost:5001/api';

const apiService = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor - adds token to all requests
apiService.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.data);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - Handles responses correctly
apiService.interceptors.response.use(
    (response) => {
        // Check if response is a blob (file download)
        if (response.config.responseType === 'blob') {
            return response;
        }
        
        console.log(`📥 ${response.config.url}`, response.data);
        return response.data;
    },
    (error) => {
        if (error.response) {
            console.error('API Error:', error.response.data);
            
            // Handle 401 Unauthorized
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('userRole');
                window.location.href = '/login';
            }
            
            return Promise.reject(error);
        }
        console.error('Network Error:', error.message);
        return Promise.reject(error);
    }
);

// ============================================
// AUTH API METHODS
// ============================================
export const authApi = {
    login: (credentials) => apiService.post('/auth/login', credentials),
    register: (userData) => apiService.post('/auth/register', userData),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
    },
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    changePassword: (currentPassword, newPassword) => 
        apiService.post('/auth/change-password', { currentPassword, newPassword }),
    
    // Forgot Password & Reset
    forgotPassword: (email) => apiService.post('/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => apiService.post('/auth/reset-password', { token, newPassword }),
    verifyResetToken: (token) => apiService.get(`/auth/verify-reset-token/${token}`),
    
    // Email Verification
    sendVerificationEmail: (email) => apiService.post('/auth/send-verification', { email }),
    verifyEmail: (token) => apiService.post('/auth/verify-email', { token }),
    resendVerification: (email) => apiService.post('/auth/resend-verification', { email }),
    
    // Token Management
    refreshToken: () => apiService.post('/auth/refresh-token'),
    
    // Profile Management
    updateProfile: (profileData) => apiService.put('/users/profile', profileData),
    getProfile: () => apiService.get('/users/profile'),
};

// ============================================
// USER API METHODS
// ============================================
export const userApi = {
    getAll: () => apiService.get('/users'),
    getById: (id) => apiService.get(`/users/${id}`),
    create: async (userData) => {
        console.log('🔵 userApi.create called with:', userData);
        try {
            const response = await apiService.post('/users', userData);
            console.log('🟢 userApi.create response:', response);
            return response;
        } catch (error) {
            console.error('🔴 userApi.create error:', error);
            throw error;
        }
    },
    update: (id, userData) => apiService.put(`/users/${id}`, userData),
    delete: (id) => apiService.delete(`/users/${id}`),
    getRoles: () => apiService.get('/users/roles'),
    exportData: () => apiService.get('/users/export-data'),
    updateProfileImage: (imageData) => apiService.post('/users/profile-image', { imageData }),
    getProfileImage: (userId) => apiService.get(`/users/${userId}/profile-image`),
    removeProfileImage: () => apiService.delete('/users/profile-image'),
};

// ============================================
// DASHBOARD API METHODS
// ============================================
export const dashboardApi = {
    getAdminStats: () => apiService.get('/dashboard/admin/stats'),
    getTeacherStats: () => apiService.get('/dashboard/teacher/stats'),
    getStudentStats: () => apiService.get('/dashboard/student/stats'),
    getLabManagerStats: () => apiService.get('/dashboard/lab-manager/stats'),
    getDeanStats: () => apiService.get('/dashboard/dean/stats'),
    getICTStats: () => apiService.get('/dashboard/ict/stats'),
    getAssetStats: () => apiService.get('/dashboard/asset/stats'),
};

// ============================================
// COMPUTER API METHODS
// ============================================
export const computerApi = {
    getAll: (filters) => apiService.get('/computers', { params: filters }),
    getById: (id) => apiService.get(`/computers/${id}`),
    create: (data) => apiService.post('/computers', data),
    update: (id, data) => apiService.put(`/computers/${id}`, data),
    delete: (id) => apiService.delete(`/computers/${id}`),
    updateStatus: (id, status) => apiService.patch(`/computers/${id}/status`, { status }),
    getStatistics: () => apiService.get('/computers/statistics'),
    export: () => apiService.get('/computers/export', { responseType: 'blob' }),
    bulkImport: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiService.post('/computers/bulk-import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
};

// ============================================
// LABORATORY API METHODS
// ============================================
export const laboratoryApi = {
    getAll: () => apiService.get('/laboratories'),
    getById: (id) => apiService.get(`/laboratories/${id}`),
    create: (data) => apiService.post('/laboratories', data),
    update: (id, data) => apiService.put(`/laboratories/${id}`, data),
    delete: (id) => apiService.delete(`/laboratories/${id}`),
    getComputers: (labId) => apiService.get(`/laboratories/${labId}/computers`),
    getStatistics: (labId) => apiService.get(`/laboratories/${labId}/statistics`),
};

// ============================================
// SCHEDULE API METHODS
// ============================================
export const scheduleApi = {
    getAll: (filters) => apiService.get('/schedules', { params: filters }),
    getById: (id) => apiService.get(`/schedules/${id}`),
    getMySchedules: () => apiService.get('/schedules/my-schedules'),
    getPendingApprovals: () => apiService.get('/schedules/pending-approvals'),
    create: (data) => apiService.post('/schedules', data),
    update: (id, data) => apiService.put(`/schedules/${id}`, data),
    delete: (id) => apiService.delete(`/schedules/${id}`),
    approve: (id, comments) => apiService.patch(`/schedules/${id}/approve`, { comments }),
    reject: (id, reason) => apiService.patch(`/schedules/${id}/reject`, { reason }),
    cancel: (id, reason) => apiService.patch(`/schedules/${id}/cancel`, { reason }),
    checkAvailability: (labId, date, startTime, endTime) => 
        apiService.get('/schedules/check-availability', { 
            params: { lab_id: labId, date, start_time: startTime, end_time: endTime } 
        }),
    getCourses: () => apiService.get('/courses'),
    getBatches: () => apiService.get('/batches'),
    batchCreate: (data) => apiService.post('/schedules/batch', data),
    export: () => apiService.get('/schedules/export', { responseType: 'blob' }),
};

// ============================================
// ATTENDANCE API METHODS
// ============================================
export const attendanceApi = {
    getBySchedule: (scheduleId) => apiService.get(`/attendance/schedule/${scheduleId}`),
    getMyAttendance: (filters) => apiService.get('/attendance/my', { params: filters }),
    mark: (data) => apiService.post('/attendance/mark', data),
    bulkMark: (data) => apiService.post('/attendance/bulk', data),
    update: (id, data) => apiService.put(`/attendance/${id}`, data),
    getReport: (filters) => apiService.get('/attendance/report', { params: filters }),
    export: (filters, format) => apiService.get('/attendance/export', { 
        params: { ...filters, format },
        responseType: 'blob' 
    }),
    sync: (offlineData) => apiService.post('/attendance/sync', { offlineData }),
    getStudentsForSchedule: (scheduleId) => apiService.get(`/schedules/${scheduleId}/students`),
    getSessions: (filters) => apiService.get('/sessions', { params: filters }),
    createSession: (data) => apiService.post('/sessions', data),
    startSession: (sessionId) => apiService.put(`/sessions/${sessionId}/start`),
    getSessionReport: (sessionId) => apiService.get(`/sessions/${sessionId}/report`),
    assignAssistant: (data) => apiService.post('/assign-assistant', data),
};

// ============================================
// MAINTENANCE API METHODS
// ============================================
export const maintenanceApi = {
    getAll: (filters) => apiService.get('/maintenance', { params: filters }),
    getById: (id) => apiService.get(`/maintenance/${id}`),
    create: (data) => apiService.post('/maintenance', data),
    update: (id, data) => apiService.put(`/maintenance/${id}`, data),
    delete: (id) => apiService.delete(`/maintenance/${id}`),
    assign: (id, technicianId, notes) => apiService.patch(`/maintenance/${id}/assign`, { technicianId, notes }),
    start: (id) => apiService.patch(`/maintenance/${id}/start`),
    complete: (id, resolution, partsUsed, timeSpent) => 
        apiService.patch(`/maintenance/${id}/complete`, { resolution, partsUsed, timeSpent }),
    cancel: (id, reason) => apiService.patch(`/maintenance/${id}/cancel`, { reason }),
    getStatistics: () => apiService.get('/maintenance/statistics'),
    export: () => apiService.get('/maintenance/export', { responseType: 'blob' }),
};

// ============================================
// REPORT API METHODS
// ============================================
export const reportApi = {
    generateAttendance: (filters) => apiService.post('/reports/attendance', filters),
    generateComputers: (filters) => apiService.post('/reports/computers', filters),
    generateMaintenance: (filters) => apiService.post('/reports/maintenance', filters),
    getSavedReports: () => apiService.get('/reports/saved'),
    saveReport: (data) => apiService.post('/reports/save', data),
    deleteSavedReport: (id) => apiService.delete(`/reports/saved/${id}`),
    getScheduledReports: () => apiService.get('/reports/scheduled'),
    createScheduledReport: (data) => apiService.post('/reports/schedule', data),
    updateScheduledReport: (id, data) => apiService.put(`/reports/scheduled/${id}`, data),
    deleteScheduledReport: (id) => apiService.delete(`/reports/scheduled/${id}`),
    runScheduledReport: (id) => apiService.post(`/reports/scheduled/${id}/run`),
    getCourseReport: (params) => apiService.get('/reports/course', { params }),
    getDepartmentReport: (params) => apiService.get('/reports/department', { params }),
    getLabUtilizationReport: (params) => apiService.get('/reports/lab-utilization', { params }),
};

// ============================================
// EQUIPMENT/ASSET API METHODS
// ============================================
export const equipmentApi = {
    getAll: (filters) => apiService.get('/equipment', { params: filters }),
    getById: (id) => apiService.get(`/equipment/${id}`),
    create: (data) => apiService.post('/equipment', data),
    update: (id, data) => apiService.put(`/equipment/${id}`, data),
    delete: (id) => apiService.delete(`/equipment/${id}`),
    getAvailable: () => apiService.get('/equipment/available'),
    getCategories: () => apiService.get('/equipment/categories'),
    getStatuses: () => apiService.get('/equipment/statuses'),
    getStatistics: () => apiService.get('/equipment/statistics'),
    export: () => apiService.get('/equipment/export', { responseType: 'blob' }),
    getExpiringWarranty: (days = 30) => apiService.get(`/equipment/expiring-warranty?days=${days}`),
    bulkImport: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiService.post('/equipment/bulk-import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
};

// ============================================
// AUDIT API METHODS
// ============================================
export const auditApi = {
    getAll: (filters) => apiService.get('/audits', { params: filters }),
    getById: (id) => apiService.get(`/audits/${id}`),
    create: (data) => apiService.post('/audits', data),
    update: (id, data) => apiService.put(`/audits/${id}`, data),
    delete: (id) => apiService.delete(`/audits/${id}`),
    getScheduled: () => apiService.get('/audits/scheduled'),
    schedule: (data) => apiService.post('/audits/schedule', data),
    complete: (id, data) => apiService.post(`/audits/${id}/complete`, data),
    export: () => apiService.get('/audits/export', { responseType: 'blob' }),
};

// ============================================
// BORROWING API METHODS
// ============================================
export const borrowingApi = {
    getAll: (filters) => apiService.get('/borrowings', { params: filters }),
    getMyBorrowings: () => apiService.get('/borrowings/my'),
    getById: (id) => apiService.get(`/borrowings/${id}`),
    create: (data) => apiService.post('/borrowings', data),
    issue: (id) => apiService.put(`/borrowings/${id}/issue`),
    return: (id, itemsCondition) => apiService.put(`/borrowings/${id}/return`, { items_condition: itemsCondition }),
    cancel: (id, reason) => apiService.put(`/borrowings/${id}/cancel`, { reason }),
};

// ============================================
// CONTACT MESSAGES API METHODS
// ============================================
export const contactApi = {
    submit: (data) => apiService.post('/contact/submit', data),
    getAll: (filters) => apiService.get('/contact/messages', { params: filters }),
    getById: (id) => apiService.get(`/contact/messages/${id}`),
    reply: (id, reply) => apiService.post(`/contact/messages/${id}/reply`, { reply }),
    delete: (id) => apiService.delete(`/contact/messages/${id}`),
    getPending: () => apiService.get('/contact/messages?status=pending'),
    getReplied: () => apiService.get('/contact/messages?status=replied'),
    getResolved: () => apiService.get('/contact/messages?status=resolved'),
};

// ============================================
// NOTIFICATIONS API METHODS
// ============================================
export const notificationApi = {
    getAll: (filters) => apiService.get('/notifications', { params: filters }),
    markAsRead: (id) => apiService.put(`/notifications/${id}/read`),
    markAllAsRead: () => apiService.put('/notifications/read-all'),
    delete: (id) => apiService.delete(`/notifications/${id}`),
    getUnreadCount: () => apiService.get('/notifications/unread-count'),
    cleanup: (days = 90) => apiService.delete(`/notifications/cleanup?days=${days}`),
};

// ============================================
// SETTINGS API METHODS
// ============================================
export const settingsApi = {
    getAll: () => apiService.get('/settings'),
    getByKey: (key) => apiService.get(`/settings/${key}`),
    getByCategory: (category) => apiService.get(`/settings/category/${category}`),
    update: (key, value) => apiService.put(`/settings/${key}`, { value }),
    updateMultiple: (settings) => apiService.put('/settings/multiple', { settings }),
    reset: (category) => apiService.post('/settings/reset', { category }),
};

// ============================================
// STATISTICS API METHODS
// ============================================
export const statisticsApi = {
    getSystemStats: () => apiService.get('/statistics/system'),
    getUsageStats: () => apiService.get('/statistics/usage'),
    getPerformanceStats: () => apiService.get('/statistics/performance'),
    getLabStats: () => apiService.get('/statistics/labs'),
    getEquipmentStats: () => apiService.get('/statistics/equipment'),
    getAttendanceStats: () => apiService.get('/statistics/attendance'),
};

// Default export
const apiServiceExport = {
    ...apiService,
    auth: authApi,
    users: userApi,
    dashboard: dashboardApi,
    computers: computerApi,
    laboratories: laboratoryApi,
    schedules: scheduleApi,
    attendance: attendanceApi,
    maintenance: maintenanceApi,
    reports: reportApi,
    equipment: equipmentApi,
    audits: auditApi,
    borrowing: borrowingApi,
    contact: contactApi,
    notifications: notificationApi,
    settings: settingsApi,
    statistics: statisticsApi,
};

export default apiServiceExport;