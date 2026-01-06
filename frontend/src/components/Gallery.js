import React, { useState, useEffect, useCallback } from 'react';
import { galleryAPI } from '../services/api';
import UploadButton from './UploadButton';

const Gallery = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const selectedType = 'all'; // Type filtering not currently implemented in UI
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
            // Refresh stats after a short delay to see the increment
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

    return (
        <section className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12 animate-fade-in">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Community <span className="text-[#0d47a1]">Gallery</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Explore our collection of memories from workshops, seminars, and training sessions.
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10">
                        {[
                            { label: 'Total Media', value: stats?.total || 0, color: 'blue', icon: '📊' },
                            { label: 'Photos', value: stats?.images || 0, color: 'indigo', icon: '🖼️' },
                            { label: 'Videos', value: stats?.videos || 0, color: 'purple', icon: '🎥' },
                            { label: 'Downloads', value: stats?.totalDownloads || 0, color: 'green', icon: '📥' }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="text-2xl mb-1">{stat.icon}</div>
                                <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <UploadButton
                            onUploadSuccess={() => { fetchGalleryItems(); fetchStats(); }}
                            className="shadow-lg hover:shadow-blue-500/30 transition-shadow"
                        />
                    </div>
                </div>

                {/* Filters Row */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 sticky top-24 z-30 backdrop-blur-md bg-white/90">
                    <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                        {/* Categories */}
                        <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl overflow-x-auto w-full lg:w-auto no-scrollbar">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat.id
                                        ? 'bg-white text-[#0d47a1] shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    <span>{cat.icon}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Search & Sort */}
                        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                            <div className="relative flex-1 min-w-[200px]">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                />
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="pl-4 pr-10 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm font-medium cursor-pointer"
                            >
                                {sortOptions.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Media Grid */}
                <div className="flex items-center justify-between mb-6 px-2">
                    <p className="text-gray-500 text-sm font-medium">
                        Showing <span className="text-blue-600 font-bold">{filteredAndSortedItems.length}</span> {filteredAndSortedItems.length === 1 ? 'result' : 'results'}
                        {selectedCategory !== 'all' && <span> in <span className="text-[#0d47a1]">{categories.find(c => c.id === selectedCategory)?.label}</span></span>}
                    </p>
                    {filteredAndSortedItems.length > 0 && (
                        <p className="text-gray-400 text-xs">
                            Scroll to explore our community memories
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading your memories...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAndSortedItems.map((item, idx) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer animate-fade-in"
                                style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                                {/* Media Preview */}
                                <div className="aspect-[4/3] bg-gray-200 overflow-hidden">
                                    <img
                                        src={item.mediaUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    {/* Type Badge */}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                        {item.mediaType === 'video' ? '🎥 VIDEO' : '🖼️ PHOTO'}
                                    </div>

                                    {/* Quick Actions Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                                            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform"
                                        >
                                            👁️
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                            {item.category}
                                        </span>
                                        <span className="text-gray-400 text-xs font-medium">•</span>
                                        <span className="text-gray-400 text-xs font-medium">{formatDate(item.eventDate)}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#0d47a1] transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                        {item.description}
                                    </p>
                                    <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                                        <div className="flex items-center gap-3 text-gray-400">
                                            <span className="text-xs flex items-center gap-1">📥 {item.downloadCount || 0}</span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                                            className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            DOWNLOAD
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredAndSortedItems.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="text-6xl mb-4">🏜️</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No items found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            We couldn't find any media matching your current filters or search query.
                        </p>
                    </div>
                )}
            </div>

            {/* Lightbox / Modal */}
            {selectedItem && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setSelectedItem(null)}
                >
                    <div className="absolute top-6 right-6 flex items-center gap-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDownload(selectedItem); }}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2"
                        >
                            📥 Download
                        </button>
                        <button
                            className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full text-2xl transition-all"
                            onClick={() => setSelectedItem(null)}
                        >
                            &times;
                        </button>
                    </div>

                    <div
                        className="max-w-6xl w-full flex flex-col items-center gap-8 animate-slideUp"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Media Display */}
                        <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                            {selectedItem.mediaType === 'video' ? (
                                <video
                                    src={selectedItem.mediaUrl}
                                    controls
                                    autoPlay
                                    className="w-full h-full"
                                />
                            ) : (
                                <img
                                    src={selectedItem.mediaUrl}
                                    alt={selectedItem.title}
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>

                        {/* Details */}
                        <div className="text-center text-white max-w-3xl">
                            <div className="flex items-center justify-center gap-3 mb-4 text-sm font-bold opacity-60">
                                <span>{selectedItem.category.toUpperCase()}</span>
                                <span>•</span>
                                <span>{formatDate(selectedItem.eventDate)}</span>
                            </div>
                            <h2 className="text-3xl font-extrabold mb-4 underline decoration-[#0d47a1] decoration-4 underline-offset-8">
                                {selectedItem.title}
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                {selectedItem.description}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Gallery;
