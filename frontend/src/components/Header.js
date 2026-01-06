import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import JoinClub from './JoinClub';

const Header = ({ setActiveSection }) => {
    const [showLogin, setShowLogin] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();

    const handleLoginSuccess = (user, targetSection = 'home') => {
        console.log('Login successful:', user);
        // Redirect to the appropriate section based on user role
        if (setActiveSection && targetSection) {
            setActiveSection(targetSection);
        }
    };

    const handleLogout = () => {
        logout();
        // Redirect to home after logout
        if (setActiveSection) {
            setActiveSection('home');
        }
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-[#0d47a1] text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo and Title */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <span className="text-xl sm:text-2xl font-bold">E</span>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg sm:text-xl font-bold leading-tight">
                                    ESCDC
                                </h1>
                                <p className="text-xs text-blue-200">
                                    Building Together, Growing Together
                                </p>
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {isAuthenticated ? (
                                <>
                                    <span className="hidden md:inline-block text-sm text-blue-100">
                                        {user?.firstName}
                                    </span>
                                    <button
                                        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
                                        onClick={handleLogout}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span className="hidden sm:inline">Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
                                        onClick={() => setShowLogin(true)}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        <span className="hidden sm:inline">Login</span>
                                    </button>
                                    <JoinClub />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {showLogin && (
                <Login
                    onClose={() => setShowLogin(false)}
                    onSuccess={handleLoginSuccess}
                />
            )}
        </>
    );
};

export default Header;
