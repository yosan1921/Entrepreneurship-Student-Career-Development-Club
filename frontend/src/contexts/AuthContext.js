import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuthStatus();

        // Listen for 401 events from the API interceptor
        const handleAuthError = () => {
            console.warn('⚠️ Received auth-401 event. Resetting auth state.');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
        };

        window.addEventListener('auth-401', handleAuthError);
        return () => window.removeEventListener('auth-401', handleAuthError);
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('authToken');
            console.log('🔍 Checking auth status...', token ? 'Token found' : 'No token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await authAPI.getProfile();
            console.log('👤 Auth Profile Response:', response.data);
            if (response.data.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('❌ Auth check failed:', error.response?.status, error.message);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            console.log('🔑 Attempting login for:', credentials.username);
            const response = await authAPI.login(credentials);
            console.log('📥 Login Response:', response.data);

            if (response.data.success) {
                const { token, user } = response.data;

                localStorage.setItem('authToken', token);
                localStorage.setItem('user', JSON.stringify(user));

                setUser(user);
                setIsAuthenticated(true);
                console.log('✅ Auth state updated: Authenticated');

                return { success: true, user };
            }
        } catch (error) {
            console.error('❌ Login failed:', error.response?.status, error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const hasRole = (roles) => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    const hasPermission = (permission) => {
        if (!user) return false;

        const permissions = {
            super_admin: ['read', 'write', 'delete', 'manage_users', 'manage_system'],
            admin: ['read', 'write', 'delete', 'manage_content'],
            editor: ['read', 'write']
        };

        return permissions[user.role]?.includes(permission) || false;
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        hasRole,
        hasPermission,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};