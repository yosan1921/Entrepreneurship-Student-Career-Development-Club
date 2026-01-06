import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import DashboardOverview from './admin/DashboardOverview';
import ManageMembers from './admin/ManageMembers';
import ManageEventsAndNews from './admin/ManageEventsAndNews';
import ManageLeadership from './admin/ManageLeadership';
import GalleryManagement from './admin/GalleryManagement';
import ManageResources from './admin/ManageResources';
import ContactInbox from './admin/ContactInbox';
import ManageUsers from './admin/ManageUsers';
import AnnouncementsManagement from './admin/AnnouncementsManagement';
import ReportsManagement from './admin/ReportsManagement';
import SystemSettings from './admin/SystemSettings';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, hasRole } = useAuth();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await adminAPI.getDashboard();
            if (response.data.success) {
                setDashboardData(response.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { id: 'overview', label: 'Dashboard', icon: '📊', roles: ['super_admin', 'admin', 'editor'] },
        { id: 'members', label: 'Members', icon: '👥', roles: ['super_admin', 'admin', 'editor'] },
        { id: 'events', label: 'Events & News', icon: '📅', roles: ['super_admin', 'admin', 'editor'] },
        { id: 'leadership', label: 'Leadership', icon: '👑', roles: ['super_admin', 'admin'] },
        { id: 'gallery', label: 'Gallery', icon: '🖼️', roles: ['super_admin', 'admin', 'editor'] },
        { id: 'resources', label: 'Resources', icon: '📚', roles: ['super_admin', 'admin', 'editor'] },
        { id: 'announcements', label: 'Announcements', icon: '📢', roles: ['super_admin', 'admin', 'editor'] },
        { id: 'reports', label: 'Reports', icon: '📄', roles: ['super_admin', 'admin', 'editor'] },
        { id: 'settings', label: 'Settings', icon: '⚙️', roles: ['super_admin', 'admin'] },
        { id: 'contacts', label: 'Messages', icon: '📧', roles: ['super_admin', 'admin', 'editor'] },
        { id: 'users', label: 'Users', icon: '🔐', roles: ['super_admin'] },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <DashboardOverview data={dashboardData} onRefresh={fetchDashboardData} />;
            case 'members':
                return <ManageMembers />;
            case 'events':
                return <ManageEventsAndNews />;
            case 'leadership':
                return <ManageLeadership />;
            case 'gallery':
                return <GalleryManagement />;
            case 'resources':
                return <ManageResources />;
            case 'announcements':
                return <AnnouncementsManagement />;
            case 'reports':
                return <ReportsManagement />;
            case 'settings':
                return <SystemSettings />;
            case 'contacts':
                return <ContactInbox />;
            case 'users':
                return <ManageUsers />;
            default:
                return <DashboardOverview data={dashboardData} onRefresh={fetchDashboardData} />;
        }
    };

    if (loading) {
        return (
            <section className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                    <p className="text-xl text-gray-600 font-semibold">Loading admin dashboard...</p>
                    <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your data</p>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                                <p className="text-sm text-gray-600 hidden sm:block">Manage your club's content and settings</p>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <div className="text-sm font-semibold text-gray-900">
                                    {user?.firstName} {user?.lastName}
                                </div>
                                <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${user?.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                                        user?.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                                            'bg-green-100 text-green-700'
                                    }`}>
                                    {user?.role?.replace('_', ' ').toUpperCase()}
                                </div>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${user?.role === 'super_admin' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                                    user?.role === 'admin' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                                        'bg-gradient-to-br from-green-500 to-green-600'
                                }`}>
                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 fixed lg:sticky top-[73px] left-0 z-30 w-64 h-[calc(100vh-73px)] bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out overflow-y-auto`}>
                    <nav className="p-4 space-y-1">
                        {menuItems.map(item => (
                            hasRole(item.roles) && (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        if (window.innerWidth < 1024) {
                                            setSidebarOpen(false);
                                        }
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === item.id
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="flex-1 text-left">{item.label}</span>
                                    {activeTab === item.id && (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </button>
                            )
                        ))}
                    </nav>
                </aside>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20 top-[73px]"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                {/* Main Content */}
                <main className="flex-1 min-h-[calc(100vh-73px)]">
                    {/* Breadcrumb */}
                    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Admin</span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-gray-900 font-semibold">
                                {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                            </span>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="bg-gray-50">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </section>
    );
};

export default AdminDashboard;