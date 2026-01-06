import React, { useState } from 'react';

const DashboardOverview = ({ data, onRefresh }) => {
    const [activeFilter, setActiveFilter] = useState('all');

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    const { stats, recentActivities } = data;

    const statCards = [
        {
            title: 'Total Members',
            value: stats.totalMembers || 0,
            icon: '👥',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'from-blue-50 to-blue-100',
            change: '+12%',
            changeType: 'increase'
        },
        {
            title: 'New Members',
            value: stats.newMembers || 0,
            icon: '🆕',
            color: 'from-green-500 to-green-600',
            bgColor: 'from-green-50 to-green-100',
            subtitle: 'Last 30 days',
            change: '+8%',
            changeType: 'increase'
        },
        {
            title: 'Total Events',
            value: stats.totalEvents || 0,
            icon: '📅',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'from-purple-50 to-purple-100',
            change: '+5%',
            changeType: 'increase'
        },
        {
            title: 'Upcoming Events',
            value: stats.upcomingEvents || 0,
            icon: '⏰',
            color: 'from-orange-500 to-orange-600',
            bgColor: 'from-orange-50 to-orange-100',
            change: '3 this week',
            changeType: 'neutral'
        },
        {
            title: 'Completed Events',
            value: stats.completedEvents || 0,
            icon: '✅',
            color: 'from-teal-500 to-teal-600',
            bgColor: 'from-teal-50 to-teal-100',
            change: '15 this month',
            changeType: 'neutral'
        },
        {
            title: 'New Messages',
            value: stats.newContacts || 0,
            icon: '📧',
            color: 'from-red-500 to-red-600',
            bgColor: 'from-red-50 to-red-100',
            change: 'Needs attention',
            changeType: stats.newContacts > 0 ? 'alert' : 'neutral'
        },
        {
            title: 'Total Messages',
            value: stats.totalContacts || 0,
            icon: '💬',
            color: 'from-gray-500 to-gray-600',
            bgColor: 'from-gray-50 to-gray-100',
            change: 'All time',
            changeType: 'neutral'
        },
        {
            title: 'Leadership Team',
            value: stats.totalLeadership || 0,
            icon: '👑',
            color: 'from-yellow-500 to-yellow-600',
            bgColor: 'from-yellow-50 to-yellow-100',
            change: 'Active members',
            changeType: 'neutral'
        },
        {
            title: 'Gallery Items',
            value: stats.totalGallery || 0,
            icon: '🖼️',
            color: 'from-pink-500 to-pink-600',
            bgColor: 'from-pink-50 to-pink-100',
            change: '+20 this month',
            changeType: 'increase'
        },
        {
            title: 'Resources',
            value: stats.totalResources || 0,
            icon: '📚',
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'from-indigo-50 to-indigo-100',
            change: 'Available',
            changeType: 'neutral'
        },
        {
            title: 'Downloads',
            value: stats.resourceDownloads || 0,
            icon: '⬇️',
            color: 'from-cyan-500 to-cyan-600',
            bgColor: 'from-cyan-50 to-cyan-100',
            change: '+45%',
            changeType: 'increase'
        },
        {
            title: 'Announcements',
            value: stats.totalAnnouncements || 0,
            icon: '📢',
            color: 'from-violet-500 to-violet-600',
            bgColor: 'from-violet-50 to-violet-100',
            change: '5 active',
            changeType: 'neutral'
        },
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'member': return '👤';
            case 'contact': return '📧';
            case 'event': return '📅';
            case 'resource': return '📚';
            case 'announcement': return '📢';
            default: return '📝';
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'member': return 'bg-blue-100 text-blue-600';
            case 'contact': return 'bg-red-100 text-red-600';
            case 'event': return 'bg-purple-100 text-purple-600';
            case 'resource': return 'bg-indigo-100 text-indigo-600';
            case 'announcement': return 'bg-violet-100 text-violet-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const quickActions = [
        { id: 'events', label: 'Create Event', icon: '📝', color: 'from-purple-500 to-purple-600', section: 'events' },
        { id: 'members', label: 'View Members', icon: '👥', color: 'from-blue-500 to-blue-600', section: 'members' },
        { id: 'contacts', label: 'Check Messages', icon: '📧', color: 'from-red-500 to-red-600', section: 'contacts' },
        { id: 'resources', label: 'Add Resource', icon: '📚', color: 'from-indigo-500 to-indigo-600', section: 'resources' },
        { id: 'announcements', label: 'New Announcement', icon: '📢', color: 'from-violet-500 to-violet-600', section: 'announcements' },
        { id: 'gallery', label: 'Upload Media', icon: '🖼️', color: 'from-pink-500 to-pink-600', section: 'gallery' },
    ];

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h3>
                    <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        className="group relative bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                    >
                        {/* Background gradient */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.bgColor} rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity`}></div>

                        <div className="relative">
                            {/* Icon */}
                            <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform text-2xl`}>
                                {card.icon}
                            </div>

                            {/* Value */}
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                {card.value.toLocaleString()}
                            </div>

                            {/* Title */}
                            <div className="text-sm font-medium text-gray-600 mb-3">
                                {card.title}
                            </div>

                            {/* Change indicator */}
                            {card.change && (
                                <div className={`flex items-center gap-1 text-xs font-semibold ${card.changeType === 'increase' ? 'text-green-600' :
                                        card.changeType === 'alert' ? 'text-red-600' :
                                            'text-gray-600'
                                    }`}>
                                    {card.changeType === 'increase' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    )}
                                    {card.changeType === 'alert' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    )}
                                    <span>{card.change}</span>
                                </div>
                            )}

                            {card.subtitle && (
                                <div className="text-xs text-gray-500 mt-1">{card.subtitle}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Activities - Takes 2 columns */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-bold text-gray-900">Recent Activities</h4>
                        <div className="flex gap-2">
                            {['all', 'member', 'event', 'contact'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeFilter === filter
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {recentActivities && recentActivities.length > 0 ? (
                            recentActivities
                                .filter(activity => activeFilter === 'all' || activity.type === activeFilter)
                                .map((activity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 border border-gray-200"
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                                            <span className="text-lg">{getActivityIcon(activity.type)}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-gray-900 truncate">{activity.title}</div>
                                            <div className="text-sm text-gray-600 capitalize">{activity.type}</div>
                                        </div>
                                        <div className="text-xs text-gray-500 whitespace-nowrap">
                                            {formatDate(activity.date)}
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📭</div>
                                <p className="text-gray-600">No recent activities</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions - Takes 1 column */}
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
                    <h4 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h4>
                    <div className="space-y-3">
                        {quickActions.map((action) => (
                            <button
                                key={action.id}
                                className={`w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${action.color} text-white hover:shadow-lg transition-all duration-300 hover:scale-105 group`}
                            >
                                <span className="text-2xl">{action.icon}</span>
                                <span className="font-semibold flex-1 text-left">{action.label}</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Visual Statistics Section */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-6">Performance Metrics</h4>
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Member Growth */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-semibold text-gray-700">Member Growth</span>
                            <span className="text-sm text-green-600 font-semibold">+12% this month</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min((stats.newMembers / stats.totalMembers) * 100 * 5, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-600">
                            <span>0</span>
                            <span>{stats.totalMembers} members</span>
                        </div>
                    </div>

                    {/* Event Completion Rate */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-semibold text-gray-700">Event Completion</span>
                            <span className="text-sm text-green-600 font-semibold">
                                {stats.totalEvents > 0 ? Math.round((stats.completedEvents / stats.totalEvents) * 100) : 0}% completed
                            </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000"
                                style={{ width: `${stats.totalEvents > 0 ? (stats.completedEvents / stats.totalEvents) * 100 : 0}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-600">
                            <span>{stats.completedEvents} completed</span>
                            <span>{stats.totalEvents} total</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;