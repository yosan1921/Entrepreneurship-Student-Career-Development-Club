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
            <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md text-white border-b border-slate-800/80 shadow-premium">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo and Title */}
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center p-0.5 border border-white/20 shadow-inner group cursor-pointer">
                                <img src="/logo.png" alt="ESCDC Logo" className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                                    ESCDC
                                </h1>
                                <p className="text-[10px] sm:text-xs font-medium text-slate-400 tracking-wide">
                                    Building Together, Growing Together
                                </p>
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-3">
                            {isAuthenticated ? (
                                <>
                                    <span className="hidden md:inline-block text-xs sm:text-sm font-semibold tracking-wider uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                        Hi, {user?.firstName}
                                    </span>
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 rounded-xl transition-all duration-300 hover:scale-102"
                                        onClick={handleLogout}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all duration-300 hover:scale-102"
                                        onClick={() => setShowLogin(true)}
                                    >
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Login</span>
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
