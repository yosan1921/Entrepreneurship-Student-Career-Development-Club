import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';



const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    getProfile: () => api.get('/auth/profile'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
    changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Admin API
export const adminAPI = {
    getUsers: () => api.get('/admin/users'),
    createUser: (userData) => api.post('/admin/users', userData),
    updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getDashboard: () => api.get('/admin/dashboard'),
};

// Members API
export const membersAPI = {
    register: (memberData) => api.post('/members', memberData),
    getAll: () => api.get('/members'),
    getById: (id) => api.get(`/members/${id}`),
    delete: (id) => api.delete(`/members/${id}`),
};

// Events API
export const eventsAPI = {
    getAll: (status) => api.get('/events', { params: { status } }),
    getUpcoming: () => api.get('/events', { params: { status: 'upcoming' } }),
    getById: (id) => api.get(`/events/${id}`),
    create: (eventData) => api.post('/events', eventData),
    update: (id, eventData) => api.put(`/events/${id}`, eventData),
    delete: (id) => api.delete(`/events/${id}`),
    // News methods (for future backend implementation)
    getAllNews: () => api.get('/news'),
    getAllNewsAdmin: () => api.get('/news/admin'),
    createNews: (newsData) => api.post('/news', newsData),
    updateNews: (id, newsData) => api.put(`/news/${id}`, newsData),
    deleteNews: (id) => api.delete(`/news/${id}`),
};

// Contact API
export const contactAPI = {
    submit: (contactData) => api.post('/contact', contactData),
    getAll: () => api.get('/contact'),
    updateStatus: (id, status) => api.patch(`/contact/${id}/status`, { status }),
    delete: (id) => api.delete(`/contact/${id}`),
    reply: (id, replyMessage) => api.post(`/contact/${id}/reply`, { replyMessage }),
};

// Leadership API
export const leadershipAPI = {
    getAll: () => api.get('/leadership'),
    getAllAdmin: () => api.get('/leadership/admin'),
    create: (leadershipData) => api.post('/leadership', leadershipData),
    update: (id, leadershipData) => api.put(`/leadership/${id}`, leadershipData),
    delete: (id) => api.delete(`/leadership/${id}`),
    uploadImage: (id, formData) => {
        return api.post(`/leadership/${id}/upload-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
    },
    deleteImage: (id) => api.delete(`/leadership/${id}/image`),
};

// Gallery API
export const galleryAPI = {
    getAll: (category, type) => api.get('/gallery', { params: { category, type } }),
    getById: (id) => api.get(`/gallery/${id}`),
    getAdminAll: (params) => api.get('/gallery/admin', { params }),
    getStats: () => api.get('/gallery/stats'),
    getDownloadStats: () => api.get('/gallery/stats/downloads'),
    create: (galleryData) => api.post('/gallery', galleryData),
    upload: (formData, config) => {
        return api.post('/gallery-test/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            ...config
        });
    },
    uploadMultiple: (formData, config) => {
        return api.post('/gallery/upload-multiple', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            ...config
        });
    },
    update: (id, galleryData) => api.put(`/gallery/${id}`, galleryData),
    replaceMedia: (id, formData) => {
        return api.put(`/gallery/${id}/replace`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
    },
    delete: (id) => api.delete(`/gallery/${id}`),
    download: (id) => `${API_BASE_URL}/gallery/download/${id}`,
    getFile: (filename) => `${API_BASE_URL}/gallery/files/${filename}`,
};

// Resources API
export const resourcesAPI = {
    getAll: (type) => api.get('/resources', { params: { type } }),
    getAllAdmin: (filters) => api.get('/resources/admin', { params: filters }),
    getCategories: () => api.get('/resources/categories'),
    getTags: () => api.get('/resources/tags'),
    getStats: () => api.get('/resources/stats'),
    create: (resourceData) => api.post('/resources', resourceData),
    update: (id, resourceData) => api.put(`/resources/admin/${id}`, resourceData),
    delete: (id) => api.delete(`/resources/${id}`),
    download: (id) => api.post(`/resources/${id}/download`),
    createCategory: (categoryData) => api.post('/resources/categories', categoryData),
    updateCategory: (id, categoryData) => api.put(`/resources/categories/${id}`, categoryData),
    deleteCategory: (id) => api.delete(`/resources/categories/${id}`),
};

// Announcements API
export const announcementsAPI = {
    getAll: (visibility, status, limit) => api.get('/announcements', { params: { visibility, status, limit } }),
    getById: (id) => api.get(`/announcements/${id}`),
    getAllAdmin: (status, visibility) => api.get('/announcements/admin/all', { params: { status, visibility } }),
    getStats: () => api.get('/announcements/admin/stats'),
    create: (announcementData) => api.post('/announcements', announcementData),
    update: (id, announcementData) => api.put(`/announcements/${id}`, announcementData),
    delete: (id) => api.delete(`/announcements/${id}`),
};

// Announcement Comments API
export const announcementCommentsAPI = {
    getByAnnouncement: (announcementId) => api.get(`/announcement-comments/announcement/${announcementId}`),
    create: (commentData) => api.post('/announcement-comments', commentData),
    update: (id, commentData) => api.put(`/announcement-comments/${id}`, commentData),
    delete: (id) => api.delete(`/announcement-comments/${id}`),
    getStats: (announcementId) => api.get(`/announcement-comments/announcement/${announcementId}/stats`),
};

// Announcement Likes API
export const announcementLikesAPI = {
    getCount: (announcementId) => api.get(`/announcement-likes/announcement/${announcementId}`),
    checkLiked: (announcementId, userEmail) => api.get(`/announcement-likes/announcement/${announcementId}/check`, { params: { userEmail } }),
    toggle: (likeData) => api.post('/announcement-likes/toggle', likeData),
    getDetails: (announcementId) => api.get(`/announcement-likes/announcement/${announcementId}/details`),
};

// Reports API
export const reportsAPI = {
    getAll: (type, academicYear, period, visibility) => api.get('/reports', { params: { type, academicYear, period, visibility } }),
    getAllAdmin: (type, status, visibility, academicYear) => api.get('/reports/admin/all', { params: { type, status, visibility, academicYear } }),
    getStats: () => api.get('/reports/admin/stats'),
    upload: (formData, config) => {
        return api.post('/reports/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            ...config
        });
    },
    update: (id, reportData) => api.put(`/reports/${id}`, reportData),
    delete: (id) => api.delete(`/reports/${id}`),
};

// System Settings API
export const systemSettingsAPI = {
    getPublicSettings: () => api.get('/system-settings/public'),
    getAllSettings: (category) => api.get('/system-settings/all', { params: { category } }),
    getFeatures: (category) => api.get('/system-settings/features', { params: { category } }),
    getStats: () => api.get('/system-settings/stats'),
    updateSetting: (key, data) => api.put(`/system-settings/setting/${key}`, data),
    createSetting: (data) => api.post('/system-settings/setting', data),
    updateFeature: (key, data) => api.put(`/system-settings/feature/${key}`, data),
    uploadLogo: (formData) => {
        return api.post('/system-settings/upload-logo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
    },
    download: (id) => `${API_BASE_URL}/reports/download/${id}`,
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;