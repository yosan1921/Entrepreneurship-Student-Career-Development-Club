import React, { useState, useEffect, useCallback, useRef } from 'react';
import { resourcesAPI } from '../../services/api';
import UploadResourceModal from '../resources/UploadResourceModal';
import EditResourceModal from '../resources/EditResourceModal';
import DeleteConfirmModal from '../resources/DeleteConfirmModal';
import ResourceFileIcon from '../resources/ResourceFileIcon';

const RESOURCE_CATEGORIES = [
    'CV & Resume Templates',
    'Internship & Job Guides',
    'Research Papers',
    'Student Handbook',
    'Scholarship Information',
    'Business Proposal Templates',
    'Training Videos',
    'Meeting Minutes',
    'Official Documents',
    'Event Materials',
    'Annual Reports',
    'E-books'
];

const ITEMS_PER_PAGE = 10;

function formatBytes(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Toast notifications
const useToast = () => {
    const [toasts, setToasts] = useState([]);
    const add = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(p => [...p, { id, message, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    }, []);
    const remove = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);
    return { toasts, add, remove };
};

const ToastContainer = ({ toasts, onRemove }) => (
    <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {toasts.map(t => (
            <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm animate-slide-up ${t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                {t.type === 'success' ? (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
                <span className="flex-1">{t.message}</span>
                <button onClick={() => onRemove(t.id)} className="opacity-70 hover:opacity-100 pointer-events-auto">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        ))}
    </div>
);

const ManageResources = () => {
    const { toasts, add: addToast, remove: removeToast } = useToast();

    const [resources, setResources] = useState([]);
    const [stats, setStats] = useState({ total_resources: 0, active_resources: 0, unpublished_resources: 0, total_downloads: 0 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('');

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [deletingResource, setDeletingResource] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [togglingId, setTogglingId] = useState(null);

    const searchTimeout = useRef(null);

    const fetchData = useCallback(async (searchVal, category, status, pageNum) => {
        setLoading(true);
        try {
            const params = {
                page: pageNum,
                limit: ITEMS_PER_PAGE,
                ...(searchVal && { search: searchVal }),
                ...(category && category !== 'All' && { category }),
                ...(status && { status })
            };
            const [resourcesRes, statsRes] = await Promise.all([
                resourcesAPI.getAllAdmin(params),
                resourcesAPI.getStats()
            ]);
            if (resourcesRes.data.success) {
                setResources(resourcesRes.data.resources || []);
                setTotal(resourcesRes.data.total || 0);
                setTotalPages(resourcesRes.data.totalPages || 1);
            }
            if (statsRes.data.success) setStats(statsRes.data.stats || {});
        } catch (err) {
            addToast('Failed to load resources', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData(search, categoryFilter, statusFilter, page);
    }, [fetchData, search, categoryFilter, statusFilter, page]);

    const handleSearchChange = (e) => {
        clearTimeout(searchTimeout.current);
        const val = e.target.value;
        searchTimeout.current = setTimeout(() => {
            setSearch(val);
            setPage(1);
        }, 400);
    };

    const handleTogglePublish = async (resource) => {
        setTogglingId(resource._id || resource.id);
        try {
            const res = await resourcesAPI.togglePublish(resource._id || resource.id);
            if (res.data.success) {
                addToast(res.data.message);
                fetchData(search, categoryFilter, statusFilter, page);
            }
        } catch (err) {
            addToast('Failed to update publish status', 'error');
        } finally {
            setTogglingId(null);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingResource) return;
        setDeleteLoading(true);
        try {
            const res = await resourcesAPI.delete(deletingResource._id || deletingResource.id);
            if (res.data.success) {
                addToast('Resource deleted successfully');
                setDeletingResource(null);
                fetchData(search, categoryFilter, statusFilter, page);
            }
        } catch (err) {
            addToast('Failed to delete resource', 'error');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleUploadSuccess = (resource, message) => {
        addToast(message || 'Resource uploaded');
        fetchData(search, categoryFilter, statusFilter, 1);
        setPage(1);
    };

    const handleEditSuccess = (resource, message) => {
        addToast(message || 'Resource updated');
        fetchData(search, categoryFilter, statusFilter, page);
    };

    const statCards = [
        {
            label: 'Total Resources', value: stats.total_resources || 0, icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            ), color: 'bg-blue-50 text-blue-600', val: 'text-blue-700'
        },
        {
            label: 'Published', value: stats.active_resources || 0, icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ), color: 'bg-emerald-50 text-emerald-600', val: 'text-emerald-700'
        },
        {
            label: 'Unpublished', value: stats.unpublished_resources || 0, icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            ), color: 'bg-amber-50 text-amber-600', val: 'text-amber-700'
        },
        {
            label: 'Total Downloads', value: (stats.total_downloads || 0).toLocaleString(), icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            ), color: 'bg-purple-50 text-purple-600', val: 'text-purple-700'
        },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Resources</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Upload and manage downloadable files for members</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-95 shadow-sm transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Resource
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                            {s.icon}
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.val}`}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by title or description…"
                        onChange={handleSearchChange}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <select
                        value={categoryFilter}
                        onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm min-w-[160px]"
                    >
                        <option value="All">All Categories</option>
                        {RESOURCE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                    >
                        <option value="">All Status</option>
                        <option value="published">Published</option>
                        <option value="unpublished">Unpublished</option>
                    </select>
                    <button
                        onClick={() => fetchData(search, categoryFilter, statusFilter, page)}
                        className="px-3 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm transition-colors"
                        title="Refresh"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-3.5 border-b border-gray-50 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        {loading ? 'Loading…' : `${total} resource${total !== 1 ? 's' : ''}`}
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                ) : resources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                            </svg>
                        </div>
                        <p className="font-semibold text-gray-700 mb-1">No resources found</p>
                        <p className="text-sm text-gray-400">Try adjusting your filters or upload a new resource.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-6 py-3.5">Resource</th>
                                    <th className="px-6 py-3.5 hidden md:table-cell">Category</th>
                                    <th className="px-6 py-3.5 hidden sm:table-cell">Size</th>
                                    <th className="px-6 py-3.5 hidden lg:table-cell">Uploaded</th>
                                    <th className="px-6 py-3.5 hidden sm:table-cell">Downloads</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {resources.map(resource => {
                                    const id = resource._id || resource.id;
                                    const isToggling = togglingId === id;
                                    return (
                                        <tr key={id} className="hover:bg-gray-50/60 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <ResourceFileIcon fileType={resource.fileType} size="sm" />
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate max-w-[200px] group-hover:text-blue-600 transition-colors">
                                                            {resource.title}
                                                        </p>
                                                        {resource.description && (
                                                            <p className="text-xs text-gray-400 truncate max-w-[200px] mt-0.5">{resource.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 truncate max-w-[140px]">
                                                    {resource.category || '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 hidden sm:table-cell text-sm text-gray-500">{formatBytes(resource.fileSize)}</td>
                                            <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-500">{formatDate(resource.createdAt)}</td>
                                            <td className="px-6 py-4 hidden sm:table-cell">
                                                <span className="text-sm font-medium text-gray-700">{(resource.downloadCount || 0).toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleTogglePublish(resource)}
                                                    disabled={isToggling}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${resource.isPublished
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                                                        : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'
                                                        } disabled:opacity-60`}
                                                >
                                                    {isToggling ? (
                                                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                                    ) : (
                                                        <span className={`w-1.5 h-1.5 rounded-full ${resource.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                    )}
                                                    {resource.isPublished ? 'Published' : 'Draft'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => setEditingResource(resource)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingResource(resource)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                const p = i + 1;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${page === p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showUploadModal && (
                <UploadResourceModal
                    categories={RESOURCE_CATEGORIES}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={handleUploadSuccess}
                />
            )}

            {editingResource && (
                <EditResourceModal
                    resource={editingResource}
                    categories={RESOURCE_CATEGORIES}
                    onClose={() => setEditingResource(null)}
                    onSuccess={handleEditSuccess}
                />
            )}

            <DeleteConfirmModal
                isOpen={!!deletingResource}
                loading={deleteLoading}
                title="Delete Resource"
                message={`Are you sure you want to delete "${deletingResource?.title}"? The file will be permanently removed.`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeletingResource(null)}
            />
        </div>
    );
};

export default ManageResources;
