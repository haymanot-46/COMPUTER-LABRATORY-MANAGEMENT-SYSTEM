import api from './ApiService';

const attendanceService = {
    // Get attendance by schedule
    getAttendanceBySchedule: async (scheduleId) => {
        try {
            const response = await api.get(`/attendance/schedule/${scheduleId}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: 'Failed to fetch attendance', data: [] };
        }
    },

    // Get students for a schedule
    getStudentsForSchedule: async (scheduleId) => {
        try {
            const response = await api.get(`/schedules/${scheduleId}/students`);
            return { success: true, data: response.data };
        } catch (error) {
            // Return mock data for development
            return {
                success: true,
                data: [
                    { id: 1, name: 'Abebe Kebede', studentId: 'STU-001', email: 'abebe@clms.com' },
                    { id: 2, name: 'Almaz Wondimu', studentId: 'STU-002', email: 'almaz@clms.com' },
                    { id: 3, name: 'Biruk Assefa', studentId: 'STU-003', email: 'biruk@clms.com' },
                ]
            };
        }
    },

    // Mark attendance for a student
    markAttendance: async (attendanceData) => {
        try {
            const response = await api.post('/attendance/mark', attendanceData);
            return { success: true, data: response.data, message: 'Attendance marked successfully' };
        } catch (error) {
            return { success: false, message: 'Failed to mark attendance' };
        }
    },

    // Bulk mark attendance
    bulkMarkAttendance: async (attendanceList) => {
        try {
            const response = await api.post('/attendance/bulk', { attendance: attendanceList });
            return { success: true, data: response.data, message: 'Attendance saved successfully' };
        } catch (error) {
            return { success: false, message: 'Failed to save attendance' };
        }
    },

    // Update attendance
    updateAttendance: async (attendanceId, status, notes) => {
        try {
            const response = await api.put(`/attendance/${attendanceId}`, { status, notes });
            return { success: true, data: response.data, message: 'Attendance updated successfully' };
        } catch (error) {
            return { success: false, message: 'Failed to update attendance' };
        }
    },

    // Get my attendance (for students)
    getMyAttendance: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await api.get(`/attendance/my${params ? `?${params}` : ''}`);
            return { success: true, data: response.data };
        } catch (error) {
            // Return mock data for development
            return {
                success: true,
                data: {
                    summary: {
                        overallAttendance: 85,
                        totalSessions: 24,
                        present: 18,
                        absent: 3,
                        late: 3
                    },
                    records: []
                }
            };
        }
    },

    // Get attendance report (alias for getAttendanceReport)
    getReport: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await api.get(`/attendance/report${params ? `?${params}` : ''}`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error getting attendance report:', error);
            return { success: false, message: 'Failed to get attendance report', data: null };
        }
    },

    // Get attendance report (original method)
    getAttendanceReport: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await api.get(`/attendance/report${params ? `?${params}` : ''}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: 'Failed to generate report', data: null };
        }
    },

    // Export attendance report
    exportAttendanceReport: async (filters, format = 'pdf') => {
        try {
            const response = await api.get('/attendance/export', {
                params: { ...filters, format },
                responseType: 'blob'
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: 'Failed to export report' };
        }
    },

    // Export report (alias for exportAttendanceReport)
    exportReport: async (filters, format = 'csv') => {
        try {
            const response = await api.get('/attendance/export', {
                params: { ...filters, format },
                responseType: 'blob'
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error exporting report:', error);
            return { success: false, message: 'Failed to export report' };
        }
    },

    // Sync offline attendance
    syncOfflineAttendance: async (offlineData) => {
        try {
            const response = await api.post('/attendance/sync', { offlineData });
            return { success: true, data: response.data, message: 'Attendance synced successfully' };
        } catch (error) {
            return { success: false, message: 'Failed to sync attendance' };
        }
    }
};

export default attendanceService;