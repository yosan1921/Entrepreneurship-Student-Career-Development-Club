import React, { useState, useEffect, useCallback } from 'react';
import { leadershipAPI } from '../../services/api';

const ManageLeadership = () => {
    const [leadership, setLeadership] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLeader, setEditingLeader] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchLeadership = useCallback(async () => {
        try {
            setLoading(true);
            const response = await leadershipAPI.getAllAdmin();
            if (response.data.success) {
                setLeadership(response.data.leadership);
            }
        } catch (error) {
            console.error('Error fetching leadership:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeadership();
    }, [fetchLeadership]);

    const handleAddClick = () => {
        setEditingLeader(null);
        setShowModal(true);
    };

    const handleEditClick = (leader) => {
        setEditingLeader(leader);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this leader?')) {
            try {
                const response = await leadershipAPI.delete(id);
                if (response.data.success) {
                    fetchLeadership();
                }
            } catch (error) {
                console.error('Error deleting leader:', error);
                alert('Failed to delete leader');
            }
        }
    };

    const handleSave = async (formData) => {
        try {
            setSubmitting(true);
            let response;
            if (editingLeader) {
                response = await leadershipAPI.update(editingLeader.id, formData);
            } else {
                response = await leadershipAPI.create(formData);
            }

            if (response.data.success) {
                setShowModal(false);
                fetchLeadership();
            }
        } catch (error) {
            console.error('Error saving leader:', error);
            alert('Failed to save leader: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
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
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Leadership</h1>
                    <p className="text-gray-500 mt-1">Add and manage club leadership members</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Leader
                </button>
            </div>

            {/* Leadership Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {leadership.map(leader => (
                    <div key={leader.id} className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full relative">
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3 z-10">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-sm border ${leader.status === 'active'
                                    ? 'bg-green-50 text-green-700 border-green-100'
                                    : 'bg-gray-50 text-gray-600 border-gray-100'
                                }`}
                            >
                                {leader.status}
                            </span>
                        </div>

                        {/* Image Section */}
                        <div className="h-48 bg-gray-50 relative overflow-hidden">
                            {leader.photo ? (
                                <img
                                    src={`http://localhost:3001${leader.photo}`}
                                    alt={leader.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400" style={{ display: leader.photo ? 'none' : 'flex' }}>
                                <span className="text-4xl font-bold">{leader.name.charAt(0)}</span>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                        </div>

                        {/* Content Section */}
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{leader.name}</h3>
                                <p className="text-blue-600 font-medium text-sm mb-3">{leader.position}</p>

                                <div className="space-y-1.5">
                                    {leader.email && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            <span className="truncate">{leader.email}</span>
                                        </div>
                                    )}
                                    {leader.phone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            <span className="truncate">{leader.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                                <div className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">
                                    Order: {leader.display_order || 0}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEditClick(leader)}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(leader.id)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {leadership.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No Leaders Found</h3>
                        <p className="text-gray-500 mt-1">Get started by adding your first leadership member.</p>
                        <button onClick={handleAddClick} className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                            Add Leader
                        </button>
                    </div>
                )}
            </div>

            {showModal && (
                <LeaderModal
                    leader={editingLeader}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    submitting={submitting}
                />
            )}
        </div>
    );
};

const LeaderModal = ({ leader, onClose, onSave, submitting }) => {
    const [formData, setFormData] = useState({
        name: leader?.name || '',
        position: leader?.position || '',
        email: leader?.email || '',
        phone: leader?.phone || '',
        bio: leader?.bio || '',
        status: leader?.status || 'active',
        displayOrder: leader?.display_order || 0
    });
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(leader?.photo ? `http://localhost:3001${leader.photo}` : null);
    const [dragActive, setDragActive] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.type === 'drop' ? e.dataTransfer.files[0] : e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (photo) data.append('photo', photo);
        onSave(data);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h4 className="text-xl font-bold text-gray-900">{leader ? 'Edit Leader' : 'Add New Leader'}</h4>
                        <p className="text-sm text-gray-500 mt-1">Fill in the details for the leadership member.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Photo Upload Section */}
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <div className="w-full sm:w-1/3">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Photo</label>
                            <div
                                className={`
                                    relative aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden
                                    ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
                                `}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={(e) => { handleDrag(e); handlePhotoChange(e); }}
                                onClick={() => document.getElementById('photo-input').click()}
                            >
                                {photoPreview ? (
                                    <div className="relative w-full h-full group">
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white text-sm font-medium">Change Photo</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">Click or Drag</p>
                                        <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                                    </div>
                                )}
                                <input type="file" onChange={handlePhotoChange} accept="image/*" id="photo-input" className="hidden" />
                            </div>
                        </div>

                        <div className="w-full sm:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="col-span-full">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>

                            <div className="col-span-full">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Position *</label>
                                <input
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. President"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="+1 234 567 890"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                                <input
                                    name="displayOrder"
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Biography</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Brief description about the leader..."
                        />
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`px-6 py-2.5 rounded-lg font-medium text-white transition-all shadow-md hover:shadow-lg flex items-center gap-2
                            ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-0.5'}
                        `}
                    >
                        {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        {submitting ? 'Saving...' : 'Save Leader'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageLeadership;
