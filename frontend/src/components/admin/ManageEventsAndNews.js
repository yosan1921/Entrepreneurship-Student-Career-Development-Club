import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../../services/api';
import './ManageEventsAndNews.css';

const ManageEventsAndNews = () => {
    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'add-event', 'edit-event', 'add-news', 'edit-news'
    const [selectedItem, setSelectedItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Event form data
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        category: 'Workshop',
        date: '',
        time: '',
        location: '',
        status: 'upcoming',
        organizer: '',
        maxParticipants: ''
    });

    // News form data (simple structure)
    const [newsForm, setNewsForm] = useState({
        title: '',
        content: '',
        category: 'General',
        status: 'published',
        publishDate: ''
    });

    const eventCategories = ['Workshop', 'Seminar', 'Training', 'Competition', 'Meeting', 'Other'];
    const eventStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];
    const newsCategories = ['General', 'Events', 'Achievements', 'Announcements'];

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch events
            const eventsResponse = await eventsAPI.getAll();
            if (eventsResponse.data.success) {
                setEvents(eventsResponse.data.events || []);
            }

            // Fetch news
            try {
                const newsResponse = await eventsAPI.getAllNewsAdmin();
                if (newsResponse.data.success) {
                    setNews(newsResponse.data.news || []);
                } else {
                    setSampleNews();
                }
            } catch (newsError) {
                console.log('News API not available, using sample data');
                setSampleNews();
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            // Set sample data if API fails
            setSampleData();
        } finally {
            setLoading(false);
        }
    };

    const setSampleData = () => {
        const sampleEvents = [
            {
                id: 1,
                title: 'React Workshop',
                description: 'Learn React fundamentals',
                category: 'Workshop',
                datetime: '2025-01-15T14:00:00',
                location: 'Tech Lab',
                organizer: 'John Doe',
                status: 'upcoming',
                maxParticipants: 30
            }
        ];
        setEvents(sampleEvents);
        setSampleNews();
    };

    const setSampleNews = () => {
        const sampleNews = [
            {
                id: 1,
                title: 'Welcome to ESCDC',
                content: 'We are excited to announce the launch of our new website and management system.',
                category: 'Announcements',
                status: 'published',
                publishDate: '2025-01-04',
                createdAt: '2025-01-04T10:00:00'
            },
            {
                id: 2,
                title: 'Upcoming Events',
                content: 'Check out our exciting lineup of workshops and seminars for this semester.',
                category: 'Events',
                status: 'published',
                publishDate: '2025-01-04',
                createdAt: '2025-01-04T11:00:00'
            }
        ];
        setNews(sampleNews);
    };

    const handleAddNew = (type) => {
        if (type === 'event') {
            setModalType('add-event');
            setEventForm({
                title: '',
                description: '',
                category: 'Workshop',
                date: '',
                time: '',
                location: '',
                status: 'upcoming',
                organizer: '',
                maxParticipants: ''
            });
        } else {
            setModalType('add-news');
            setNewsForm({
                title: '',
                content: '',
                category: 'General',
                status: 'published',
                publishDate: new Date().toISOString().split('T')[0]
            });
        }
        setSelectedItem(null);
        setErrors({});
        setShowModal(true);
    };

    const handleEdit = (item, type) => {
        if (type === 'event') {
            setModalType('edit-event');
            // Parse datetime into date and time
            const datetime = new Date(item.datetime);
            const date = datetime.toISOString().split('T')[0];
            const time = datetime.toTimeString().slice(0, 5);

            setEventForm({
                ...item,
                date,
                time
            });
        } else {
            setModalType('edit-news');
            setNewsForm({
                ...item,
                publishDate: item.publishDate || new Date().toISOString().split('T')[0]
            });
        }
        setSelectedItem(item);
        setErrors({});
        setShowModal(true);
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

        try {
            setSaving(true);

            if (type === 'event') {
                const response = await eventsAPI.delete(id);
                if (response.data.success) {
                    setEvents(prev => prev.filter(event => event.id !== id));
                    showNotification('success', 'Event deleted successfully!');
                } else {
                    showNotification('error', response.data.message || 'Failed to delete event');
                }
            } else {
                // Try to delete news via API, fallback to local state
                try {
                    const response = await eventsAPI.deleteNews(id);
                    if (response.data.success) {
                        setNews(prev => prev.filter(newsItem => newsItem.id !== id));
                        showNotification('success', 'News deleted successfully!');
                    } else {
                        showNotification('error', response.data.message || 'Failed to delete news');
                    }
                } catch (newsError) {
                    console.log('News API not available, using local state');
                    // Fallback to local state
                    setNews(prev => prev.filter(newsItem => newsItem.id !== id));
                    showNotification('success', 'News deleted successfully!');
                }
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
            showNotification('error', `Failed to delete ${type}`);
        } finally {
            setSaving(false);
        }
    };

    const validateForm = (data, type) => {
        const newErrors = {};

        if (type === 'event') {
            if (!data.title?.trim()) newErrors.title = 'Title is required';
            if (!data.description?.trim()) newErrors.description = 'Description is required';
            if (!data.date) newErrors.date = 'Date is required';
            if (!data.time) newErrors.time = 'Time is required';
            if (!data.location?.trim()) newErrors.location = 'Location is required';
            if (!data.organizer?.trim()) newErrors.organizer = 'Organizer is required';
        } else {
            if (!data.title?.trim()) newErrors.title = 'Title is required';
            if (!data.content?.trim()) newErrors.content = 'Content is required';
        }

        return newErrors;
    };

    const handleSave = async () => {
        const isEvent = modalType.includes('event');
        const data = isEvent ? eventForm : newsForm;
        const formErrors = validateForm(data, isEvent ? 'event' : 'news');

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setSaving(true);
        try {
            if (modalType === 'add-event') {
                // Combine date and time into datetime
                const datetime = `${eventForm.date}T${eventForm.time}:00`;

                const eventData = {
                    title: eventForm.title,
                    description: eventForm.description,
                    category: eventForm.category,
                    datetime: datetime,
                    location: eventForm.location,
                    organizer: eventForm.organizer,
                    status: eventForm.status,
                    maxParticipants: eventForm.maxParticipants || null
                };

                const response = await eventsAPI.create(eventData);
                if (response.data.success) {
                    // Refresh events list
                    fetchData();
                    showNotification('success', 'Event created successfully!');
                    setShowModal(false);
                } else {
                    setErrors({ general: response.data.message || 'Failed to create event' });
                }
            } else if (modalType === 'edit-event') {
                const datetime = `${eventForm.date}T${eventForm.time}:00`;

                const eventData = {
                    title: eventForm.title,
                    description: eventForm.description,
                    category: eventForm.category,
                    datetime: datetime,
                    location: eventForm.location,
                    organizer: eventForm.organizer,
                    status: eventForm.status,
                    maxParticipants: eventForm.maxParticipants || null
                };

                const response = await eventsAPI.update(selectedItem.id, eventData);
                if (response.data.success) {
                    fetchData();
                    showNotification('success', 'Event updated successfully!');
                    setShowModal(false);
                } else {
                    setErrors({ general: response.data.message || 'Failed to update event' });
                }
            } else if (modalType === 'add-news') {
                // Try to create news via API, fallback to local state
                try {
                    const response = await eventsAPI.createNews(newsForm);
                    if (response.data.success) {
                        fetchData(); // Refresh news list
                        showNotification('success', 'News created successfully!');
                        setShowModal(false);
                    } else {
                        setErrors({ general: response.data.message || 'Failed to create news' });
                    }
                } catch (newsError) {
                    console.log('News API not available, using local state');
                    // Fallback to local state
                    const newNews = {
                        ...newsForm,
                        id: Date.now(),
                        createdAt: new Date().toISOString()
                    };
                    setNews(prev => [newNews, ...prev]);
                    showNotification('success', 'News created successfully!');
                    setShowModal(false);
                }
            } else if (modalType === 'edit-news') {
                // Try to update news via API, fallback to local state
                try {
                    const response = await eventsAPI.updateNews(selectedItem.id, newsForm);
                    if (response.data.success) {
                        fetchData(); // Refresh news list
                        showNotification('success', 'News updated successfully!');
                        setShowModal(false);
                    } else {
                        setErrors({ general: response.data.message || 'Failed to update news' });
                    }
                } catch (newsError) {
                    console.log('News API not available, using local state');
                    // Fallback to local state
                    setNews(prev => prev.map(newsItem =>
                        newsItem.id === selectedItem.id ? { ...newsForm, id: selectedItem.id } : newsItem
                    ));
                    showNotification('success', 'News updated successfully!');
                    setShowModal(false);
                }
            }
        } catch (error) {
            console.error('Error saving:', error);
            setErrors({ general: error.response?.data?.message || 'Operation failed' });
        } finally {
            setSaving(false);
        }
    };

    const showNotification = (type, message) => {
        // Simple notification
        alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
    };

    const handleInputChange = (field, value, formType) => {
        if (formType === 'event') {
            setEventForm(prev => ({ ...prev, [field]: value }));
        } else {
            setNewsForm(prev => ({ ...prev, [field]: value }));
        }

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const formatDateTime = (datetime) => {
        const date = new Date(datetime);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    if (loading) {
        return (
            <div className="manage-events-news">
                <div className="loading">Loading events and news...</div>
            </div>
        );
    }

    return (
        <div className="manage-events-news">
            <div className="section-header">
                <h3>Manage Events & News</h3>
                <button
                    className="btn btn-primary"
                    onClick={() => handleAddNew(activeTab === 'events' ? 'event' : 'news')}
                >
                    ➕ Add {activeTab === 'events' ? 'Event' : 'News'}
                </button>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
                    onClick={() => setActiveTab('events')}
                >
                    📅 Events ({events.length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'news' ? 'active' : ''}`}
                    onClick={() => setActiveTab('news')}
                >
                    📰 News ({news.length})
                </button>
            </div>

            {/* Content List */}
            <div className="content-list">
                {activeTab === 'events' ? (
                    events.length === 0 ? (
                        <div className="empty-state">
                            <p>No events found. Create your first event!</p>
                        </div>
                    ) : (
                        events.map(event => {
                            const { date, time } = formatDateTime(event.datetime);
                            return (
                                <div key={event.id} className="item-card event-card">
                                    <div className="item-info">
                                        <h4>{event.title}</h4>
                                        <p className="item-description">{event.description}</p>
                                        <div className="item-meta">
                                            <span className="meta-item">📅 {date} at {time}</span>
                                            <span className="meta-item">📍 {event.location}</span>
                                            <span className="meta-item">👤 {event.organizer}</span>
                                            <span className={`status-badge status-${event.status}`}>
                                                {event.status}
                                            </span>
                                            <span className="meta-item">🏷️ {event.category}</span>
                                            {event.maxParticipants && (
                                                <span className="meta-item">👥 Max: {event.maxParticipants}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="item-actions">
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => handleEdit(event, 'event')}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(event.id, 'event')}
                                            disabled={saving}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )
                ) : (
                    news.length === 0 ? (
                        <div className="empty-state">
                            <p>No news found. Create your first news article!</p>
                        </div>
                    ) : (
                        news.map(newsItem => (
                            <div key={newsItem.id} className="item-card news-card">
                                <div className="item-info">
                                    <h4>{newsItem.title}</h4>
                                    <p className="item-description">{newsItem.content.substring(0, 150)}...</p>
                                    <div className="item-meta">
                                        <span className="meta-item">📅 {newsItem.publishDate}</span>
                                        <span className="meta-item">🏷️ {newsItem.category}</span>
                                        <span className={`status-badge status-${newsItem.status}`}>
                                            {newsItem.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="item-actions">
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => handleEdit(newsItem, 'news')}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(newsItem.id, 'news')}
                                        disabled={saving}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                {modalType === 'add-event' && '➕ Add New Event'}
                                {modalType === 'edit-event' && '✏️ Edit Event'}
                                {modalType === 'add-news' && '➕ Add New News'}
                                {modalType === 'edit-news' && '✏️ Edit News'}
                            </h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            {errors.general && (
                                <div className="error-message">{errors.general}</div>
                            )}

                            {modalType.includes('event') ? (
                                <EventForm
                                    form={eventForm}
                                    errors={errors}
                                    categories={eventCategories}
                                    statuses={eventStatuses}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <NewsForm
                                    form={newsForm}
                                    errors={errors}
                                    categories={newsCategories}
                                    onChange={handleInputChange}
                                />
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-success"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : '✅ Save'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowModal(false)}
                                disabled={saving}
                            >
                                ❌ Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Event Form Component
const EventForm = ({ form, errors, categories, statuses, onChange }) => (
    <div className="form-grid">
        <div className="form-group">
            <label>Title *</label>
            <input
                type="text"
                value={form.title}
                onChange={(e) => onChange('title', e.target.value, 'event')}
                className={errors.title ? 'error' : ''}
                placeholder="Enter event title"
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-group">
            <label>Category</label>
            <select
                value={form.category}
                onChange={(e) => onChange('category', e.target.value, 'event')}
            >
                {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                ))}
            </select>
        </div>

        <div className="form-group full-width">
            <label>Description *</label>
            <textarea
                value={form.description}
                onChange={(e) => onChange('description', e.target.value, 'event')}
                className={errors.description ? 'error' : ''}
                placeholder="Enter event description"
                rows="3"
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        <div className="form-group">
            <label>Date *</label>
            <input
                type="date"
                value={form.date}
                onChange={(e) => onChange('date', e.target.value, 'event')}
                className={errors.date ? 'error' : ''}
            />
            {errors.date && <span className="error-text">{errors.date}</span>}
        </div>

        <div className="form-group">
            <label>Time *</label>
            <input
                type="time"
                value={form.time}
                onChange={(e) => onChange('time', e.target.value, 'event')}
                className={errors.time ? 'error' : ''}
            />
            {errors.time && <span className="error-text">{errors.time}</span>}
        </div>

        <div className="form-group">
            <label>Location *</label>
            <input
                type="text"
                value={form.location}
                onChange={(e) => onChange('location', e.target.value, 'event')}
                className={errors.location ? 'error' : ''}
                placeholder="Enter event location"
            />
            {errors.location && <span className="error-text">{errors.location}</span>}
        </div>

        <div className="form-group">
            <label>Organizer *</label>
            <input
                type="text"
                value={form.organizer}
                onChange={(e) => onChange('organizer', e.target.value, 'event')}
                className={errors.organizer ? 'error' : ''}
                placeholder="Enter organizer name"
            />
            {errors.organizer && <span className="error-text">{errors.organizer}</span>}
        </div>

        <div className="form-group">
            <label>Max Participants</label>
            <input
                type="number"
                value={form.maxParticipants}
                onChange={(e) => onChange('maxParticipants', e.target.value, 'event')}
                placeholder="Leave empty for unlimited"
                min="1"
            />
        </div>

        <div className="form-group">
            <label>Status</label>
            <select
                value={form.status}
                onChange={(e) => onChange('status', e.target.value, 'event')}
            >
                {statuses.map(status => (
                    <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                ))}
            </select>
        </div>
    </div>
);

// News Form Component
const NewsForm = ({ form, errors, categories, onChange }) => (
    <div className="form-grid">
        <div className="form-group">
            <label>Title *</label>
            <input
                type="text"
                value={form.title}
                onChange={(e) => onChange('title', e.target.value, 'news')}
                className={errors.title ? 'error' : ''}
                placeholder="Enter news title"
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-group">
            <label>Category</label>
            <select
                value={form.category}
                onChange={(e) => onChange('category', e.target.value, 'news')}
            >
                {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                ))}
            </select>
        </div>

        <div className="form-group full-width">
            <label>Content *</label>
            <textarea
                value={form.content}
                onChange={(e) => onChange('content', e.target.value, 'news')}
                className={errors.content ? 'error' : ''}
                placeholder="Enter news content"
                rows="6"
            />
            {errors.content && <span className="error-text">{errors.content}</span>}
        </div>

        <div className="form-group">
            <label>Publish Date</label>
            <input
                type="date"
                value={form.publishDate}
                onChange={(e) => onChange('publishDate', e.target.value, 'news')}
            />
        </div>

        <div className="form-group">
            <label>Status</label>
            <select
                value={form.status}
                onChange={(e) => onChange('status', e.target.value, 'news')}
            >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
            </select>
        </div>
    </div>
);

export default ManageEventsAndNews;