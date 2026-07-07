import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AccessDenied = ({ setActiveSection }) => {
    const { user, isAdmin, isMember } = useAuth();

    const handleRedirect = () => {
        if (isAdmin()) setActiveSection('admin');
        else if (isMember()) setActiveSection('user-dashboard');
        else setActiveSection('home');
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="w-24 h-24 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                </div>

                {/* Text */}
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-500 mb-2">
                    You don't have permission to view this page.
                </p>
                {user && (
                    <p className="text-sm text-gray-400 mb-8">
                        Logged in as <span className="font-semibold text-gray-600">{user.full_name || `${user.firstName} ${user.lastName}`.trim() || user.email}</span> ({user.role})
                    </p>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={handleRedirect}
                        className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all text-sm"
                    >
                        Go to My Dashboard
                    </button>
                    <button
                        onClick={() => setActiveSection('home')}
                        className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-sm"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessDenied;
