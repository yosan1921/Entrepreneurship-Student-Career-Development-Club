import React, { useState, useEffect, useCallback } from 'react';
import { galleryAPI } from '../../services/api';

const GalleryManagement = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [stats, setStats] = useState({});
    const [uploadProgress, setUploadProgress] = useState(0);

    const categories = [
        { id: 'all', label: 'All Categories', icon: '🌈' },
        { id: 'workshop', label: 'Workshops', icon: '🛠️' },
        { id: 'seminar', label: 'Seminars', icon: '📊' },
        { id: 'training', label: 'Trainings', icon: '🎓' },
        { id: 'competition', label: 'Competitions', icon: '🏆' },
        { id: 'meeting', label: 'Guest Lectures', icon: '🎤' },
        { id: 'other', label: 'Other Events', icon: '📸' }
    ];

    const mediaTypes = [
        { id: 'all', label: 'All Media', icon: '🎬' },
        { id: 'image', label: 'Images', icon: '🖼️' },
        { id: 'video', label: 'Videos', icon: '🎥' }
    ];

    const fetchGalleryItems = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedCategory !== 'all') params.category = selectedCategory;
            if (selectedType !== 'all') params.type = selectedType;

            const response = await galleryAPI.getAdminAll(params);
            if (response.data.success) {
                setGalleryItems(response.data.gallery || []);
            }
        } catch (error) {
            console.error('Error fetching gallery:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, selectedType]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await galleryAPI.getStats();
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    useEffect(() => {
        fetchGalleryItems();
        fetchStats();
    }, [fetchGalleryItems, fetchStats]);

    const handleUpload = async (formData) => {
        try {
            setUploadProgress(0);
            const response = await galleryAPI.upload(formData, {
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });

            if (response.data.success) {
                setShowUploadModal(false);
                fetchGalleryItems();
                fetchStats();
                alert('Media uploaded successfully!');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading media: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploadProgress(0);
        }
    };

    const handleEdit = async (id, data) => {
        try {
            const response = await galleryAPI.update(id, data);
            if (response.data.success) {
                setShowEditModal(false);
                setEditingItem(null);
                fetchGalleryItems();
                alert('Gallery item updated successfully!');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Error updating item: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await galleryAPI.delete(id);
            if (response.data.success) {
                fetchGalleryItems();
                fetchStats();
                alert('Gallery item deleted successfully!');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting item: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleReplaceMedia = async (id, file) => {
        try {
            const formData = new FormData();
            formData.append('media', file);

            const response = await galleryAPI.replaceMedia(id, formData);
            if (response.data.success) {
                fetchGalleryItems();
                fetchStats();
                alert('Media file replaced successfully!');
            }
        } catch (error) {
            console.error('Replace error:', error);
            alert('Error replacing media: ' + (error.response?.data?.message || error.message));
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-sans text-xs font-semibold uppercase tracking-wider">Loading dashboard items...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-premium">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-slate-100 mb-8">
                <div>
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gallery Library</h3>
                    <p className="text-slate-500 font-sans text-sm mt-1">Monitor statistics, select filters, upload, replace or remove gallery media items.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        className="flex items-center gap-2 px-5 py-3 bg-slate-950 text-white rounded-xl font-bold hover:bg-slate-900 transition-all text-xs uppercase tracking-wider hover:scale-102"
                        onClick={() => setShowUploadModal(true)}
                    >
                        📤 Upload Media
                    </button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {[
                    { label: 'Total Items', value: stats.total || 0, icon: '📊' },
                    { label: 'Active Items', value: stats.active || 0, icon: '✅' },
                    { label: 'Images', value: stats.images || 0, icon: '🖼️' },
                    { label: 'Videos', value: stats.videos || 0, icon: '🎥' },
                    { label: 'Total Disk Size', value: formatFileSize(stats.totalSize || 0), icon: '💾' }
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-premium">
                        <div className="flex justify-between items-start text-slate-400">
                            <span className="text-xs font-bold tracking-widest uppercase font-sans">{stat.label}</span>
                            <span className="text-lg">{stat.icon}</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-3">
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters Navigation Panel */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4 mb-8">
                {/* Horizontal Category Pill List */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${
                                selectedCategory === cat.id
                                    ? 'bg-slate-950 text-white shadow-premium'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <span className="mr-1.5">{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Dropdowns */}
                <div className="flex items-center gap-3 shrink-0">
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-indigo-500 text-slate-600 cursor-pointer"
                    >
                        {mediaTypes.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => {
                            fetchGalleryItems();
                            fetchStats();
                        }}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-600 transition-all hover:scale-102"
                        title="Refresh list"
                    >
                        🔄
                    </button>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {galleryItems.map(item => (
                    <div key={item.id} className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 shadow-premium hover:shadow-lg">
                        {/* Media Preview Box */}
                        <div className="aspect-[4/3] bg-slate-950 relative overflow-hidden flex items-center justify-center">
                            {item.mediaType === 'video' ? (
                                <video
                                    src={item.mediaUrl || item.imageUrl}
                                    controls={false}
                                    muted
                                    className="w-full h-full object-cover opacity-80"
                                />
                            ) : (
                                <img
                                    src={item.mediaUrl || item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-103"
                                />
                            )}
                            <div className="absolute top-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-white text-xs font-bold uppercase tracking-wider">
                                {item.mediaType === 'video' ? '🎥 Video' : '🖼️ Image'}
                            </div>

                            {/* Floating Actions Overlays on Hover */}
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                    <button
                                        className="bg-white text-slate-950 hover:bg-slate-100 px-3 py-2.5 rounded-xl font-bold transition-all hover:scale-102 flex items-center justify-center gap-1.5"
                                        onClick={() => {
                                            setEditingItem(item);
                                            setShowEditModal(true);
                                        }}
                                    >
                                        <span>✏️</span> Edit
                                    </button>
                                    <button
                                        className="bg-white text-slate-950 hover:bg-slate-100 px-3 py-2.5 rounded-xl font-bold transition-all hover:scale-102 flex items-center justify-center gap-1.5"
                                        onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.accept = 'image/*,video/*';
                                            input.onchange = (e) => {
                                                if (e.target.files[0]) {
                                                    handleReplaceMedia(item.id, e.target.files[0]);
                                                }
                                            };
                                            input.click();
                                        }}
                                    >
                                        <span>🔄</span> Swap
                                    </button>
                                    <a
                                        href={galleryAPI.download(item.id)}
                                        className="bg-indigo-600 text-white hover:bg-indigo-500 px-3 py-2.5 rounded-xl font-bold transition-all hover:scale-102 flex items-center justify-center gap-1.5"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span>📥</span> Fetch
                                    </a>
                                    <button
                                        className="bg-rose-600 text-white hover:bg-rose-500 px-3 py-2.5 rounded-xl font-bold transition-all hover:scale-102 flex items-center justify-center gap-1.5"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <span>🗑️</span> Drop
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Card metadata info */}
                        <div className="p-5 font-sans">
                            <h4 className="font-extrabold text-slate-900 text-sm tracking-tight capitalize truncate group-hover:text-indigo-600 transition-colors">
                                {item.title}
                            </h4>
                            <p className="text-slate-400 text-xs mt-1 leading-relaxed truncate">
                                {item.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center gap-2 mt-4">
                                <span className="px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-100 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                    {item.category}
                                </span>
                                <span className={`px-2 py-0.5 border rounded-md text-[9px] font-bold uppercase tracking-wider ${
                                    item.status === 'active'
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                        : 'bg-slate-100 border-slate-200 text-slate-400'
                                }`}>
                                    {item.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-5 pt-4 border-t border-slate-50">
                                <div>📅 {item.eventDate ? formatDate(item.eventDate) : 'No date'}</div>
                                <div>📥 {item.downloadCount || 0} hits</div>
                                <div className="col-span-2 truncate">👤 {item.uploadedByName || 'Unknown Uploader'}</div>
                                {item.fileSize && <div className="col-span-2">💾 {formatFileSize(item.fileSize)}</div>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State Redesign */}
            {galleryItems.length === 0 && (
                <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8 max-w-lg mx-auto shadow-premium animate-fade-in mt-10">
                    <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-premium">
                        📸
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No media files found</h3>
                    <p className="text-slate-500 font-sans text-xs max-w-xs mx-auto leading-relaxed mb-6">
                        No matches were found for the selected category filters. Start uploading to showcase the ESCDC events.
                    </p>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-5 py-2.5 bg-slate-950 text-white rounded-xl font-bold hover:bg-slate-900 transition-all text-xs uppercase tracking-wider"
                    >
                        Upload First Item
                    </button>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <UploadModal
                    onClose={() => setShowUploadModal(false)}
                    onUpload={handleUpload}
                    uploadProgress={uploadProgress}
                />
            )}

            {/* Edit Modal */}
            {showEditModal && editingItem && (
                <EditModal
                    item={editingItem}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingItem(null);
                    }}
                    onSave={handleEdit}
                />
            )}
        </div>
    );
};

// Upload Modal Component Redesign
const UploadModal = ({ onClose, onUpload, uploadProgress }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'other',
        eventDate: '',
        status: 'active'
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('Please select a file to upload');
            return;
        }
        if (!formData.title.trim()) {
            alert('Please enter a title');
            return;
        }

        setUploading(true);

        const uploadData = new FormData();
        uploadData.append('media', selectedFile);
        uploadData.append('title', formData.title);
        uploadData.append('description', formData.description);
        uploadData.append('category', formData.category);
        uploadData.append('eventDate', formData.eventDate);
        uploadData.append('status', formData.status);

        await onUpload(uploadData);
        setUploading(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-slide-up flex flex-col max-h-[90vh]">
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Upload Media</h3>
                    <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-slate-100 text-xl font-bold" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-5 bg-white font-sans text-sm">
                    {/* File Dropzone */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Media File *</label>
                        <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/10 rounded-2xl p-6 text-center cursor-pointer transition-all">
                            <input
                                type="file"
                                onChange={(e) => {
                                    setSelectedFile(e.target.files[0]);
                                    if (e.target.files[0] && !formData.title) {
                                        setFormData(prev => ({ ...prev, title: e.target.files[0].name.split('.')[0] }));
                                    }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                required
                            />
                            <div className="text-3xl mb-2">📁</div>
                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Select file or drag here</h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1">Any file type up to 100MB</p>
                        </div>
                        {selectedFile && (
                            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 justify-between">
                                <span className="truncate">📎 {selectedFile.name}</span>
                                <span className="shrink-0 text-slate-400">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            placeholder="Enter display title"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="2"
                            placeholder="Provide brief details about this event..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 resize-none"
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 cursor-pointer font-medium"
                            >
                                <option value="workshop">Workshop</option>
                                <option value="seminar">Seminar</option>
                                <option value="training">Training</option>
                                <option value="competition">Competition</option>
                                <option value="meeting">Guest Lecture</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Event Date</label>
                            <input
                                type="date"
                                value={formData.eventDate}
                                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 cursor-pointer font-medium"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {uploading && uploadProgress > 0 && (
                        <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-indigo-600">Uploading File...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-6 border-t border-slate-100 bg-white">
                        <button
                            type="button"
                            className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-xs uppercase tracking-wider"
                            onClick={onClose}
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] px-6 py-3 rounded-xl font-bold text-white bg-slate-950 hover:bg-slate-900 transition-all shadow-md hover:scale-102 disabled:opacity-50 text-xs uppercase tracking-wider"
                            disabled={uploading}
                        >
                            {uploading ? 'Processing...' : 'Upload Media'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Edit Modal Component Redesign
const EditModal = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: item.title || '',
        description: item.description || '',
        category: item.category || 'other',
        eventDate: item.eventDate || '',
        status: item.status || 'active'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(item.id, formData);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-slide-up flex flex-col max-h-[90vh]">
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Edit Gallery Details</h3>
                    <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-slate-100 text-xl font-bold" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white font-sans text-sm">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 resize-none"
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 cursor-pointer font-medium"
                            >
                                <option value="workshop">Workshop</option>
                                <option value="seminar">Seminar</option>
                                <option value="training">Training</option>
                                <option value="competition">Competition</option>
                                <option value="meeting">Guest Lecture</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Event Date</label>
                            <input
                                type="date"
                                value={formData.eventDate}
                                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 cursor-pointer font-medium"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-slate-100 bg-white">
                        <button
                            type="button"
                            className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-xs uppercase tracking-wider"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] px-6 py-3 rounded-xl font-bold text-white bg-slate-950 hover:bg-slate-900 transition-all shadow-md hover:scale-102 text-xs uppercase tracking-wider"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GalleryManagement;