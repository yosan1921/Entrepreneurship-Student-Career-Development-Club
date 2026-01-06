import React, { useState, useEffect, useCallback } from 'react';
import { announcementsAPI } from '../../services/api';

const AnnouncementsManagement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [stats, setStats] = useState({});
    const [filter, setFilter] = useState({
        status: 'all',
        visibility: 'all'
    });

    const fetchAnnouncements = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (filter.status !== 'all') params.status = filter.status;
            if (filter.visibility !== 'all') params.visibility = filter.visibility;

            const response = await announcementsAPI.getAllAdmin(params.status, params.visibility);
            if (response.data.success) {
                setAnnouncements(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await announcementsAPI.getStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();
        fetchStats();
    }, [fetchAnnouncements, fetchStats]);

    const handleCreate = async (announcementData) => {
        try {
            const response = await announcementsAPI.create(announcementData);
            if (response.data.success) {
                setShowCreateModal(false);
                fetchAnnouncements();
                fetchStats();
                alert('Announcement created successfully!');
            }
        } catch (error) {
            console.error('Create error:', error);
            alert('Error creating announcement: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = async (id, announcementData) => {
        try {
            const response = await announcementsAPI.update(id, announcementData);
            if (response.data.success) {
                setShowEditModal(false);
                setEditingAnnouncement(null);
                fetchAnnouncements();
                fetchStats();
                alert('Announcement updated successfully!');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Error updating announcement: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await announcementsAPI.delete(id);
            if (response.data.success) {
                fetchAnnouncements();
                fetchStats();
                alert('Announcement deleted successfully!');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting announcement: ' + (error.response?.data?.message || error.message));
        }
    };

    const formatDate = (dateString, options = {}) => {
        if (!dateString) return '';
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options });
    };

    const getPriorityConfig = (priority) => {
        switch (priority) {
            case 'urgent': return {
                badgeClass: 'bg-red-100 text-red-800 border-red-200',
                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
                label: 'Urgent'
            };
            case 'high': return {
                badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                label: 'High'
            };
            case 'normal': return {
                badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                label: 'Normal'
            };
            case 'low': return {
                badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
                label: 'Low'
            };
            default: return {
                badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
                icon: null,
                label: 'Normal'
            };
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-700 ring-green-600/20';
            case 'draft': return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
            case 'archived': return 'bg-gray-100 text-gray-700 ring-gray-600/20';
            default: return 'bg-gray-100 text-gray-700 ring-gray-600/20';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Announcements</h1>
                    <p className="text-gray-500 mt-1">Manage and publish updates to your community</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => {
                            fetchAnnouncements();
                            fetchStats();
                        }}
                        className="px-4 py-2.5 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 font-medium text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-sm shadow-blue-200 transition-all duration-200 flex items-center gap-2 font-medium text-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total', value: stats.total || 0, icon: '📊', color: 'blue' },
                    { label: 'Published', value: stats.published || 0, icon: '✅', color: 'green' },
                    { label: 'Drafts', value: stats.draft || 0, icon: '📝', color: 'amber' },
                    { label: 'Public', value: stats.public || 0, icon: '🌍', color: 'indigo' },
                    { label: 'Members Only', value: stats.members || 0, icon: '👥', color: 'purple' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center gap-3">
                            <span className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-${stat.color}-50`}>
                                {stat.icon}
                            </span>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Filter by:</span>
                    </div>

                    <select
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        className="form-select bg-gray-50 border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-10"
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                    </select>

                    <select
                        value={filter.visibility}
                        onChange={(e) => setFilter({ ...filter, visibility: e.target.value })}
                        className="form-select bg-gray-50 border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-10"
                    >
                        <option value="all">All Visibility</option>
                        <option value="public">Public</option>
                        <option value="members">Members Only</option>
                    </select>
                </div>
            </div>

            {/* Announcements Grid */}
            {announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No announcements found</h3>
                    <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or create a new one.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {announcements.map(announcement => {
                        const priorityConfig = getPriorityConfig(announcement.priority);

                        return (
                            <div key={announcement.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
                                {/* Card Header */}
                                <div className="p-5 pb-0 flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${getStatusConfig(announcement.status)}`}>
                                            {announcement.status}
                                        </span>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${priorityConfig.badgeClass}`}>
                                            {priorityConfig.icon}
                                            {priorityConfig.label}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap">
                                        {announcement.visibility === 'public' ? '🌍 Public' : '👥 Members'}
                                    </span>
                                </div>

                                {/* Card Content */}
                                <div className="p-5 flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {announcement.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                                        {announcement.content}
                                    </p>
                                </div>

                                {/* Card Footer */}
                                <div className="p-5 pt-0 mt-auto space-y-4">
                                    {/* Meta info */}
                                    <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-4">
                                        <div className="flex items-center gap-1.5" title="Published Date">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            {formatDate(announcement.publishDate, { year: undefined })}
                                        </div>
                                        <div className="flex items-center gap-1.5" title="Author">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            <span className="truncate max-w-[100px]">{announcement.createdByName || 'Unknown'}</span>
                                        </div>
                                        {announcement.expiryDate && (
                                            <div className="flex items-center gap-1.5 text-orange-600" title="Expires">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {formatDate(announcement.expiryDate, { year: undefined, hour: undefined, minute: undefined })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                setEditingAnnouncement(announcement);
                                                setShowEditModal(true);
                                            }}
                                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(announcement.id)}
                                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            {(showCreateModal || (showEditModal && editingAnnouncement)) && (
                <AnnouncementModal
                    title={showCreateModal ? "Create New Announcement" : "Edit Announcement"}
                    announcement={showCreateModal ? null : editingAnnouncement}
                    onClose={() => {
                        setShowCreateModal(false);
                        setShowEditModal(false);
                        setEditingAnnouncement(null);
                    }}
                    onSave={showCreateModal ? handleCreate : (data) => handleEdit(editingAnnouncement.id, data)}
                />
            )}
        </div>
    );
};

// Modernized Modal Component
const AnnouncementModal = ({ title, announcement, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: announcement?.title || '',
        content: announcement?.content || '',
        visibility: announcement?.visibility || 'public',
        priority: announcement?.priority || 'normal',
        status: announcement?.status || 'published',
        publishDate: announcement?.publishDate ? new Date(announcement.publishDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        expiryDate: announcement?.expiryDate ? new Date(announcement.expiryDate).toISOString().slice(0, 16) : ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) {
            alert('Title and content are required');
            return;
        }

        const submitData = {
            ...formData,
            publishDate: formData.publishDate || new Date().toISOString(),
            expiryDate: formData.expiryDate || null
        };
        await onSave(submitData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Annual General Meeting Updates"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Content <span className="text-red-500">*</span></label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Write the announcement details here..."
                                rows="6"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow outline-none resize-y"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Visibility</label>
                                <select
                                    value={formData.visibility}
                                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                >
                                    <option value="public">🌍 Public (Everyone)</option>
                                    <option value="members">👥 Members Only</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                >
                                    <option value="low">📝 Low</option>
                                    <option value="normal">📢 Normal</option>
                                    <option value="high">⚠️ High</option>
                                    <option value="urgent">🚨 Urgent</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                >
                                    <option value="draft">📝 Draft</option>
                                    <option value="published">✅ Published</option>
                                    <option value="archived">📦 Archived</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Publish Date</label>
                                <input
                                    type="datetime-local"
                                    value={formData.publishDate}
                                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input
                                    type="datetime-local"
                                    value={formData.expiryDate}
                                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md shadow-blue-200 transition-all transform active:scale-95"
                        >
                            {announcement ? 'Save Changes' : 'Create Announcement'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AnnouncementsManagement;