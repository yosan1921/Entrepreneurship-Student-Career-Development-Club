import React, { useState } from 'react';
import { eventsAPI } from '../services/api';

const EventForm = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        date: '',
        time: '',
        location: '',
        organizer: '',
        maxParticipants: '',
        status: 'upcoming'
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const eventCategories = [
        'Workshop',
        'Training',
        'Seminar',
        'Competition',
        'Guest Lecture',
        'Other'
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }

        // Clear date error when date or time changes
        if ((field === 'date' || field === 'time') && errors.date) {
            setErrors(prev => ({ ...prev, date: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required field validation
        if (!formData.title?.trim()) newErrors.title = 'Title is required';
        if (!formData.description?.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.time) newErrors.time = 'Time is required';
        if (!formData.location?.trim()) newErrors.location = 'Location is required';
        if (!formData.organizer?.trim()) newErrors.organizer = 'Organizer is required';

        // Date validation - ensure it's not in the past
        if (formData.date && formData.time) {
            try {
                const [year, month, day] = formData.date.split('-').map(Number);
                const [hours, minutes] = formData.time.split(':').map(Number);

                const eventDateTime = new Date(year, month - 1, day, hours, minutes);
                const now = new Date();

                // Add 5 minute buffer for form submission time
                const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

                if (eventDateTime < fiveMinutesAgo) {
                    newErrors.date = 'Event date and time cannot be in the past';
                }
            } catch (error) {
                newErrors.date = 'Invalid date or time format';
            }
        }

        return newErrors;
    };

    const combineDateAndTime = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return null;

        // Parse date and time components
        const [year, month, day] = dateStr.split('-').map(Number);
        const [hours, minutes] = timeStr.split(':').map(Number);

        // Create Date object in local timezone
        const eventDateTime = new Date(year, month - 1, day, hours, minutes);

        // Convert to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
        return eventDateTime.toISOString().slice(0, 19).replace('T', ' ');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('📅 Form submission started with data:', formData);

        // Validate form
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            console.log('❌ Form validation failed:', formErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            // Combine date and time into datetime
            const datetime = combineDateAndTime(formData.date, formData.time);

            if (!datetime) {
                throw new Error('Failed to create datetime');
            }

            // Prepare event data for backend
            const eventData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category,
                datetime: datetime,
                location: formData.location.trim(),
                organizer: formData.organizer.trim(),
                status: formData.status,
                maxParticipants: formData.maxParticipants || null
            };

            console.log('📅 Sending event data to backend:', eventData);

            const response = await eventsAPI.create(eventData);

            if (response.data.success) {
                console.log('✅ Event created successfully:', response.data);
                alert('✅ Event created successfully!');

                // Reset form
                setFormData({
                    title: '',
                    description: '',
                    category: '',
                    date: '',
                    time: '',
                    location: '',
                    organizer: '',
                    maxParticipants: '',
                    status: 'upcoming'
                });

                if (onSuccess) onSuccess(response.data);
            } else {
                throw new Error(response.data.message || 'Failed to create event');
            }

        } catch (error) {
            console.error('❌ Error creating event:', error);

            const errorMessage = error.response?.data?.message || error.message || 'Failed to create event';
            setErrors({ general: errorMessage });
            alert(`❌ Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="event-form">
            <h3>Add New Event</h3>

            {errors.general && (
                <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
                    {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={errors.title ? 'error' : ''}
                        placeholder="Enter event title"
                    />
                    {errors.title && <span className="error-text">{errors.title}</span>}
                </div>

                <div className="form-group">
                    <label>Category *</label>
                    <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className={errors.category ? 'error' : ''}
                    >
                        <option value="">Select category</option>
                        {eventCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                    {errors.category && <span className="error-text">{errors.category}</span>}
                </div>

                <div className="form-group">
                    <label>Description *</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className={errors.description ? 'error' : ''}
                        placeholder="Enter event description"
                        rows="4"
                    />
                    {errors.description && <span className="error-text">{errors.description}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Date *</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            className={errors.date ? 'error' : ''}
                        />
                        {errors.date && <span className="error-text">{errors.date}</span>}
                    </div>

                    <div className="form-group">
                        <label>Time *</label>
                        <input
                            type="time"
                            value={formData.time}
                            onChange={(e) => handleInputChange('time', e.target.value)}
                            className={errors.time ? 'error' : ''}
                        />
                        {errors.time && <span className="error-text">{errors.time}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label>Location *</label>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className={errors.location ? 'error' : ''}
                        placeholder="Enter event location"
                    />
                    {errors.location && <span className="error-text">{errors.location}</span>}
                </div>

                <div className="form-group">
                    <label>Organizer *</label>
                    <input
                        type="text"
                        value={formData.organizer}
                        onChange={(e) => handleInputChange('organizer', e.target.value)}
                        className={errors.organizer ? 'error' : ''}
                        placeholder="Enter organizer name"
                    />
                    {errors.organizer && <span className="error-text">{errors.organizer}</span>}
                </div>

                <div className="form-group">
                    <label>Max Participants</label>
                    <input
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                        placeholder="Leave empty for unlimited"
                        min="1"
                    />
                </div>

                <div className="form-group">
                    <label>Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? 'Creating...' : '✅ Create Event'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-secondary"
                    >
                        ❌ Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EventForm;