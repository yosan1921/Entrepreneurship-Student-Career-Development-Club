import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

const ADMIN_ROLES = ['super_admin', 'admin', 'editor'];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuthStatus();

        const handleAuthError = () => {
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
            if (!token) { setLoading(false); return; }

            const response = await authAPI.getProfile();
            if (response.data.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            }
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                setUser(null);
                setIsAuthenticated(false);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } finally {
            setLoading(false);
        }
    };

    // Admin login (super_admin, admin, editor)
    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            if (response.data.success) {
                const { token, user } = response.data;
                // Reject if not an admin role
                if (!ADMIN_ROLES.includes(user.role)) {
                    return { success: false, message: 'Access denied. Not an admin account.' };
                }
                localStorage.setItem('authToken', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                setIsAuthenticated(true);
                return { success: true, user };
            }
            return { success: false, message: response.data.message || 'Login failed' };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Please check your credentials.'
            };
        }
    };

    // Member/user login
    const userLogin = async (credentials) => {
        try {
            const response = await authAPI.userLogin(credentials);
            if (response.data.success) {
                const { token, user } = response.data;
                localStorage.setItem('authToken', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                setIsAuthenticated(true);
                return { success: true, user };
            }
            return { success: false, message: response.data.message || 'Login failed' };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Please check your credentials.'
            };
        }
    };

    // User registration
    const register = async (data) => {
        try {
            const response = await authAPI.register(data);
            return { success: response.data.success, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed. Please try again.'
            };
        }
    };

    const logout = async () => {
        try { await authAPI.logout(); } catch (_) { }
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    // Role helpers
    const hasRole = (roles) => user ? roles.includes(user.role) : false;
    const isAdmin = () => user ? ADMIN_ROLES.includes(user.role) : false;
    const isMember = () => user?.role === 'member';

    const hasPermission = (permission) => {
        if (!user) return false;
        const permissions = {
            super_admin: ['read', 'write', 'delete', 'manage_users', 'manage_system'],
            admin: ['read', 'write', 'delete', 'manage_content'],
            editor: ['read', 'write'],
            member: ['read']
        };
        return permissions[user.role]?.includes(permission) || false;
    };

    return (
        <AuthContext.Provider value={{
            user, loading, isAuthenticated,
            login, userLogin, register, logout,
            hasRole, isAdmin, isMember, hasPermission,
            checkAuthStatus
        }}>
            {children}
        </AuthContext.Provider>
    );
};
