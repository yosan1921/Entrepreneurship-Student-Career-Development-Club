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
        { id: 'all', label: 'All Categories', icon: '🖼️' },
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
        if (bytes === 0) return '0 Bytes';
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
        return <div className="loading">Loading gallery management...</div>;
    }

    return (
        <div className="gallery-management">
            <div className="section-header">
                <h3>Gallery Management</h3>
                <div className="header-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowUploadModal(true)}
                    >
                        📤 Upload Media
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            fetchGalleryItems();
                            fetchStats();
                        }}
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Statistics */}
            <div className="gallery-stats">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.total || 0}</div>
                            <div className="stat-title">Total Items</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.active || 0}</div>
                            <div className="stat-title">Active Items</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🖼️</div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.images || 0}</div>
                            <div className="stat-title">Images</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎥</div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.videos || 0}</div>
                            <div className="stat-title">Videos</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💾</div>
                        <div className="stat-info">
                            <div className="stat-value">{formatFileSize(stats.totalSize || 0)}</div>
                            <div className="stat-title">Total Size</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <label>Category:</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="sort-select"
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Media Type:</label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="sort-select"
                    >
                        {mediaTypes.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="admin-gallery-grid">
                {galleryItems.map(item => (
                    <div key={item.id} className="admin-gallery-item">
                        <div className="gallery-media">
                            {item.mediaType === 'video' ? (
                                <video
                                    src={item.mediaUrl || item.imageUrl}
                                    controls={false}
                                    muted
                                    className="media-preview"
                                />
                            ) : (
                                <img
                                    src={item.mediaUrl || item.imageUrl}
                                    alt={item.title}
                                    className="media-preview"
                                />
                            )}
                            <div className="media-overlay">
                                <div className="media-type">
                                    {item.mediaType === 'video' ? '🎥' : '🖼️'}
                                </div>
                                <div className="flex flex-wrap gap-2 justify-end">
                                    {/* Edit Button */}
                                    <button
                                        className="group flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                                        onClick={() => {
                                            setEditingItem(item);
                                            setShowEditModal(true);
                                        }}
                                        title="Edit details"
                                    >
                                        <span className="text-sm">✏️</span>
                                        <span>Edit</span>
                                    </button>

                                    {/* Replace Media Button */}
                                    <button
                                        className="group flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-semibold hover:bg-purple-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
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
                                        title="Replace media file"
                                    >
                                        <span className="text-sm">🔄</span>
                                        <span>Replace</span>
                                    </button>

                                    {/* Download Button */}
                                    <a
                                        href={galleryAPI.download(item.id)}
                                        className="group flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                                        title="Download media"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span className="text-sm">📥</span>
                                        <span>Download</span>
                                    </a>

                                    {/* Delete Button */}
                                    <button
                                        className="group flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                                        onClick={() => handleDelete(item.id)}
                                        title="Delete permanently"
                                    >
                                        <span className="text-sm">🗑️</span>
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="gallery-info">
                            <h4>{item.title}</h4>
                            <p className="gallery-description">{item.description}</p>
                            <div className="gallery-meta">
                                <span className="category-badge">{item.category}</span>
                                <span className="status-badge status-{item.status}">{item.status}</span>
                            </div>
                            <div className="gallery-details">
                                <div>📅 {item.eventDate ? formatDate(item.eventDate) : 'No date'}</div>
                                <div>👤 {item.uploadedByName || 'Unknown'}</div>
                                {item.fileSize && <div>💾 {formatFileSize(item.fileSize)}</div>}
                                <div>📊 {item.downloadCount || 0} downloads</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {galleryItems.length === 0 && (
                <div className="no-results">
                    <div className="no-items-icon">📸</div>
                    <h3>No gallery items found</h3>
                    <p>Upload some media files to get started!</p>
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

// Upload Modal Component
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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Upload Media</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="upload-form">
                    <div className="form-group">
                        <label>Media File *</label>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            required
                        />
                        {selectedFile && (
                            <div className="file-info">
                                <span>📎 {selectedFile.name}</span>
                                <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="workshop">Workshop</option>
                                <option value="seminar">Seminar</option>
                                <option value="training">Training</option>
                                <option value="competition">Competition</option>
                                <option value="meeting">Guest Lecture</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Event Date</label>
                            <input
                                type="date"
                                value={formData.eventDate}
                                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {uploading && uploadProgress > 0 && (
                        <div className="upload-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <span>{uploadProgress}%</span>
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload Media'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Edit Modal Component
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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Edit Gallery Item</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-group">
                        <label>Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="workshop">Workshop</option>
                                <option value="seminar">Seminar</option>
                                <option value="training">Training</option>
                                <option value="competition">Competition</option>
                                <option value="meeting">Guest Lecture</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Event Date</label>
                            <input
                                type="date"
                                value={formData.eventDate}
                                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
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