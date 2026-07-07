import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './auth/LoginModal';
import RegisterModal from './auth/RegisterModal';

const Header = ({ setActiveSection }) => {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const { user, isAuthenticated, logout, isAdmin } = useAuth();

    const handleLoginSuccess = (user, targetSection = 'home') => {
        setActiveSection && setActiveSection(targetSection);
    };

    const handleLogout = () => {
        logout();
        setActiveSection && setActiveSection('home');
    };

    const openRegister = () => { setShowLogin(false); setShowRegister(true); };
    const openLogin = () => { setShowRegister(false); setShowLogin(true); };

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
                                        Hi, {user?.firstName || user?.full_name?.split(' ')[0]}
                                    </span>
                                    {isAdmin() && (
                                        <button
                                            onClick={() => setActiveSection('admin')}
                                            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-300 hover:text-white bg-purple-800/30 hover:bg-purple-700/40 border border-purple-700/40 rounded-xl transition-all"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                            Admin
                                        </button>
                                    )}
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 rounded-xl transition-all duration-300"
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
                                        className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all duration-300"
                                        onClick={() => setShowLogin(true)}
                                    >
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Login</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {showLogin && (
                <LoginModal
                    onClose={() => setShowLogin(false)}
                    onSuccess={handleLoginSuccess}
                    onRegister={openRegister}
                />
            )}
            {showRegister && (
                <RegisterModal
                    onClose={() => setShowRegister(false)}
                    onLoginClick={openLogin}
                />
            )}
        </>
    );
};

export default Header;
