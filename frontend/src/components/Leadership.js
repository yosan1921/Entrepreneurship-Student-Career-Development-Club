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
            <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-sans text-sm font-semibold uppercase tracking-wider">Loading Leadership...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-36 px-6 overflow-hidden">
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                    <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-500 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-slate-200 text-xs font-bold uppercase tracking-wider mb-6 shadow-premium">
                        <span>👥</span> Meet the Team
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight uppercase">
                        Our <span className="text-gradient">Leadership</span> Team
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-sans font-medium">
                        Dedicated specialists and visionary leaders driving the Entrepreneurship &amp; Student Career Development Club.
                    </p>

                    {isAuthenticated && hasRole(['super_admin', 'admin']) && (
                        <button
                            onClick={() => { resetForm(); setShowForm(true); }}
                            className="bg-white text-slate-950 hover:bg-slate-100 px-8 py-4 rounded-2xl font-bold shadow-xl transition-all transform active:scale-95 flex items-center gap-2 mx-auto"
                        >
                            <span className="text-lg">➕</span> Add New Leader
                        </button>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
            </div>

            {/* Team Grid */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {leadership.map(leader => (
                        <div key={leader.id} className="group relative bg-white rounded-3xl p-6 border border-slate-100 hover:border-slate-200 shadow-premium hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors"></div>

                            {/* Member Photo */}
                            <div className="relative mb-6 text-center">
                                <div className="inline-block relative">
                                    <div className="w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-slate-100 group-hover:ring-indigo-100 transition-all duration-300 shadow-sm">
                                        {leader.photo ? (
                                            <img
                                                src={leader.photo.startsWith('http') ? leader.photo : `http://localhost:3001${leader.photo}`}
                                                alt={leader.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-950 to-slate-900 flex items-center justify-center text-2xl font-extrabold text-white uppercase">
                                                {leader.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-white shadow-lg rounded-xl flex items-center justify-center text-lg animate-bounce-subtle border border-slate-100">
                                        {getPositionIcon(leader.position)}
                                    </div>
                                </div>
                            </div>

                            {/* Member Info */}
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors capitalize">
                                    {leader.name}
                                </h3>
                                <div className="inline-block px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-4 border border-slate-100 font-sans">
                                    {leader.position}
                                </div>

                                {leader.bio && (
                                    <p className="text-slate-500 text-xs mb-6 line-clamp-3 leading-relaxed font-sans">
                                        {leader.bio}
                                    </p>
                                )}

                                {/* Contact Information */}
                                <div className="flex flex-col gap-2.5 pt-5 border-t border-slate-100 items-center justify-center font-sans text-xs">
                                    {leader.email && (
                                        <a href={`mailto:${leader.email}`} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group/link font-medium">
                                            <span>📧</span>
                                            <span>{leader.email}</span>
                                        </a>
                                    )}
                                    {leader.phone && (
                                        <a href={`tel:${leader.phone}`} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group/link font-medium">
                                            <span>📞</span>
                                            <span>{leader.phone}</span>
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Admin Actions Layer */}
                            {isAuthenticated && hasRole(['super_admin', 'admin']) && (
                                <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={() => handleEdit(leader)}
                                        className="w-8 h-8 bg-white border border-slate-100 shadow-md rounded-lg flex items-center justify-center text-sm hover:bg-slate-50 transition-all hover:scale-105"
                                        title="Edit Leader"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(leader.id)}
                                        className="w-8 h-8 bg-white border border-slate-100 shadow-md rounded-lg flex items-center justify-center text-sm hover:bg-slate-50 transition-all hover:scale-105 text-rose-600"
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
                    <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl p-8 max-w-xl mx-auto shadow-premium">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 opacity-60">
                            👥
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Leaders Found</h3>
                        <p className="text-slate-500 font-sans text-sm max-w-xs mx-auto">
                            The core team members will be listed here shortly. Stay tuned!
                        </p>
                    </div>
                )}
            </div>

            {/* Modal Form Overlay */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-fade-in" onClick={resetForm}></div>

                    <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-8 py-6 bg-slate-900 flex items-center justify-between shrink-0 border-b border-slate-800 text-white">
                            <h3 className="text-xl font-bold flex items-center gap-3">
                                {editingId ? '✏️ Edit Leader Profile' : '✨ Add New Leader'}
                            </h3>
                            <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-colors text-lg">
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 bg-slate-50 flex-1">
                            {/* Photo Selection */}
                            <div className="mb-8 flex flex-col items-center justify-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="w-24 h-24 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 overflow-hidden ring-4 ring-slate-100 relative group/upload">
                                    {formData.photo ? (
                                        <img src={URL.createObjectURL(formData.photo)} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-3xl">📸</div>
                                    )}
                                </div>
                                <input type="file" name="photo" onChange={handleInputChange} accept="image/*" id="leader-photo" className="hidden" />
                                <label htmlFor="leader-photo" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-md">
                                    Select Photo
                                </label>
                                <p className="text-slate-400 text-[10px] mt-2 font-sans font-semibold">JPG, PNG or WEBP. Max 5MB</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-sans text-sm font-medium shadow-sm"
                                        placeholder="John Carter"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Position *</label>
                                    <select
                                        name="position"
                                        value={formData.position}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-sans text-sm font-medium shadow-sm"
                                    >
                                        <option value="">Choose Position</option>
                                        {positions.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Professional Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-sans text-sm font-medium shadow-sm h-28 resize-none"
                                        placeholder="A brief background of the leader..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-sans text-sm font-medium shadow-sm"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-sans text-sm font-medium shadow-sm"
                                            placeholder="+251-XXX-XXXX"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Display Priority (Order)</label>
                                        <input
                                            type="number"
                                            name="display_order"
                                            value={formData.display_order}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-sans text-sm font-medium shadow-sm"
                                            placeholder="1"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Visibility Status</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-sans text-sm font-medium shadow-sm"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="mt-8 flex gap-4 pt-6 border-t border-slate-100 shrink-0 bg-slate-50">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 bg-white hover:bg-slate-100 transition-colors border border-slate-200 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md hover:scale-102 disabled:opacity-50"
                                >
                                    {submitting ? 'Processing...' : (editingId ? 'Update Profile' : 'Add Leader')}
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
