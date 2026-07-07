import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const StatCard = ({ icon, label, value, color }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const QuickLink = ({ icon, label, description, onClick, color }) => (
    <button
        onClick={onClick}
        className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all text-left w-full"
    >
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color} transition-transform group-hover:scale-110`}>
            {icon}
        </div>
        <div>
            <p className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
    </button>
);

const UserDashboard = ({ setActiveSection }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        setActiveSection('home');
    };

    const firstName = user?.firstName || user?.full_name?.split(' ')[0] || 'Member';

    const quickLinks = [
        {
            icon: <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" /></svg>,
            label: 'Resources', description: 'Download templates, guides & materials',
            section: 'resources', color: 'bg-indigo-50'
        },
        {
            icon: <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
            label: 'Events', description: 'Browse upcoming club events',
            section: 'events', color: 'bg-emerald-50'
        },
        {
            icon: <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
            label: 'Gallery', description: 'View club photos and videos',
            section: 'gallery', color: 'bg-purple-50'
        },
        {
            icon: <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
            label: 'Announcements', description: 'Latest club news and updates',
            section: 'announcements', color: 'bg-amber-50'
        },
        {
            icon: <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
            label: 'Contact', description: 'Get in touch with the club',
            section: 'contact', color: 'bg-blue-50'
        },
        {
            icon: <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
            label: 'Event Files', description: 'Access event documents and media',
            section: 'event-gallery', color: 'bg-rose-50'
        },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
                <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-indigo-200 text-sm font-medium mb-1">Welcome back 👋</p>
                            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Hello, {firstName}!</h1>
                            <p className="text-indigo-200 text-sm max-w-sm">
                                You're now part of the ESCDC community. Explore resources, events, and more below.
                            </p>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 text-2xl font-black">
                            {firstName.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Member info chips */}
                    <div className="flex flex-wrap gap-2 mt-5">
                        {user?.department && (
                            <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-xs font-medium">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                {user.department}
                            </span>
                        )}
                        {user?.year && (
                            <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-xs font-medium">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                {user.year}
                            </span>
                        )}
                        {user?.student_id && (
                            <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-xs font-medium">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                                {user.student_id}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 bg-emerald-400/30 text-emerald-100 rounded-full px-3 py-1 text-xs font-semibold">
                            ● Active Member
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Links Grid */}
            <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Access</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickLinks.map(link => (
                        <QuickLink
                            key={link.section}
                            icon={link.icon}
                            label={link.label}
                            description={link.description}
                            color={link.color}
                            onClick={() => setActiveSection(link.section)}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Action */}
            <div className="flex justify-end">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default UserDashboard;
