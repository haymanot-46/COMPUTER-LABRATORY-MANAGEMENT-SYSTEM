import api from './ApiService';

const profileImageService = {
    // Upload current user's profile image
    uploadProfileImage: async (imageData) => {
        try {
            const response = await api.post('/users/profile-image', { imageData });
            return response;
        } catch (error) {
            console.error('Error uploading profile image:', error);
            return { success: false, message: error.response?.data?.message || 'Upload failed' };
        }
    },

    // Remove profile image
    removeProfileImage: async () => {
        try {
            const response = await api.delete('/users/profile-image');
            return response;
        } catch (error) {
            console.error('Error removing profile image:', error);
            return { success: false, message: error.response?.data?.message || 'Remove failed' };
        }
    },

    // Get user's profile image
    getProfileImage: async (userId) => {
        try {
            const response = await api.get(`/users/${userId}/profile-image`);
            return response;
        } catch (error) {
            console.error('Error fetching profile image:', error);
            return { success: false, data: null };
        }
    },

    // Admin: Update any user's profile image
    adminUpdateProfileImage: async (userId, imageData) => {
        try {
            const response = await api.put(`/admin/users/${userId}/profile-image`, { imageData });
            return response;
        } catch (error) {
            console.error('Error updating user profile image:', error);
            return { success: false, message: error.response?.data?.message || 'Update failed' };
        }
    }
};

export default profileImageService;
