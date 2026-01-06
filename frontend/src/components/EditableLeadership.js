import React, { useState, useEffect, useCallback } from 'react';
import { leadershipAPI } from '../services/api';
import './EditableLeadership.css';

const EditableLeadership = () => {
    const [leadership, setLeadership] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedImageFile, setSelectedImageFile] = useState(null);

    // Predefined roles
    const predefinedRoles = [
        'President',
        'Vice President',
        'Secretary',
        'Networking & Professional Development',
        'Innovation & Technology',
        'Event Planning',
        'Student Career',
        'Public Relations'
    ];

    // Form data for new leader
    const [newLeader, setNewLeader] = useState({
        name: '',
        position: '',
        email: '',
        phone: '',
        bio: '',
        displayOrder: 0
    });

    // Editing form data
    const [editForm, setEditForm] = useState({});

    const fetchLeadership = useCallback(async () => {
        try {
            setLoading(true);
            const response = await leadershipAPI.getAll();

            if (response.data.success) {
                setLeadership(response.data.leadership || []);
            } else {
                // Set sample data if API fails
                setSampleLeadershipData();
            }
        } catch (error) {
            console.error('Error fetching leadership:', error);
            setSampleLeadershipData();
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeadership();
    }, [fetchLeadership]);

    const setSampleLeadershipData = () => {
        const sampleData = predefinedRoles.map((role, index) => ({
            id: index + 1,
            name: `Leader ${index + 1}`,
            position: role,
            email: `${role.toLowerCase().replace(/[^a-z]/g, '')}@escdc.com`,
            phone: `+251-911-${String(123456 + index).padStart(6, '0')}`,
            bio: `Dedicated leader responsible for ${role.toLowerCase()} activities and initiatives.`,
            displayOrder: index + 1,
            status: 'active'
        }));
        setLeadership(sampleData);
    };

    const getPositionIcon = (position) => {
        const pos = position.toLowerCase();
        if (pos.includes('president') && !pos.includes('vice')) return '👑';
        if (pos.includes('vice')) return '🎖️';
        if (pos.includes('secretary')) return '📝';
        if (pos.includes('networking')) return '🤝';
        if (pos.includes('technology') || pos.includes('innovation')) return '💻';
        if (pos.includes('event')) return '🎉';
        if (pos.includes('career')) return '🎯';
        if (pos.includes('public') || pos.includes('relations')) return '📢';
        return '👤';
    };

    const validateForm = (data) => {
        const newErrors = {};
        if (!data.name?.trim()) newErrors.name = 'Name is required';
        if (!data.position?.trim()) newErrors.position = 'Position is required';
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = 'Invalid email format';
        }
        return newErrors;
    };

    const handleEdit = (leader) => {
        setEditingId(leader.id);
        setEditForm({ ...leader });
        setErrors({});
        setImagePreview(leader.profileImage ? `${window.location.origin}${leader.profileImage}` : null);
        setSelectedImageFile(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
        setErrors({});
        setImagePreview(null);
        setSelectedImageFile(null);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, image: 'Please select a valid image file (JPEG, JPG, PNG, GIF, WEBP)' }));
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
                return;
            }

            setSelectedImageFile(file);
            setErrors(prev => ({ ...prev, image: '' }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = async (leaderId) => {
        if (!selectedImageFile) return null;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('image', selectedImageFile);

            const response = await leadershipAPI.uploadImage(leaderId, formData);
            if (response.data.success) {
                return response.data.data.imagePath;
            } else {
                setErrors(prev => ({ ...prev, image: response.data.message || 'Failed to upload image' }));
                return null;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setErrors(prev => ({ ...prev, image: error.response?.data?.message || 'Failed to upload image' }));
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const handleRemoveImage = async (leaderId) => {
        if (!window.confirm('Are you sure you want to remove this image?')) return;

        setUploadingImage(true);
        try {
            const response = await leadershipAPI.deleteImage(leaderId);
            if (response.data.success) {
                setImagePreview(null);
                setSelectedImageFile(null);
                // Update the leader in the list
                setLeadership(prev => prev.map(leader =>
                    leader.id === leaderId ? { ...leader, profileImage: null } : leader
                ));
                if (editingId === leaderId) {
                    setEditForm(prev => ({ ...prev, profileImage: null }));
                }
            } else {
                setErrors(prev => ({ ...prev, image: response.data.message || 'Failed to remove image' }));
            }
        } catch (error) {
            console.error('Error removing image:', error);
            setErrors(prev => ({ ...prev, image: error.response?.data?.message || 'Failed to remove image' }));
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSaveEdit = async () => {
        const formErrors = validateForm(editForm);
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setSaving(true);
        try {
            // First upload image if selected
            let imagePath = editForm.profileImage;
            if (selectedImageFile) {
                const uploadedImagePath = await handleImageUpload(editingId);
                if (uploadedImagePath) {
                    imagePath = uploadedImagePath;
                } else {
                    setSaving(false);
                    return; // Stop if image upload failed
                }
            }

            // Update profile data
            const response = await leadershipAPI.update(editingId, editForm);
            if (response.data.success) {
                setLeadership(prev => prev.map(leader =>
                    leader.id === editingId ? { ...leader, ...editForm, profileImage: imagePath } : leader
                ));
                setEditingId(null);
                setEditForm({});
                setErrors({});
                setImagePreview(null);
                setSelectedImageFile(null);
            } else {
                setErrors({ general: response.data.message || 'Failed to update leader' });
            }
        } catch (error) {
            console.error('Error updating leader:', error);
            setErrors({ general: error.response?.data?.message || 'Failed to update leader' });
        } finally {
            setSaving(false);
        }
    };

    const handleAddNew = () => {
        setShowAddModal(true);
        setNewLeader({
            name: '',
            position: '',
            email: '',
            phone: '',
            bio: '',
            displayOrder: leadership.length + 1
        });
        setErrors({});
        setImagePreview(null);
        setSelectedImageFile(null);
    };

    const handleSaveNew = async () => {
        const formErrors = validateForm(newLeader);
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setSaving(true);
        try {
            // First create the leader
            const response = await leadershipAPI.create(newLeader);
            if (response.data.success) {
                const newLeaderId = response.data.id;
                let imagePath = null;

                // Then upload image if selected
                if (selectedImageFile) {
                    imagePath = await handleImageUpload(newLeaderId);
                }

                const newLeaderWithId = {
                    ...newLeader,
                    id: newLeaderId,
                    status: 'active',
                    profileImage: imagePath
                };

                setLeadership(prev => [...prev, newLeaderWithId]);
                setShowAddModal(false);
                setNewLeader({
                    name: '',
                    position: '',
                    email: '',
                    phone: '',
                    bio: '',
                    displayOrder: 0
                });
                setErrors({});
                setImagePreview(null);
                setSelectedImageFile(null);
            } else {
                setErrors({ general: response.data.message || 'Failed to add leader' });
            }
        } catch (error) {
            console.error('Error adding leader:', error);
            setErrors({ general: error.response?.data?.message || 'Failed to add leader' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this leader?')) return;

        setSaving(true);
        try {
            const response = await leadershipAPI.delete(id);
            if (response.data.success) {
                setLeadership(prev => prev.filter(leader => leader.id !== id));
            } else {
                alert(response.data.message || 'Failed to delete leader');
            }
        } catch (error) {
            console.error('Error deleting leader:', error);
            alert(error.response?.data?.message || 'Failed to delete leader');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value, isEdit = false) => {
        if (isEdit) {
            setEditForm(prev => ({ ...prev, [field]: value }));
        } else {
            setNewLeader(prev => ({ ...prev, [field]: value }));
        }

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    if (loading) {
        return (
            <section className="editable-leadership">
                <h2>Leadership Team</h2>
                <div className="loading">Loading leadership team...</div>
            </section>
        );
    }

    return (
        <section className="editable-leadership">
            <div className="leadership-header">
                <div className="header-content">
                    <h2>Leadership Team</h2>
                    <p>Meet and manage the dedicated leaders driving ESCDC's mission.</p>
                </div>
                <button className="btn btn-primary add-leader-btn" onClick={handleAddNew}>
                    ➕ Add New Leader
                </button>
            </div>

            {errors.general && (
                <div className="error-message general-error">
                    {errors.general}
                </div>
            )}

            <div className="leadership-grid">
                {leadership.map(leader => (
                    <div key={leader.id} className={`leader-card ${editingId === leader.id ? 'editing' : ''}`}>
                        {editingId === leader.id ? (
                            // Edit Mode
                            <div className="edit-form">
                                <div className="form-header">
                                    <div className="position-icon">{getPositionIcon(editForm.position || leader.position)}</div>
                                    <h3>Edit Leader</h3>
                                </div>

                                {/* Image Upload Section */}
                                <div className="form-group image-upload-section">
                                    <label>Profile Image</label>
                                    <div className="image-upload-container">
                                        <div className="current-image">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Profile preview"
                                                    className="image-preview"
                                                />
                                            ) : (
                                                <div className="no-image-placeholder">
                                                    <div className="avatar-circle">
                                                        {(editForm.name || leader.name).split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="image-controls">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageSelect}
                                                id={`image-upload-${leader.id}`}
                                                style={{ display: 'none' }}
                                            />
                                            <label
                                                htmlFor={`image-upload-${leader.id}`}
                                                className="btn btn-secondary upload-btn"
                                            >
                                                📤 {imagePreview ? 'Change Image' : 'Upload Image'}
                                            </label>
                                            {imagePreview && (
                                                <button
                                                    type="button"
                                                    className="btn btn-delete remove-image-btn"
                                                    onClick={() => handleRemoveImage(leader.id)}
                                                    disabled={uploadingImage}
                                                >
                                                    🗑️ Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {errors.image && <span className="error-text">{errors.image}</span>}
                                    <small className="form-help">Supported: JPEG, JPG, PNG, GIF, WEBP (Max: 5MB)</small>
                                </div>

                                <div className="form-group">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        value={editForm.name || ''}
                                        onChange={(e) => handleInputChange('name', e.target.value, true)}
                                        className={errors.name ? 'error' : ''}
                                        placeholder="Enter full name"
                                    />
                                    {errors.name && <span className="error-text">{errors.name}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Position *</label>
                                    <select
                                        value={editForm.position || ''}
                                        onChange={(e) => handleInputChange('position', e.target.value, true)}
                                        className={errors.position ? 'error' : ''}
                                    >
                                        <option value="">Select position</option>
                                        {predefinedRoles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                    {errors.position && <span className="error-text">{errors.position}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email || ''}
                                        onChange={(e) => handleInputChange('email', e.target.value, true)}
                                        className={errors.email ? 'error' : ''}
                                        placeholder="Enter email address"
                                    />
                                    {errors.email && <span className="error-text">{errors.email}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        value={editForm.phone || ''}
                                        onChange={(e) => handleInputChange('phone', e.target.value, true)}
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Bio</label>
                                    <textarea
                                        value={editForm.bio || ''}
                                        onChange={(e) => handleInputChange('bio', e.target.value, true)}
                                        placeholder="Enter bio/description"
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Display Order</label>
                                    <input
                                        type="number"
                                        value={editForm.displayOrder || 0}
                                        onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0, true)}
                                        min="0"
                                    />
                                </div>

                                <div className="form-actions">
                                    <button
                                        className="btn btn-success"
                                        onClick={handleSaveEdit}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : '✅ Save'}
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                    >
                                        ❌ Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <>
                                <div className="leader-avatar">
                                    {leader.profileImage ? (
                                        <img
                                            src={`${window.location.origin}${leader.profileImage}`}
                                            alt={leader.name}
                                            className="leader-profile-image"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className="avatar-circle" style={leader.profileImage ? { display: 'none' } : {}}>
                                        {leader.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="position-icon">{getPositionIcon(leader.position)}</div>
                                </div>

                                <div className="leader-info">
                                    <h3 className="leader-name">{leader.name}</h3>
                                    <h4 className="leader-position">{leader.position}</h4>

                                    {leader.bio && (
                                        <p className="leader-bio">{leader.bio}</p>
                                    )}

                                    <div className="leader-contact">
                                        {leader.email && (
                                            <div className="contact-item">
                                                <span className="contact-icon">📧</span>
                                                <a href={`mailto:${leader.email}`} className="contact-link">
                                                    {leader.email}
                                                </a>
                                            </div>
                                        )}

                                        {leader.phone && (
                                            <div className="contact-item">
                                                <span className="contact-icon">📞</span>
                                                <a href={`tel:${leader.phone}`} className="contact-link">
                                                    {leader.phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="leader-actions">
                                    <button
                                        className="btn btn-edit"
                                        onClick={() => handleEdit(leader)}
                                        disabled={saving}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        className="btn btn-delete"
                                        onClick={() => handleDelete(leader.id)}
                                        disabled={saving}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {leadership.length === 0 && (
                <div className="no-leadership">
                    <div className="no-items-icon">👥</div>
                    <h3>No leadership members found</h3>
                    <p>Click "Add New Leader" to get started.</p>
                </div>
            )}

            {/* Add New Leader Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Leader</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowAddModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            {errors.general && (
                                <div className="error-message general-error">
                                    {errors.general}
                                </div>
                            )}

                            {/* Image Upload Section */}
                            <div className="form-group image-upload-section">
                                <label>Profile Image</label>
                                <div className="image-upload-container">
                                    <div className="current-image">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Profile preview"
                                                className="image-preview"
                                            />
                                        ) : (
                                            <div className="no-image-placeholder">
                                                <div className="avatar-circle">
                                                    {newLeader.name ? newLeader.name.split(' ').map(n => n[0]).join('') : '?'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="image-controls">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            id="new-leader-image-upload"
                                            style={{ display: 'none' }}
                                        />
                                        <label
                                            htmlFor="new-leader-image-upload"
                                            className="btn btn-secondary upload-btn"
                                        >
                                            📤 {imagePreview ? 'Change Image' : 'Upload Image'}
                                        </label>
                                        {imagePreview && (
                                            <button
                                                type="button"
                                                className="btn btn-delete remove-image-btn"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    setSelectedImageFile(null);
                                                }}
                                            >
                                                🗑️ Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {errors.image && <span className="error-text">{errors.image}</span>}
                                <small className="form-help">Supported: JPEG, JPG, PNG, GIF, WEBP (Max: 5MB)</small>
                            </div>

                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    value={newLeader.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={errors.name ? 'error' : ''}
                                    placeholder="Enter full name"
                                />
                                {errors.name && <span className="error-text">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label>Position *</label>
                                <select
                                    value={newLeader.position}
                                    onChange={(e) => handleInputChange('position', e.target.value)}
                                    className={errors.position ? 'error' : ''}
                                >
                                    <option value="">Select position</option>
                                    {predefinedRoles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                                {errors.position && <span className="error-text">{errors.position}</span>}
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={newLeader.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={errors.email ? 'error' : ''}
                                    placeholder="Enter email address"
                                />
                                {errors.email && <span className="error-text">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    value={newLeader.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    value={newLeader.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    placeholder="Enter bio/description"
                                    rows="4"
                                />
                            </div>

                            <div className="form-group">
                                <label>Display Order</label>
                                <input
                                    type="number"
                                    value={newLeader.displayOrder}
                                    onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-success"
                                onClick={handleSaveNew}
                                disabled={saving}
                            >
                                {saving ? 'Adding...' : '✅ Add Leader'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowAddModal(false)}
                                disabled={saving}
                            >
                                ❌ Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default EditableLeadership;