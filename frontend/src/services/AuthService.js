// frontend/src/services/authService.js
import api from './ApiService';

const authService = {
    // ============================================
    // AUTHENTICATION
    // ============================================
    
    // Login user
    login: async (credentials) => {
        try {
            console.log('📤 Login request for:', credentials.email);
            
            const response = await api.post('/auth/login', credentials);
            
            console.log('📥 Login response:', response);
            
            if (response.success) {
                let userData = { ...response.user };
                
                // Force role to correct format
                const originalRole = userData.role;
                
                // Ensure role is in underscore format
                let normalizedRole = originalRole;
                if (originalRole === 'lab-manager') normalizedRole = 'lab_manager';
                if (originalRole === 'lab-assistant') normalizedRole = 'lab_assistant';
                
                userData.role = normalizedRole;
                
                console.log(`🔄 Role normalized: ${originalRole} → ${userData.role}`);
                
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(userData));
                
                api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
                
                console.log('✅ User stored successfully');
            }
            return response;
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed. Please try again.' 
            };
        }
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        delete api.defaults.headers.common['Authorization'];
        window.location.href = '/login';
    },

    // Register new user
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response;
        } catch (error) {
            console.error('Registration error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Registration failed' 
            };
        }
    },

    // ============================================
    // USER MANAGEMENT
    // ============================================
    
    // Get current logged in user
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return user;
            } catch (error) {
                console.error('Error parsing user:', error);
                return null;
            }
        }
        return null;
    },

    // Get auth token
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        const user = authService.getCurrentUser();
        return !!token && !!user;
    },

    // Get user role (normalized)
    getUserRole: () => {
        const user = authService.getCurrentUser();
        const role = user?.role || null;
        
        // Normalize role for consistency
        const roleMap = {
            'lab-manager': 'lab_manager',
            'lab_manager': 'lab_manager',
            'lab-assistant': 'lab_assistant',
            'lab_assistant': 'lab_assistant'
        };
        
        const normalizedRole = roleMap[role] || role;
        
        // Store role in localStorage for easy access
        if (normalizedRole) {
            localStorage.setItem('userRole', normalizedRole);
        }
        
        return normalizedRole;
    },

    // Get dashboard route based on role
    getDashboardRoute: () => {
        const role = authService.getUserRole();
        
        const routeMap = {
            admin: '/admin/dashboard',
            teacher: '/teacher/dashboard',
            student: '/student/dashboard',
            lab_manager: '/lab-manager/dashboard',
            dean: '/dean/dashboard',
            lab_assistant: '/lab-assistant/dashboard',
            ict: '/ict/dashboard',
            asset: '/asset/dashboard'
        };
        
        const route = routeMap[role] || '/dashboard';
        console.log('🎯 Dashboard route for role', role, ':', route);
        return route;
    },

    // Update profile
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/users/profile', profileData);
            if (response.success && response.data) {
                // Update stored user data
                const currentUser = authService.getCurrentUser();
                const updatedUser = { ...currentUser, ...response.data };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            return response;
        } catch (error) {
            console.error('Update profile error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to update profile' 
            };
        }
    },

    // Change password
    changePassword: async (currentPassword, newPassword) => {
        try {
            const response = await api.post('/auth/change-password', { 
                currentPassword, 
                newPassword 
            });
            return response;
        } catch (error) {
            console.error('Change password error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to change password' 
            };
        }
    },

    // ============================================
    // PASSWORD RESET
    // ============================================
    
    // Forgot password - request reset link
    forgotPassword: async (email) => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response;
        } catch (error) {
            console.error('Forgot password error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to send reset link' 
            };
        }
    },

    // Reset password with token
    resetPassword: async (token, newPassword) => {
        try {
            const response = await api.post('/auth/reset-password', { token, newPassword });
            return response;
        } catch (error) {
            console.error('Reset password error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to reset password' 
            };
        }
    },

    // Verify reset token
    verifyResetToken: async (token) => {
        try {
            const response = await api.get(`/auth/verify-reset-token/${token}`);
            return response;
        } catch (error) {
            console.error('Verify reset token error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Invalid or expired token' 
            };
        }
    },

    // ============================================
    // EMAIL VERIFICATION
    // ============================================
    
    // Send verification email
    sendVerificationEmail: async (email) => {
        try {
            const response = await api.post('/auth/send-verification', { email });
            return response;
        } catch (error) {
            console.error('Send verification error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to send verification email' 
            };
        }
    },

    // Verify email with token
    verifyEmail: async (token) => {
        try {
            const response = await api.post('/auth/verify-email', { token });
            return response;
        } catch (error) {
            console.error('Email verification error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to verify email' 
            };
        }
    },

    // Resend verification email
    resendVerification: async (email) => {
        try {
            const response = await api.post('/auth/resend-verification', { email });
            return response;
        } catch (error) {
            console.error('Resend verification error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to resend verification email' 
            };
        }
    },

    // ============================================
    // TOKEN MANAGEMENT
    // ============================================
    
    // Refresh token
    refreshToken: async () => {
        try {
            const response = await api.post('/auth/refresh-token');
            if (response.success && response.token) {
                localStorage.setItem('token', response.token);
                api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
            }
            return response;
        } catch (error) {
            console.error('Token refresh error:', error);
            return { success: false, message: 'Failed to refresh token' };
        }
    },

    // ============================================
    // ROLE CHECK METHODS
    // ============================================
    
    // Check if user has specific role (with normalization)
    hasRole: (allowedRoles) => {
        const userRole = authService.getUserRole();
        if (!userRole) return false;
        
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        
        // Normalize allowed roles
        const normalizeRole = (role) => {
            if (role === 'lab-manager') return 'lab_manager';
            if (role === 'lab-assistant') return 'lab_assistant';
            return role;
        };
        
        const normalizedUserRole = normalizeRole(userRole);
        const normalizedAllowed = roles.map(r => normalizeRole(r));
        
        // Admin has access to everything
        if (normalizedUserRole === 'admin') return true;
        
        return normalizedAllowed.includes(normalizedUserRole);
    },

    isAdmin: () => {
        return authService.getUserRole() === 'admin';
    },

    isTeacher: () => {
        return authService.getUserRole() === 'teacher';
    },

    isStudent: () => {
        return authService.getUserRole() === 'student';
    },

    isLabManager: () => {
        const role = authService.getUserRole();
        return role === 'lab_manager';
    },

    isDean: () => {
        return authService.getUserRole() === 'dean';
    },

    isLabAssistant: () => {
        const role = authService.getUserRole();
        return role === 'lab_assistant';
    },

    isICT: () => {
        return authService.getUserRole() === 'ict';
    },

    isAsset: () => {
        return authService.getUserRole() === 'asset';
    },

    // ============================================
    // UTILITY METHODS
    // ============================================
    
    // Get user full name
    getUserName: () => {
        const user = authService.getCurrentUser();
        return user?.name || user?.fullName || 'User';
    },

    // Get user email
    getUserEmail: () => {
        const user = authService.getCurrentUser();
        return user?.email || '';
    },

    // Check if email is verified
    isEmailVerified: () => {
        const user = authService.getCurrentUser();
        return user?.is_email_verified === true;
    },

    // Update stored user data
    updateStoredUser: (updatedData) => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            const updatedUser = { ...currentUser, ...updatedData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    }
};

export default authService;