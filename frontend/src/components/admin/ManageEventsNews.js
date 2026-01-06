import React, { useState, useEffect, useCallback } from 'react';
import { eventsAPI } from '../../services/api';
import { combineDateAndTime, toMySQLDateTime, isDateTimeInPast } from '../../utils/dateTimeUtils';
import { parseDateTimeString } from '../../utils/dateUtils';
import './ManageEventsNews.css';

const ManageEventsNews = () => {
    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'add-event', 'edit-event', 'add-news', 'edit-news'
    const [selectedItem, setSelectedItem] = useState(null);
    const [saving, setSaving] = useState(false);
    // Emergency fix: Clear errors state completely
    const [errors, setErrors] = useState({});

    // Force clear errors when component mounts
    useEffect(() => {
        setErrors({});
    }, []);
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        search: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Event form data
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        category: '',
        date: '',
        time: '',
        location: '',
        status: 'upcoming',
        organizer: '',
        maxParticipants: '',
        registrationDeadline: '',
        attachments: []
    });

    // News form data
    const [newsForm, setNewsForm] = useState({
        title: '',
        content: '',
        category: '',
        tags: '',
        status: 'draft',
        publishDate: '',
        featuredImage: null,
        excerpt: ''
    });

    const eventTypes = [
        'Workshop',
        'Training',
        'Seminar',
        'Competition',
        'Guest Lecture',
        'Other'
    ];

    const eventStatuses = [
        'upcoming',
        'ongoing',
        'completed',
        'cancelled'
    ];

    const newsCategories = [
        'General',
        'Events',
        'Achievements',
        'Announcements',
        'Updates'
    ];

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            // Check if user is authenticated
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.warn('No auth token found, using sample data');
                setSampleData();
                return;
            }

            const [eventsRes, newsRes] = await Promise.all([
                eventsAPI.getAll(),
                eventsAPI.getAllNewsAdmin() // Use admin endpoint to get all news including drafts
            ]);

            if (eventsRes.data.success) {
                setEvents(eventsRes.data.events || []);
            }
            if (newsRes.data.success) {
                setNews(newsRes.data.news || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);

            // If it's an authentication error, redirect to login
            if (error.response?.status === 401) {
                console.warn('Authentication failed, redirecting to login');
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                // You might want to redirect to login page here
                // window.location.href = '/login';
            }

            // Set sample data for development
            setSampleData();
        } finally {
            setLoading(false);
        }
    }, []);

    const setSampleData = () => {
        const sampleEvents = [
            {
                id: 1,
                title: 'Entrepreneurship Workshop',
                description: 'Learn the basics of starting your own business',
                category: 'Workshop',
                date: '2024-02-15',
                time: '10:00',
                location: 'Main Auditorium',
                status: 'upcoming',
                organizer: 'ESCDC Team',
                maxParticipants: 50,
                registrationDeadline: '2024-02-10',
                registrations: 25
            },
            {
                id: 2,
                title: 'Career Development Seminar',
                description: 'Professional development and career guidance',
                category: 'Seminar',
                date: '2024-02-20',
                time: '14:00',
                location: 'Conference Hall',
                status: 'upcoming',
                organizer: 'Career Services',
                maxParticipants: 100,
                registrationDeadline: '2024-02-18',
                registrations: 45
            }
        ];

        const sampleNews = [
            {
                id: 1,
                title: 'ESCDC Wins Innovation Award',
                content: 'Our club has been recognized for outstanding innovation in student development...',
                category: 'Achievements',
                tags: 'award, innovation, recognition',
                status: 'published',
                publishDate: '2024-01-15',
                excerpt: 'ESCDC receives prestigious innovation award for student development programs.',
                views: 150
            },
            {
                id: 2,
                title: 'New Partnership with Tech Companies',
                content: 'We are excited to announce new partnerships with leading technology companies...',
                category: 'Announcements',
                tags: 'partnership, technology, opportunities',
                status: 'published',
                publishDate: '2024-01-20',
                excerpt: 'Strategic partnerships open new opportunities for students.',
                views: 89
            }
        ];

        setEvents(sampleEvents);
        setNews(sampleNews);
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Clear errors when modal type changes
    useEffect(() => {
        if (showModal) {
            console.log('🔧 Modal opened, clearing errors');
            setErrors({});
        }
    }, [showModal, modalType]);

    const handleAddNew = (type) => {
        console.log('🔧 Opening modal for:', type);

        if (type === 'event') {
            setModalType('add-event');
            setEventForm({
                title: '',
                description: '',
                category: '',
                date: '',
                time: '',
                location: '',
                status: 'upcoming',
                organizer: '',
                maxParticipants: '',
                registrationDeadline: '',
                attachments: []
            });
        } else {
            setModalType('add-news');
            setNewsForm({
                title: '',
                content: '',
                category: '',
                tags: '',
                status: 'draft',
                publishDate: '',
                featuredImage: null,
                excerpt: ''
            });
        }
        setSelectedItem(null);

        // Clear all errors when opening modal
        setErrors({});
        console.log('🔧 Errors cleared');

        setShowModal(true);
    };

    const handleEdit = (item, type) => {
        if (type === 'event') {
            setModalType('edit-event');
            const { date, time } = parseDateTimeString(item.datetime);
            setEventForm({
                ...item,
                date,
                time
            });
        } else {
            setModalType('edit-news');
            setNewsForm({
                ...item,
                publishDate: item.publishDate ? item.publishDate.split('T')[0] : ''
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
            const response = type === 'event'
                ? await eventsAPI.delete(id)
                : await eventsAPI.deleteNews(id);

            if (response.data.success) {
                if (type === 'event') {
                    setEvents(prev => prev.filter(event => event.id !== id));
                } else {
                    setNews(prev => prev.filter(newsItem => newsItem.id !== id));
                }
                showNotification('success', `${type} deleted successfully!`);
            } else {
                showNotification('error', response.data.message || `Failed to delete ${type}`);
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
            showNotification('error', error.response?.data?.message || `Failed to delete ${type}`);
        } finally {
            setSaving(false);
        }
    };

    const validateForm = (data, type) => {
        const newErrors = {};

        if (type === 'event') {
            if (!data.title?.trim()) newErrors.title = 'Title is required';
            if (!data.description?.trim()) newErrors.description = 'Description is required';
            if (!data.category) newErrors.category = 'Category is required';
            if (!data.date) newErrors.date = 'Date is required';
            if (!data.time) newErrors.time = 'Time is required';
            if (!data.location?.trim()) newErrors.location = 'Location is required';
            if (!data.organizer?.trim()) newErrors.organizer = 'Organizer is required';

            // TEMPORARILY DISABLED: Let backend handle date validation
            // Frontend date validation was causing issues with timezone handling
            console.log('📅 Frontend validation - Date:', data.date, 'Time:', data.time);

        } else {
            if (!data.title?.trim()) newErrors.title = 'Title is required';
            if (!data.content?.trim()) newErrors.content = 'Content is required';
            if (!data.category) newErrors.category = 'Category is required';
            if (!data.excerpt?.trim()) newErrors.excerpt = 'Excerpt is required';
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
            let response;

            if (modalType === 'add-event') {
                console.log('📅 Raw form data before processing:', eventForm);

                // Validate required fields before processing
                if (!eventForm.title || !eventForm.date || !eventForm.time) {
                    setErrors({
                        general: 'Please fill in all required fields',
                        title: !eventForm.title ? 'Title is required' : '',
                        date: !eventForm.date ? 'Date is required' : '',
                        time: !eventForm.time ? 'Time is required' : ''
                    });
                    return;
                }

                // PROPER DATE/TIME COMBINATION - NO TIMEZONE CONVERSION
                // Input: date = "2025-12-27", time = "16:32"
                // Output: datetime = "2025-12-27T16:32:00" (ISO format, local timezone)

                const datetime = `${eventForm.date}T${eventForm.time}:00`;

                console.log('📅 Input date:', eventForm.date);
                console.log('📅 Input time:', eventForm.time);
                console.log('📅 Combined datetime (ISO):', datetime);

                // Verify the datetime is valid
                const testDate = new Date(datetime);
                if (isNaN(testDate.getTime())) {
                    setErrors({ general: 'Invalid date or time format' });
                    return;
                }

                console.log('📅 Parsed as Date object:', testDate);
                console.log('📅 Is future date?', testDate > new Date());

                const eventData = {
                    title: eventForm.title,
                    description: eventForm.description,
                    category: eventForm.category,
                    datetime: datetime, // Send ISO format: YYYY-MM-DDTHH:MM:SS
                    location: eventForm.location,
                    organizer: eventForm.organizer,
                    status: eventForm.status,
                    maxParticipants: eventForm.maxParticipants,
                    registrationDeadline: eventForm.registrationDeadline
                };

                console.log('📅 Final event data being sent:', eventData);

                response = await eventsAPI.create(eventData);
                if (response.data.success) {
                    setEvents(prev => [...prev, { ...eventForm, id: response.data.id }]);
                    showNotification('success', 'Event created successfully!');
                }
            } else if (modalType === 'edit-event') {
                console.log('📅 Raw form data before processing (edit):', eventForm);

                // Validate required fields before processing
                if (!eventForm.title || !eventForm.date || !eventForm.time) {
                    setErrors({
                        general: 'Please fill in all required fields',
                        title: !eventForm.title ? 'Title is required' : '',
                        date: !eventForm.date ? 'Date is required' : '',
                        time: !eventForm.time ? 'Time is required' : ''
                    });
                    return;
                }

                // PROPER DATE/TIME COMBINATION FOR EDIT
                const datetime = `${eventForm.date}T${eventForm.time}:00`;

                console.log('📅 Edit - Combined datetime (ISO):', datetime);

                const eventData = {
                    title: eventForm.title,
                    description: eventForm.description,
                    category: eventForm.category,
                    datetime: datetime,
                    location: eventForm.location,
                    organizer: eventForm.organizer,
                    status: eventForm.status,
                    maxParticipants: eventForm.maxParticipants,
                    registrationDeadline: eventForm.registrationDeadline
                };

                console.log('📅 Final edit data being sent:', eventData);

                response = await eventsAPI.update(selectedItem.id, eventData);
                if (response.data.success) {
                    setEvents(prev => prev.map(event =>
                        event.id === selectedItem.id ? { ...eventForm, id: selectedItem.id } : event
                    ));
                    showNotification('success', 'Event updated successfully!');
                }
            } else if (modalType === 'add-news') {
                response = await eventsAPI.createNews(newsForm);
                if (response.data.success) {
                    setNews(prev => [...prev, { ...newsForm, id: response.data.id }]);
                    showNotification('success', 'News created successfully!');
                }
            } else if (modalType === 'edit-news') {
                response = await eventsAPI.updateNews(selectedItem.id, newsForm);
                if (response.data.success) {
                    setNews(prev => prev.map(newsItem =>
                        newsItem.id === selectedItem.id ? { ...newsForm, id: selectedItem.id } : newsItem
                    ));
                    showNotification('success', 'News updated successfully!');
                }
            }

            if (response.data.success) {
                setShowModal(false);
                setErrors({});
            } else {
                setErrors({ general: response.data.message || 'Operation failed' });
            }
        } catch (error) {
            console.error('Error saving:', error);
            setErrors({ general: error.response?.data?.message || 'Operation failed' });
        } finally {
            setSaving(false);
        }
    };

    const showNotification = (type, message) => {
        // Simple notification - you can enhance this with a proper notification system
        if (type === 'success') {
            alert(`✅ ${message}`);
        } else {
            alert(`❌ ${message}`);
        }
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

        // Clear date error when date or time changes (for events)
        if (formType === 'event' && (field === 'date' || field === 'time') && errors.date) {
            setErrors(prev => ({ ...prev, date: '' }));
        }
    };

    const handleFileUpload = (files, type) => {
        if (type === 'event-attachments') {
            // Convert FileList to Array and add to existing attachments
            const newFiles = Array.from(files);
            setEventForm(prev => ({
                ...prev,
                attachments: [...(prev.attachments || []), ...newFiles]
            }));
        } else if (type === 'news-image') {
            setNewsForm(prev => ({ ...prev, featuredImage: files[0] }));
        }
    };

    const filteredEvents = events.filter(event => {
        const matchesType = !filters.type || event.category === filters.type;
        const matchesStatus = !filters.status || event.status === filters.status;
        const matchesSearch = !filters.search ||
            event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            event.description.toLowerCase().includes(filters.search.toLowerCase());
        return matchesType && matchesStatus && matchesSearch;
    });

    const filteredNews = news.filter(newsItem => {
        const matchesSearch = !filters.search ||
            newsItem.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            newsItem.content.toLowerCase().includes(filters.search.toLowerCase());
        return matchesSearch;
    });

    const getCurrentItems = () => {
        const items = activeTab === 'events' ? filteredEvents : filteredNews;
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return items.slice(indexOfFirstItem, indexOfLastItem);
    };

    const totalPages = Math.ceil(
        (activeTab === 'events' ? filteredEvents.length : filteredNews.length) / itemsPerPage
    );

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
                <div className="header-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => handleAddNew(activeTab === 'events' ? 'event' : 'news')}
                    >
                        ➕ Add {activeTab === 'events' ? 'Event' : 'News'}
                    </button>
                </div>
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

            {/* Filters */}
            <div className="filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                </div>

                {activeTab === 'events' && (
                    <>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        >
                            <option value="">All Types</option>
                            {eventTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>

                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        >
                            <option value="">All Status</option>
                            {eventStatuses.map(status => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                    </>
                )}
            </div>

            {/* Content */}
            <div className="content-list">
                {getCurrentItems().map(item => (
                    <div key={item.id} className={`item-card ${activeTab}-card`}>
                        <div className="item-info">
                            <h4>{item.title}</h4>
                            <p className="item-description">
                                {activeTab === 'events' ? item.description : item.excerpt}
                            </p>

                            <div className="item-meta">
                                {activeTab === 'events' ? (
                                    <>
                                        <span className="meta-item">📅 {item.date} at {item.time}</span>
                                        <span className="meta-item">📍 {item.location}</span>
                                        <span className="meta-item">👥 {item.registrations || 0}/{item.maxParticipants || 'Unlimited'}</span>
                                        <span className={`status-badge status-${item.status}`}>
                                            {item.status}
                                        </span>
                                        <span className="meta-item">🏷️ {item.category}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="meta-item">📅 {item.publishDate}</span>
                                        <span className="meta-item">🏷️ {item.category}</span>
                                        <span className="meta-item">👁️ {item.views || 0} views</span>
                                        <span className={`status-badge status-${item.status}`}>
                                            {item.status}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="item-actions">
                            {activeTab === 'events' && (
                                <button
                                    className="btn btn-sm btn-info"
                                    onClick={() => {/* Handle registrations */ }}
                                >
                                    👥 Registrations
                                </button>
                            )}
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleEdit(item, activeTab === 'events' ? 'event' : 'news')}
                            >
                                ✏️ Edit
                            </button>
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(item.id, activeTab === 'events' ? 'event' : 'news')}
                                disabled={saving}
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        ← Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next →
                    </button>
                </div>
            )}

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
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setShowModal(false);
                                    setErrors({}); // Clear errors when closing modal
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Only show general errors if they're not validation errors for empty form */}
                            {errors.general && !errors.general.includes('required') && (
                                <div className="error-message general-error">
                                    {errors.general}
                                </div>
                            )}

                            {modalType.includes('event') ? (
                                <EventForm
                                    form={eventForm}
                                    errors={errors}
                                    eventTypes={eventTypes}
                                    eventStatuses={eventStatuses}
                                    onChange={handleInputChange}
                                    onFileUpload={handleFileUpload}
                                />
                            ) : (
                                <NewsForm
                                    form={newsForm}
                                    errors={errors}
                                    newsCategories={newsCategories}
                                    onChange={handleInputChange}
                                    onFileUpload={handleFileUpload}
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
                                onClick={() => {
                                    setShowModal(false);
                                    setErrors({}); // Clear errors when canceling
                                }}
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
const EventForm = ({ form, errors, eventTypes, eventStatuses, onChange, onFileUpload }) => (
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
            <label>Category *</label>
            <select
                value={form.category}
                onChange={(e) => onChange('category', e.target.value, 'event')}
                className={errors.category ? 'error' : ''}
            >
                <option value="">Select category</option>
                {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
            {errors.category && <span className="error-text">{errors.category}</span>}
        </div>

        <div className="form-group full-width">
            <label>Description *</label>
            <textarea
                value={form.description}
                onChange={(e) => onChange('description', e.target.value, 'event')}
                className={errors.description ? 'error' : ''}
                placeholder="Enter event description"
                rows="4"
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
            <label>Registration Deadline</label>
            <input
                type="date"
                value={form.registrationDeadline}
                onChange={(e) => onChange('registrationDeadline', e.target.value, 'event')}
            />
        </div>

        <div className="form-group">
            <label>Status</label>
            <select
                value={form.status}
                onChange={(e) => onChange('status', e.target.value, 'event')}
            >
                {eventStatuses.map(status => (
                    <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                ))}
            </select>
        </div>

        <div className="form-group full-width">
            <label>Attachments</label>
            <input
                type="file"
                multiple
                onChange={(e) => onFileUpload(Array.from(e.target.files), 'event-attachments')}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
            />
            <small className="form-help">Supported: PDF, DOC, PPT, Images (Max: 10MB each)</small>
        </div>
    </div>
);

// News Form Component
const NewsForm = ({ form, errors, newsCategories, onChange, onFileUpload }) => (
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
            <label>Category *</label>
            <select
                value={form.category}
                onChange={(e) => onChange('category', e.target.value, 'news')}
                className={errors.category ? 'error' : ''}
            >
                <option value="">Select category</option>
                {newsCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                ))}
            </select>
            {errors.category && <span className="error-text">{errors.category}</span>}
        </div>

        <div className="form-group full-width">
            <label>Excerpt *</label>
            <textarea
                value={form.excerpt}
                onChange={(e) => onChange('excerpt', e.target.value, 'news')}
                className={errors.excerpt ? 'error' : ''}
                placeholder="Enter brief excerpt"
                rows="2"
            />
            {errors.excerpt && <span className="error-text">{errors.excerpt}</span>}
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
            <label>Tags</label>
            <input
                type="text"
                value={form.tags}
                onChange={(e) => onChange('tags', e.target.value, 'news')}
                placeholder="Enter tags separated by commas"
            />
        </div>

        <div className="form-group">
            <label>Status</label>
            <select
                value={form.status}
                onChange={(e) => onChange('status', e.target.value, 'news')}
            >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
            </select>
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
            <label>Featured Image</label>
            <input
                type="file"
                onChange={(e) => onFileUpload(Array.from(e.target.files), 'news-image')}
                accept="image/*"
            />
            <small className="form-help">Supported: JPG, PNG, GIF (Max: 5MB)</small>
        </div>
    </div>
);

export default ManageEventsNews;