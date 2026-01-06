import React, { useState, useEffect, useCallback } from 'react';
import { leadershipAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Leadership = () => {
    const [leadership, setLeadership] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        photo: null,
        bio: '',
        phone: '',
        email: '',
        display_order: '',
        status: 'active'
    });
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { isAuthenticated, hasRole } = useAuth();

    const positions = [
        'President',
        'Vice President',
        'Secretary',
        'Networking & Professional Development',
        'Innovation & Technology',
        'Event Planning',
        'Student Career',
        'Public Relations'
    ];

    const fetchLeadership = useCallback(async () => {
        try {
            setLoading(true);
            const response = await leadershipAPI.getAll();
            if (response.data.success) {
                setLeadership(response.data.leadership || []);
            } else {
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
        const sampleData = [
            { id: 1, name: 'John Doe', position: 'President', email: 'president@escdc.com', phone: '+251-911-123456', bio: 'Experienced leader with passion for entrepreneurship.', display_order: 1, status: 'active' },
            { id: 2, name: 'Jane Smith', position: 'Vice President', email: 'vp@escdc.com', phone: '+251-911-234567', bio: 'Dedicated to fostering innovation and career growth.', display_order: 2, status: 'active' }
        ];
        setLeadership(sampleData);
    };

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'file' ? files[0] : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'photo') {
                    if (formData.photo) submitData.append('photo', formData.photo);
                } else {
                    submitData.append(key === 'display_order' ? 'displayOrder' : key, formData[key] || (key === 'display_order' ? 0 : ''));
                }
            });

            let response = editingId ? await leadershipAPI.update(editingId, submitData) : await leadershipAPI.create(submitData);
            if (response.data.success) {
                resetForm();
                fetchLeadership();
                alert(editingId ? 'Updated successfully!' : 'Added successfully!');
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('Error saving leadership member.');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', position: '', photo: null, bio: '', phone: '', email: '', display_order: '', status: 'active' });
        setShowForm(false);
        setEditingId(null);
    };

    const handleEdit = (leader) => {
        setEditingId(leader.id);
        setFormData({
            name: leader.name || '',
            position: leader.position || '',
            photo: null,
            bio: leader.bio || '',
            phone: leader.phone || '',
            email: leader.email || '',
            display_order: leader.display_order || '',
            status: leader.status || 'active'
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this leader?')) {
            try {
                const response = await leadershipAPI.delete(id);
                if (response.data.success) fetchLeadership();
            } catch (error) {
                console.error('Delete error:', error);
            }
        }
    };

    const getPositionIcon = (position) => {
        const pos = position.toLowerCase();
        if (pos.includes('president')) return '👑';
        if (pos.includes('vice')) return '🎖️';
        if (pos.includes('secretary')) return '📝';
        if (pos.includes('networking')) return '🤝';
        if (pos.includes('technology')) return '💻';
        if (pos.includes('event')) return '🎉';
        if (pos.includes('career')) return '🎯';
        if (pos.includes('public')) return '📢';
        return '👤';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading Leadership Team...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-[#0d47a1] via-[#1565c0] to-[#1e88e5] pt-32 pb-40 px-6 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[60%] bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[50%] bg-blue-400/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6 animate-fade-in">
                        <span className="mr-2">👥</span> Meet the Team
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Leadership</span> Team
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed capitalize">
                        Dedicated specialists and visionary leaders driving the Entrepreneurship & Student Career Development Club.
                    </p>

                    {isAuthenticated && hasRole(['super_admin', 'admin']) && (
                        <button
                            onClick={() => { resetForm(); setShowForm(true); }}
                            className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-blue-50 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 mx-auto"
                        >
                            <span className="text-xl">➕</span> Add New Leader
                        </button>
                    )}
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
                    <svg className="relative block w-[calc(100%+1.3px)] h-[100px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-gray-50"></path>
                    </svg>
                </div>
            </div>

            {/* Team Grid */}
            <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {leadership.map(leader => (
                        <div key={leader.id} className="group relative bg-white/80 backdrop-blur-md border border-white/40 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden card-hover">
                            {/* Card Background Decoration */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>

                            {/* Member Photo */}
                            <div className="relative mb-6 text-center">
                                <div className="inline-block relative">
                                    <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-blue-500/10 group-hover:ring-blue-500/30 transition-all duration-500 shadow-lg">
                                        {leader.photo ? (
                                            <img
                                                src={leader.photo.startsWith('http') ? leader.photo : `http://localhost:3001${leader.photo}`}
                                                alt={leader.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[#0d47a1] to-blue-500 flex items-center justify-center text-3xl font-bold text-white uppercase group-hover:bg-gradient-to-tr transition-all duration-500">
                                                {leader.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-xl animate-bounce-subtle">
                                        {getPositionIcon(leader.position)}
                                    </div>
                                </div>
                            </div>

                            {/* Member Info */}
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors capitalize">
                                    {leader.name}
                                </h3>
                                <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
                                    {leader.position}
                                </div>

                                {leader.bio && (
                                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                                        {leader.bio}
                                    </p>
                                )}

                                {/* Contact Information */}
                                <div className="flex flex-col gap-3 pt-6 border-t border-gray-100 items-center justify-center">
                                    {leader.email && (
                                        <a href={`mailto:${leader.email}`} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm group/link">
                                            <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover/link:bg-blue-50 transition-colors">📧</span>
                                            {leader.email}
                                        </a>
                                    )}
                                    {leader.phone && (
                                        <a href={`tel:${leader.phone}`} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm group/link">
                                            <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover/link:bg-blue-50 transition-colors">📞</span>
                                            {leader.phone}
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Admin Actions Layer */}
                            {isAuthenticated && hasRole(['super_admin', 'admin']) && (
                                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                                    <button
                                        onClick={() => handleEdit(leader)}
                                        className="w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                                        title="Edit Leader"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(leader.id)}
                                        className="w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"
                                        title="Delete Leader"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {leadership.length === 0 && (
                    <div className="text-center py-20 animate-fade-in">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 grayscale opacity-50">
                            👥
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Leaders Found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            The collective brilliance of our team will be showcased here shortly. Stay tuned!
                        </p>
                    </div>
                )}
            </div>

            {/* Modal Form Overlay */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-[#0d47a1]/40 backdrop-blur-sm animate-fade-in" onClick={resetForm}></div>

                    <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-10 py-8 bg-gradient-to-r from-[#0d47a1] to-blue-600 flex items-center justify-between shrink-0">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                {editingId ? '✏️ Edit Profile' : '✨ Add New Leader'}
                            </h3>
                            <button onClick={resetForm} className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-xl">
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="overflow-y-auto p-10 bg-gray-50 flex-1">
                            {/* Photo Selection */}
                            <div className="mb-10 flex flex-col items-center justify-center bg-white p-8 rounded-3xl border-2 border-dashed border-blue-100">
                                <div className="w-32 h-32 rounded-3xl bg-blue-50 flex items-center justify-center mb-6 overflow-hidden ring-4 ring-blue-500/5 relative group/upload">
                                    {(formData.photo || editingId) ? (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity z-10">
                                            <p className="text-white text-xs font-bold">Change Photo</p>
                                        </div>
                                    ) : null}
                                    {formData.photo ? (
                                        <img src={URL.createObjectURL(formData.photo)} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-4xl">📸</div>
                                    )}
                                </div>
                                <input type="file" name="photo" onChange={handleInputChange} accept="image/*" id="leader-photo" className="hidden" />
                                <label htmlFor="leader-photo" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                                    Select Image
                                </label>
                                <p className="text-gray-400 text-xs mt-3">JPG, PNG or WEBP. Max 5MB</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-medium"
                                        placeholder="John Carter"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Position *</label>
                                    <select
                                        name="position"
                                        value={formData.position}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-medium appearance-none"
                                    >
                                        <option value="">Choose Position</option>
                                        {positions.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Professional Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-medium h-32 resize-none"
                                        placeholder="A brief background of the leader..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-medium"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-medium"
                                            placeholder="+251-XXX-XXXX"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Display Priority (Order)</label>
                                        <input
                                            type="number"
                                            name="display_order"
                                            value={formData.display_order}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-medium"
                                            placeholder="1"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Visibility Status</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-medium appearance-none"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer (Inside Form to be sticky if needed) */}
                            <div className="mt-12 flex gap-4 pt-8 border-t border-gray-100 shrink-0 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-8 py-4 rounded-2xl font-bold text-gray-500 bg-white hover:bg-gray-100 transition-colors border border-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] px-8 py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-95 disabled:opacity-50"
                                >
                                    {submitting ? 'Processing...' : (editingId ? 'Update Profile' : 'Confirm New Leader')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leadership;
