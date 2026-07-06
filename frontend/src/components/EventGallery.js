import React, { useState, useEffect, useCallback } from 'react';
import { galleryAPI } from '../services/api';
import UploadButton from './UploadButton';

const EventGallery = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        workshops: 0,
        seminars: 0,
        trainings: 0,
        competitions: 0,
        meetings: 0
    });

    const eventTypes = [
        { id: 'all', label: 'All Files', icon: '📁', description: 'Show all uploaded files' },
        { id: 'workshop', label: 'Workshops', icon: '🛠️', description: 'Files from workshop events' },
        { id: 'seminar', label: 'Seminars', icon: '📊', description: 'Files from seminar presentations' },
        { id: 'training', label: 'Trainings', icon: '🎓', description: 'Training session materials' },
        { id: 'competition', label: 'Competitions', icon: '🏆', description: 'Competition photos and videos' },
        { id: 'meeting', label: 'Guest Lectures', icon: '🎤', description: 'Guest lecture recordings and photos' }
    ];

    const fetchGalleryItems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await galleryAPI.getAll(
                selectedEvent !== 'all' ? selectedEvent : null,
                null
            );

            if (response.data.success) {
                setGalleryItems(response.data.data || []);
            } else {
                setGalleryItems([]);
            }
        } catch (error) {
            console.error('Error fetching gallery:', error);
            setGalleryItems([]);
        } finally {
            setLoading(false);
        }
    }, [selectedEvent]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await galleryAPI.getStats();
            if (response.data.success) {
                const statsData = response.data.data || response.data.stats;
                setStats({
                    total: statsData.total || 0,
                    workshops: statsData.byCategory?.find(c => c.category === 'workshop')?.count || 0,
                    seminars: statsData.byCategory?.find(c => c.category === 'seminar')?.count || 0,
                    trainings: statsData.byCategory?.find(c => c.category === 'training')?.count || 0,
                    competitions: statsData.byCategory?.find(c => c.category === 'competition')?.count || 0,
                    meetings: statsData.byCategory?.find(c => c.category === 'meeting')?.count || 0
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    useEffect(() => {
        fetchGalleryItems();
        fetchStats();
    }, [fetchGalleryItems, fetchStats]);

    const handleDownload = async (item) => {
        try {
            if (item.downloadUrl) {
                window.open(item.downloadUrl, '_blank');
            } else if (item.mediaUrl) {
                window.open(item.mediaUrl, '_blank');
            }
            setTimeout(fetchStats, 1000);
        } catch (error) {
            console.error('Download error:', error);
            alert('Error downloading file');
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Are you sure you want to delete "${item.title}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await galleryAPI.delete(item.id);
            if (response.data.success) {
                alert('File deleted successfully!');
                fetchGalleryItems();
                fetchStats();
            } else {
                alert('Error deleting file: ' + response.data.message);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting file: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleReplaceMedia = async (item) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.onchange = async (e) => {
            if (e.target.files[0]) {
                try {
                    const formData = new FormData();
                    formData.append('media', e.target.files[0]);

                    const response = await galleryAPI.replaceMedia(item.id, formData);
                    if (response.data.success) {
                        alert('File updated successfully!');
                        fetchGalleryItems();
                        fetchStats();
                    } else {
                        alert('Error updating file: ' + response.data.message);
                    }
                } catch (error) {
                    console.error('Update error:', error);
                    alert('Error updating file: ' + (error.response?.data?.message || error.message));
                }
            }
        };
        input.click();
    };

    const handleCopyLink = (item) => {
        const link = item.mediaUrl || item.imageUrl;
        if (link) {
            navigator.clipboard.writeText(link).then(() => {
                alert('Link copied to clipboard!');
            }).catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = link;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Link copied to clipboard!');
            });
        } else {
            alert('No link available for this file');
        }
    };

    const getEventCount = (eventId) => {
        switch (eventId) {
            case 'workshop': return stats.workshops;
            case 'seminar': return stats.seminars;
            case 'training': return stats.trainings;
            case 'competition': return stats.competitions;
            case 'meeting': return stats.meetings;
            case 'all': return stats.total;
            default: return 0;
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
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
            <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-sans text-sm font-semibold uppercase tracking-wider">Loading event gallery...</p>
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
                            <span className="text-xl">📁</span>
                            <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">Event Files</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight uppercase tracking-tight">
                            Event <span className="text-gradient">Gallery</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-sans font-medium">
                            Manage and view files, photos, videos, and documents associated with various club events
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
            </section>

            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
                <div className="bg-white rounded-[2.5rem] shadow-premium p-8 sm:p-12 border border-slate-100">
                    {/* Header uploads controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b border-slate-100 mb-8">
                        <div>
                            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">File Manager</h3>
                            <p className="text-slate-400 font-sans text-xs mt-1">Upload and swap files linked with specific events.</p>
                        </div>
                        <div className="shrink-0">
                            <UploadButton
                                onUploadSuccess={() => {
                                    fetchGalleryItems();
                                    fetchStats();
                                }}
                                onUploadError={(err) => console.error(err)}
                            />
                        </div>
                    </div>

                    {/* Filter buttons list */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-8 border-b border-slate-100">
                        {eventTypes.map(event => (
                            <button
                                key={event.id}
                                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${
                                    selectedEvent === event.id
                                        ? 'bg-slate-950 text-white shadow-premium'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                                }`}
                                onClick={() => setSelectedEvent(event.id)}
                                title={event.description}
                            >
                                <span className="mr-1.5">{event.icon}</span>
                                <span className="mr-1">{event.label}</span>
                                <span className="text-[9px] opacity-60">({getEventCount(event.id)})</span>
                            </button>
                        ))}
                    </div>

                    {/* Grid List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {galleryItems.map(item => (
                            <div key={item.id} className="group bg-white border border-slate-100 hover:border-slate-200 rounded-3xl overflow-hidden transition-all duration-300 shadow-premium hover:shadow-lg">
                                {/* Preview block */}
                                <div className="aspect-[16/10] bg-slate-950 relative overflow-hidden flex items-center justify-center">
                                    {item.mediaType === 'video' ? (
                                        <div className="w-full h-full relative">
                                            <video src={item.mediaUrl || item.imageUrl} className="w-full h-full object-cover opacity-80" muted />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <div className="text-white text-lg">▶</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <img src={item.mediaUrl || item.imageUrl} alt={item.title} className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-102" />
                                    )}
                                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-lg text-[9px] font-bold text-white uppercase tracking-wider">
                                        {item.mediaType === 'video' ? '🎥 Video' : '🖼️ Image'}
                                    </div>
                                </div>

                                {/* Content block */}
                                <div className="p-6 font-sans">
                                    <h4 className="font-extrabold text-slate-900 text-sm tracking-tight capitalize truncate">{item.title}</h4>
                                    <p className="text-slate-400 text-xs mt-1 leading-relaxed truncate">{item.description || 'No description.'}</p>

                                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-5 pt-4 border-t border-slate-50">
                                        <div className="truncate">📅 {formatDate(item.eventDate || item.createdAt)}</div>
                                        {item.fileSize && <div>💾 {formatFileSize(item.fileSize)}</div>}
                                        <div className="col-span-2">📥 {item.downloadCount || 0} hits</div>
                                    </div>

                                    {/* Action grid */}
                                    <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-slate-100 text-center">
                                        <button
                                            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all"
                                            onClick={() => handleDownload(item)}
                                        >
                                            📥 Download
                                        </button>
                                        <button
                                            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all"
                                            onClick={() => handleReplaceMedia(item)}
                                        >
                                            🔄 Swap
                                        </button>
                                        <button
                                            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all"
                                            onClick={() => handleCopyLink(item)}
                                        >
                                            🔗 Copy Link
                                        </button>
                                        <button
                                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-100/50 text-rose-600 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all"
                                            onClick={() => handleDelete(item)}
                                        >
                                            🗑️ Drop
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty block */}
                    {galleryItems.length === 0 && (
                        <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] p-8 max-w-md mx-auto shadow-premium mt-8">
                            <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-premium">
                                📁
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No files found</h3>
                            <p className="text-slate-500 font-sans text-xs max-w-xs mx-auto leading-relaxed">
                                No uploaded materials exist for this filter category. Try selecting another tab option above.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventGallery;