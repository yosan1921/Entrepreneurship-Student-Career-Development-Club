import React, { useState, useEffect, useCallback } from 'react';
import { resourcesAPI } from '../../services/api';

const ManageResources = () => {
    const [activeTab, setActiveTab] = useState('resources');
    const [resources, setResources] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        status: '',
        featured: '',
        limit: 50,
        offset: 0
    });

    // Modal states
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);

    const tabs = [
        { id: 'resources', label: 'Resources', icon: '📚' },
        { id: 'categories', label: 'Categories', icon: '📁' },
        { id: 'analytics', label: 'Analytics', icon: '📊' },
        { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [resourcesRes, categoriesRes, tagsRes, statsRes] = await Promise.all([
                resourcesAPI.getAllAdmin(filters),
                resourcesAPI.getCategories(),
                resourcesAPI.getTags(),
                resourcesAPI.getStats()
            ]);

            if (resourcesRes.data.success) setResources(resourcesRes.data.resources || []);
            if (categoriesRes.data.success) setCategories(categoriesRes.data.categories || []);
            if (tagsRes.data.success) setTags(tagsRes.data.tags || []);
            if (statsRes.data.success) setStats(statsRes.data.stats || {});
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            offset: 0
        }));
    };

    const handleResourceAction = async (action, resourceId, data = {}) => {
        try {
            let response;
            switch (action) {
                case 'create':
                    response = await resourcesAPI.create(data);
                    break;
                case 'update':
                    response = await resourcesAPI.update(resourceId, data);
                    break;
                case 'delete':
                    if (!window.confirm('Are you sure you want to delete this resource?')) return;
                    response = await resourcesAPI.delete(resourceId);
                    break;
                case 'toggle-featured':
                    response = await resourcesAPI.update(resourceId, { featured: !data.featured });
                    break;
                case 'toggle-pinned':
                    response = await resourcesAPI.update(resourceId, { pinned: !data.pinned });
                    break;
                case 'toggle-status':
                    const newStatus = data.status === 'active' ? 'inactive' : 'active';
                    response = await resourcesAPI.update(resourceId, { status: newStatus });
                    break;
                default:
                    return;
            }

            if (response.data.success) {
                // alert(response.data.message || 'Action completed successfully!');
                fetchData();
                setShowResourceModal(false);
                setEditingResource(null);
            }
        } catch (error) {
            console.error('Error performing action:', error);
            alert('Error: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCategoryAction = async (action, categoryId, data = {}) => {
        try {
            let response;
            switch (action) {
                case 'create':
                    response = await resourcesAPI.createCategory(data);
                    break;
                case 'update':
                    response = await resourcesAPI.updateCategory(categoryId, data);
                    break;
                case 'delete':
                    if (!window.confirm('Are you sure you want to delete this category?')) return;
                    response = await resourcesAPI.deleteCategory(categoryId);
                    break;
                default:
                    return;
            }

            if (response.data.success) {
                fetchData();
                setShowCategoryModal(false);
                setEditingCategory(null);
            }
        } catch (error) {
            console.error('Error performing action:', error);
            alert('Error: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading && !resources.length) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Resources</h1>
                    <p className="text-gray-500 mt-1">Organize documents, videos, and downloads</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh
                    </button>
                    <button
                        onClick={() => {
                            setEditingResource(null);
                            setShowResourceModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Resource
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Resources', value: stats.totalResources || 0, icon: '📚', color: 'blue' },
                    { label: 'Featured', value: stats.featuredResources || 0, icon: '⭐', color: 'yellow' },
                    { label: 'Total Views', value: (stats.totalViews || 0).toLocaleString(), icon: '👁️', color: 'purple' },
                    { label: 'Total Downloads', value: (stats.totalDownloads || 0).toLocaleString(), icon: '⬇️', color: 'green' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-${stat.color}-50`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            <span className={`mr-2 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                                {tab.icon}
                            </span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'resources' && (
                    <ResourcesTab
                        resources={resources}
                        categories={categories}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onResourceAction={handleResourceAction}
                        onEditResource={(resource) => {
                            setEditingResource(resource);
                            setShowResourceModal(true);
                        }}
                    />
                )}

                {activeTab === 'categories' && (
                    <CategoriesTab
                        categories={categories}
                        onCategoryAction={handleCategoryAction}
                        onEditCategory={(category) => {
                            setEditingCategory(category);
                            setShowCategoryModal(true);
                        }}
                        onAddCategory={() => {
                            setEditingCategory(null);
                            setShowCategoryModal(true);
                        }}
                    />
                )}

                {activeTab === 'analytics' && (
                    <AnalyticsTab stats={stats} resources={resources} />
                )}

                {activeTab === 'settings' && (
                    <SettingsTab />
                )}
            </div>

            {/* Modals */}
            {showResourceModal && (
                <ResourceModal
                    resource={editingResource}
                    categories={categories}
                    tags={tags}
                    onSave={(data) => {
                        if (editingResource) {
                            handleResourceAction('update', editingResource.id, data);
                        } else {
                            handleResourceAction('create', null, data);
                        }
                    }}
                    onClose={() => {
                        setShowResourceModal(false);
                        setEditingResource(null);
                    }}
                />
            )}

            {showCategoryModal && (
                <CategoryModal
                    category={editingCategory}
                    onSave={(data) => {
                        if (editingCategory) {
                            handleCategoryAction('update', editingCategory.id, data);
                        } else {
                            handleCategoryAction('create', null, data);
                        }
                    }}
                    onClose={() => {
                        setShowCategoryModal(false);
                        setEditingCategory(null);
                    }}
                />
            )}
        </div>
    );
};

// Resources Tab Component
const ResourcesTab = ({ resources, categories, filters, onFilterChange, onResourceAction, onEditResource }) => {
    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={filters.search}
                        onChange={(e) => onFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                    <select
                        value={filters.category}
                        onChange={(e) => onFilterChange('category', e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[140px]"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-gray-600"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Resources Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                <th className="px-6 py-4 font-semibold">Resource</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold">Stats</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {resources.map(resource => (
                                <tr key={resource.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 text-lg">
                                                {resource.file_type === 'pdf' ? '📄' : resource.file_type === 'video' ? '🎥' : '📎'}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{resource.title}</div>
                                                <div className="flex gap-2 mt-1">
                                                    {resource.featured && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-800">Featured</span>}
                                                    {resource.pinned && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-800">Pinned</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                            <span>{resource.category_icon || '📁'}</span>
                                            {resource.category_name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1" title="Views">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                {resource.view_count}
                                            </div>
                                            <div className="flex items-center gap-1" title="Downloads">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" /></svg>
                                                {resource.download_count}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${resource.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            <span className="text-sm text-gray-600 capitalize">{resource.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onEditResource(resource)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                            <button onClick={() => onResourceAction('toggle-featured', resource.id, resource)} className={`p-1.5 transition-all rounded-lg ${resource.featured ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`} title="Toggle Feature">
                                                <svg className="w-4 h-4" fill={resource.featured ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                            </button>
                                            <button onClick={() => onResourceAction('delete', resource.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {resources.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No resources found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Categories Tab Component
const CategoriesTab = ({ categories, onCategoryAction, onEditCategory, onAddCategory }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Resource Categories</h3>
                <button
                    onClick={onAddCategory}
                    className="px-4 py-2 bg-white border border-dashed border-gray-300 rounded-lg text-blue-600 font-medium hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Category
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                    <div key={category.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
                        <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                            <button onClick={() => onEditCategory(category)} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                            <button onClick={() => onCategoryAction('delete', category.id)} className="p-1.5 hover:bg-red-50 rounded-md text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" /></svg></button>
                        </div>

                        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4" style={{ backgroundColor: `${category.color}20`, color: category.color || '#3b82f6' }}>
                            {category.icon || '📁'}
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-1">{category.name}</h4>
                        <p className="text-sm text-gray-500 line-clamp-2">{category.description || 'No description provided.'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Analytics Tab Component
const AnalyticsTab = ({ stats, resources }) => {
    const popularResources = [...resources]
        .sort((a, b) => (b.view_count + b.download_count) - (a.view_count + a.download_count))
        .slice(0, 5);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 mb-6">Engagement Overview</h4>
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Avg. Views per Resource</span>
                        <span className="text-xl font-bold text-gray-900">
                            {resources.length ? Math.round(stats.totalViews / resources.length) : 0}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Avg. Downloads per Resource</span>
                        <span className="text-xl font-bold text-gray-900">
                            {resources.length ? Math.round(stats.totalDownloads / resources.length) : 0}
                        </span>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800">
                            <strong>Insight:</strong> Your resources are being viewed {Math.round(stats.totalViews / (stats.totalDownloads || 1))}x more than they are downloaded.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 mb-6">Top Performing Resources</h4>
                <div className="space-y-4">
                    {popularResources.map((resource, index) => (
                        <div key={resource.id} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <span className="w-6 text-center font-bold text-gray-400">#{index + 1}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{resource.title}</p>
                                <p className="text-xs text-gray-500">{resource.category_name}</p>
                            </div>
                            <div className="flex gap-3 text-xs font-medium text-gray-600">
                                <span className="flex items-center gap-1">👁️ {resource.view_count}</span>
                                <span className="flex items-center gap-1">⬇️ {resource.download_count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Settings Tab Component (Mock)
const SettingsTab = () => (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        <h4 className="text-lg font-bold text-gray-900 mb-6">Resources Configuration</h4>
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium text-gray-900">Auto-Approve Uploads</p>
                    <p className="text-xs text-gray-500">Automatically publish resources upon upload</p>
                </div>
                <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-pointer"><div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div></div>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium text-gray-900">Max File Size</p>
                    <p className="text-xs text-gray-500">Maximum allowed size for documents</p>
                </div>
                <select className="border border-gray-300 rounded px-2 py-1 text-sm bg-white outline-none">
                    <option>10 MB</option>
                    <option>50 MB</option>
                    <option>100 MB</option>
                </select>
            </div>
        </div>
    </div>
);

// Resource Modal
const ResourceModal = ({ resource, categories, tags, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        title: resource?.title || '',
        description: resource?.description || '',
        category_id: resource?.category_id || '',
        status: resource?.status || 'active',
        featured: resource?.featured || false,
        pinned: resource?.pinned || false,
    });

    // Simplification for the example: In a real app, file handling would be more complex

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData); // In real app, FormData with file would be passed
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">{resource ? 'Edit Resource' : 'Add Resource'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><span className="text-2xl">×</span></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        ></textarea>
                    </div>

                    {!resource && (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 text-xl">☁️</div>
                            <p className="font-medium text-gray-900">Click to upload file</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, DOCX, Video (Max 50MB)</p>
                        </div>
                    )}

                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.featured}
                                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Mark as Featured</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.pinned}
                                onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Pin to Top</span>
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md transition-all">
                            {resource ? 'Save Changes' : 'Create Resource'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Category Modal
const CategoryModal = ({ category, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: category?.name || '',
        description: category?.description || '',
        icon: category?.icon || '📁',
        color: category?.color || '#3b82f6',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">{category ? 'Edit Category' : 'New Category'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><span className="text-2xl">×</span></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="2"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Icon (Emoji)</label>
                            <input
                                type="text"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-center"
                                placeholder="e.g. 📁"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Color</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-10 h-10 p-1 rounded cursor-pointer border border-gray-200"
                                />
                                <span className="text-sm text-gray-500">{formData.color}</span>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md transition-all">
                            {category ? 'Save Changes' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManageResources;