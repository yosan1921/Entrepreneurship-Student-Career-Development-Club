import React, { useState, useEffect, useCallback } from 'react';
import { galleryAPI } from '../services/api';

const Gallery = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const selectedType = 'all';
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [stats, setStats] = useState({
        total: 0,
        images: 0,
        videos: 0,
        totalDownloads: 0
    });

    const categories = [
        { id: 'all', label: 'All', icon: '🌈' },
        { id: 'workshop', label: 'Workshops', icon: '🛠️' },
        { id: 'seminar', label: 'Seminars', icon: '📊' },
        { id: 'training', label: 'Trainings', icon: '🎓' },
        { id: 'competition', label: 'Competitions', icon: '🏆' },
        { id: 'meeting', label: 'Guest Lectures', icon: '🎤' },
        { id: 'other', label: 'Others', icon: '📸' }
    ];

    const sortOptions = [
        { id: 'newest', label: 'Newest First' },
        { id: 'oldest', label: 'Oldest First' },
        { id: 'downloads', label: 'Most Popular' },
        { id: 'title', label: 'A-Z' }
    ];

    const fetchGalleryItems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await galleryAPI.getAll(
                selectedCategory === 'all' ? null : selectedCategory,
                selectedType === 'all' ? null : selectedType
            );

            if (response.data.success) {
                setGalleryItems(response.data.gallery || []);
            } else {
                setGalleryItems([]);
            }
        } catch (error) {
            console.error('Error fetching gallery:', error);
            setSampleGalleryData();
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

    const setSampleGalleryData = () => {
        const sampleData = [
            {
                id: 1,
                title: 'Career Development Workshop 2024',
                description: 'Students participating in an intensive career development workshop focusing on resume building and interview skills.',
                mediaUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
                mediaType: 'image',
                category: 'workshop',
                eventDate: '2024-01-15',
                downloadCount: 15,
                createdAt: '2024-01-15T10:00:00Z'
            },
            {
                id: 2,
                title: 'Entrepreneurship Seminar Video',
                description: 'Complete recording of our entrepreneurship seminar with industry experts.',
                mediaUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop',
                mediaType: 'video',
                category: 'seminar',
                eventDate: '2024-02-10',
                downloadCount: 42,
                createdAt: '2024-02-10T14:00:00Z'
            },
            {
                id: 3,
                title: 'Leadership Training Session',
                description: 'Interactive leadership skills development session with team building activities.',
                mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop',
                mediaType: 'image',
                category: 'training',
                eventDate: '2024-02-25',
                downloadCount: 8,
                createdAt: '2024-02-25T09:00:00Z'
            }
        ];
        setGalleryItems(sampleData);
    };

    const handleDownload = async (item) => {
        try {
            const downloadUrl = galleryAPI.download(item.id);
            window.open(downloadUrl, '_blank');
            setTimeout(fetchStats, 1500);
        } catch (error) {
            console.error('Download error:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredAndSortedItems = galleryItems
        .filter(item => {
            const searchMatch = !searchTerm ||
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase());
            return searchMatch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
                case 'downloads': return (b.downloadCount || 0) - (a.downloadCount || 0);
                case 'title': return a.title.localeCompare(b.title);
                default: return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-sans text-sm font-semibold uppercase tracking-wider">Loading media items...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden py-20 sm:py-28">
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                    <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-500 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full px-4 py-2 mb-6 shadow-premium">
                            <span className="text-xl">📸</span>
                            <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">Gallery</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight uppercase tracking-tight">
                            Media <span className="text-gradient">Showcase</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-sans font-medium">
                            A curated collection of photos, videos, and highlights from ESCDC programs and guest lectures
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
            </section>

            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
                {/* Stats Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total items', value: stats.total || 0, icon: '🌈' },
                        { label: 'Images', value: stats.images || 0, icon: '🖼️' },
                        { label: 'Videos', value: stats.videos || 0, icon: '🎥' },
                        { label: 'File Hits', value: stats.totalDownloads || 0, icon: '📥' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-premium">
                            <div className="flex justify-between items-center text-slate-400">
                                <span className="text-xs font-bold tracking-widest uppercase font-sans">{stat.label}</span>
                                <span className="text-sm">{stat.icon}</span>
                            </div>
                            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-premium p-8 sm:p-12 border border-slate-100">
                    {/* Controls Bar */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-slate-100 pb-6 mb-8">
                        {/* Categories List */}
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

                        {/* Search & Sort dropdown */}
                        <div className="flex flex-wrap items-center gap-3">
                            <input
                                type="text"
                                placeholder="Search gallery items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-sans text-xs font-medium w-48 sm:w-64"
                            />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-indigo-500 text-slate-600 cursor-pointer font-sans"
                            >
                                {sortOptions.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Files Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAndSortedItems.map(item => (
                            <div
                                key={item.id}
                                className="group relative bg-white border border-slate-100 hover:border-slate-200 rounded-3xl overflow-hidden transition-all duration-300 shadow-premium hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                                onClick={() => setSelectedItem(item)}
                            >
                                {/* Media container */}
                                <div className="aspect-[4/3] bg-slate-950 overflow-hidden relative flex items-center justify-center">
                                    {item.mediaType === 'video' ? (
                                        <div className="w-full h-full relative">
                                            <video src={item.mediaUrl || item.imageUrl} className="w-full h-full object-cover opacity-80" muted />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-lg font-bold">▶</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            src={item.mediaUrl || item.imageUrl}
                                            alt={item.title}
                                            className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-103"
                                            loading="lazy"
                                        />
                                    )}
                                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[9px] font-bold text-white uppercase tracking-wider">
                                        {item.mediaType === 'video' ? '🎥 Video' : '🖼️ Image'}
                                    </div>
                                </div>

                                <div className="p-6 font-sans">
                                    <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{item.category}</span>
                                    <h4 className="font-extrabold text-slate-900 text-base tracking-tight truncate mt-1 group-hover:text-[#4F46E5] transition-colors">{item.title}</h4>
                                    <p className="text-slate-400 text-xs mt-2 leading-relaxed line-clamp-2">{item.description}</p>
                                    <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-50 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                        <span>📅 {formatDate(item.createdAt)}</span>
                                        <span>📥 {item.downloadCount || 0} Hits</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredAndSortedItems.length === 0 && (
                        <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] p-8 max-w-md mx-auto shadow-premium mt-8">
                            <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-premium">
                                📸
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No items found</h3>
                            <p className="text-slate-500 font-sans text-xs max-w-xs mx-auto leading-relaxed">
                                We couldn't find any items matching your selected filter parameters or search queries.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedItem(null)}>
                    <div className="bg-white w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 animate-slide-up flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-md">
                                {selectedItem.category}
                            </span>
                            <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-slate-100 text-xl font-bold" onClick={() => setSelectedItem(null)}>
                                &times;
                            </button>
                        </div>

                        <div className="overflow-y-auto p-8 space-y-6 font-sans">
                            <div className="aspect-[16/9] bg-slate-950 rounded-2xl overflow-hidden relative flex items-center justify-center">
                                {selectedItem.mediaType === 'video' ? (
                                    <video src={selectedItem.mediaUrl || selectedItem.imageUrl} controls className="w-full h-full object-contain" />
                                ) : (
                                    <img src={selectedItem.mediaUrl || selectedItem.imageUrl} alt={selectedItem.title} className="w-full h-full object-contain" />
                                )}
                            </div>

                            <div>
                                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight capitalize">{selectedItem.title}</h3>
                                <p className="text-slate-500 text-sm mt-3 leading-relaxed">{selectedItem.description}</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                                <div className="flex gap-4">
                                    <span>📅 Created: {formatDate(selectedItem.createdAt)}</span>
                                    <span>📥 Hits: {selectedItem.downloadCount || 0}</span>
                                </div>
                                <button
                                    onClick={() => handleDownload(selectedItem)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all hover:scale-102 uppercase tracking-wide text-[10px] shadow-lg shadow-indigo-600/10"
                                >
                                    <span>📥 Download file</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;
