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
        {
            id: 'all',
            label: 'All Events',
            icon: '📁',
            description: 'Show all uploaded files'
        },
        {
            id: 'workshop',
            label: 'Workshops',
            icon: '🛠️',
            description: 'Files from workshop events'
        },
        {
            id: 'seminar',
            label: 'Seminars',
            icon: '📊',
            description: 'Files from seminar presentations'
        },
        {
            id: 'training',
            label: 'Trainings',
            icon: '🎓',
            description: 'Training session materials'
        },
        {
            id: 'competition',
            label: 'Competitions',
            icon: '🏆',
            description: 'Competition photos and videos'
        },
        {
            id: 'meeting',
            label: 'Guest Lectures',
            icon: '🎤',
            description: 'Guest lecture recordings and photos'
        }
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
                console.error('API returned error:', response.data.message);
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
                // For uploaded files, use the download endpoint
                window.open(item.downloadUrl, '_blank');
            } else if (item.mediaUrl) {
                // For external URLs, open in new tab
                window.open(item.mediaUrl, '_blank');
            }

            // Refresh stats after download
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

    const handleUpdate = async (item) => {
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
                // Fallback for older browsers
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
            <section className="event-gallery-section">
                <div className="gallery-header">
                    <h2>Event Gallery</h2>
                    <div className="loading">Loading files...</div>
                </div>
            </section>
        );
    }

    return (
        <section className="event-gallery-section">
            <div className="gallery-header">
                <h2>Event Gallery</h2>
                <p>Manage files by event type - photos, videos, and documents from workshops, seminars, trainings, competitions, and guest lectures.</p>

                {/* Upload Button */}
                <div className="gallery-upload-section">
                    <UploadButton
                        onUploadSuccess={(data) => {
                            console.log('Upload successful:', data);
                            fetchGalleryItems();
                            fetchStats();
                        }}
                        onUploadError={(error) => {
                            console.error('Upload error:', error);
                        }}
                        className="gallery-upload-btn"
                    />
                </div>
            </div>

            {/* Event Type Buttons */}
            <div className="event-buttons">
                {eventTypes.map(event => (
                    <button
                        key={event.id}
                        className={`event-btn ${selectedEvent === event.id ? 'active' : ''}`}
                        onClick={() => setSelectedEvent(event.id)}
                        title={event.description}
                    >
                        <span className="event-icon">{event.icon}</span>
                        <span className="event-label">{event.label}</span>
                        <span className="event-count">({getEventCount(event.id)})</span>
                    </button>
                ))}
            </div>

            {/* Current Filter Info */}
            <div className="filter-info">
                <div className="current-filter">
                    <span className="filter-icon">
                        {eventTypes.find(e => e.id === selectedEvent)?.icon}
                    </span>
                    <span className="filter-text">
                        Showing {selectedEvent === 'all' ? 'all events' : eventTypes.find(e => e.id === selectedEvent)?.label.toLowerCase()}
                    </span>
                    <span className="filter-count">
                        ({galleryItems.length} file{galleryItems.length !== 1 ? 's' : ''})
                    </span>
                </div>
            </div>

            {/* Files Grid */}
            <div className="event-files-grid">
                {galleryItems.map(item => (
                    <div key={item.id} className="event-file-card">
                        {/* File Preview */}
                        <div className="file-preview">
                            {item.mediaType === 'video' ? (
                                <div className="video-preview">
                                    <video
                                        src={item.mediaUrl || item.imageUrl}
                                        className="preview-video"
                                        muted
                                    />
                                    <div className="video-overlay">
                                        <div className="play-icon">▶️</div>
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={item.mediaUrl || item.imageUrl}
                                    alt={item.title}
                                    className="preview-image"
                                    loading="lazy"
                                />
                            )}

                            {/* File Type Badge */}
                            <div className="file-type-badge">
                                {item.mediaType === 'video' ? '🎥' : '🖼️'}
                            </div>
                        </div>

                        {/* File Info */}
                        <div className="file-info">
                            <h3 className="file-title">{item.title}</h3>
                            {item.description && (
                                <p className="file-description">{item.description}</p>
                            )}

                            <div className="file-meta">
                                <div className="meta-item">
                                    <span className="meta-icon">📅</span>
                                    <span>{formatDate(item.eventDate || item.createdAt)}</span>
                                </div>
                                {item.fileSize && (
                                    <div className="meta-item">
                                        <span className="meta-icon">💾</span>
                                        <span>{formatFileSize(item.fileSize)}</span>
                                    </div>
                                )}
                                <div className="meta-item">
                                    <span className="meta-icon">📥</span>
                                    <span>{item.downloadCount || 0} downloads</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="file-actions">
                            <button
                                className="action-btn download-btn"
                                onClick={() => handleDownload(item)}
                                title="Download file"
                            >
                                <span className="btn-icon">📥</span>
                                <span className="btn-text">Download</span>
                            </button>

                            <button
                                className="action-btn update-btn"
                                onClick={() => handleUpdate(item)}
                                title="Update/Replace file"
                            >
                                <span className="btn-icon">🔄</span>
                                <span className="btn-text">Update</span>
                            </button>

                            <button
                                className="action-btn copy-btn"
                                onClick={() => handleCopyLink(item)}
                                title="Copy file link"
                            >
                                <span className="btn-icon">🔗</span>
                                <span className="btn-text">Copy Link</span>
                            </button>

                            <button
                                className="action-btn delete-btn"
                                onClick={() => handleDelete(item)}
                                title="Delete file"
                            >
                                <span className="btn-icon">🗑️</span>
                                <span className="btn-text">Delete</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Files Message */}
            {galleryItems.length === 0 && (
                <div className="no-files">
                    <div className="no-files-icon">
                        {eventTypes.find(e => e.id === selectedEvent)?.icon}
                    </div>
                    <h3>No files found</h3>
                    <p>
                        {selectedEvent === 'all'
                            ? 'No files have been uploaded yet.'
                            : `No files found for ${eventTypes.find(e => e.id === selectedEvent)?.label.toLowerCase()}.`
                        }
                    </p>
                    <p>Upload some files to get started!</p>
                </div>
            )}
        </section>
    );
};

export default EventGallery;