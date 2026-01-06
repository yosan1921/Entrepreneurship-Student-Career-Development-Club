import React, { useState } from 'react';
import axios from 'axios';

const AddEventForm = () => {
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
    const [success, setSuccess] = useState(false);

    const categories = ['Workshop', 'Training', 'Seminar', 'Competition', 'Guest Lecture', 'Other'];

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Combine date and time into ISO datetime
    const combineDateAndTime = (date, time) => {
        if (!date || !time) return null;

        // Input: date = "2025-12-27", time = "16:32"
        // Output: "2025-12-27T16:32:00" (ISO format)
        return `${date}T${time}:00`;
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.time) newErrors.time = 'Time is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.organizer.trim()) newErrors.organizer = 'Organizer is required';

        // Validate that date/time is in the future
        if (formData.date && formData.time) {
            const eventDateTime = new Date(combineDateAndTime(formData.date, formData.time));
            const now = new Date();

            if (eventDateTime <= now) {
                newErrors.date = 'Event date and time must be in the future';
            }
        }

        return newErrors;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('🚀 Form submission started');
        console.log('📅 Form data:', formData);

        // Validate form
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            console.log('❌ Validation errors:', formErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            // STEP 1: Combine date and time into ISO datetime
            const datetime = combineDateAndTime(formData.date, formData.time);

            console.log('📅 Input date:', formData.date);
            console.log('📅 Input time:', formData.time);
            console.log('📅 Combined datetime (ISO):', datetime);

            // Verify datetime is valid
            const testDate = new Date(datetime);
            if (isNaN(testDate.getTime())) {
                throw new Error('Invalid date or time');
            }

            console.log('📅 Parsed as Date object:', testDate);
            console.log('📅 Is future date?', testDate > new Date());

            // STEP 2: Prepare data for backend
            const eventData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category,
                datetime: datetime, // Send ISO format: YYYY-MM-DDTHH:MM:SS
                location: formData.location.trim(),
                organizer: formData.organizer.trim(),
                status: formData.status,
                maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null
            };

            console.log('📤 Sending to backend:', eventData);

            // STEP 3: Send to backend
            const response = await axios.post('http://localhost:3001/api/events', eventData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Add your auth token
                }
            });

            console.log('✅ Backend response:', response.data);

            if (response.data.success) {
                setSuccess(true);
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

                // Hide success message after 3 seconds
                setTimeout(() => setSuccess(false), 3000);
            }

        } catch (error) {
            console.error('❌ Error creating event:', error);

            const errorMessage = error.response?.data?.message || error.message || 'Failed to create event';
            setErrors({ general: errorMessage });

            // Log detailed error info
            if (error.response?.data) {
                console.log('📋 Backend error details:', error.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>Add New Event</h2>

            {success && (
                <div style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
                    ✅ Event created successfully!
                </div>
            )}

            {errors.general && (
                <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
                    ❌ {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: errors.title ? '2px solid #dc3545' : '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                        placeholder="Enter event title"
                    />
                    {errors.title && <span style={{ color: '#dc3545', fontSize: '14px' }}>{errors.title}</span>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Category *
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: errors.category ? '2px solid #dc3545' : '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {errors.category && <span style={{ color: '#dc3545', fontSize: '14px' }}>{errors.category}</span>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: errors.description ? '2px solid #dc3545' : '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                        placeholder="Enter event description"
                    />
                    {errors.description && <span style={{ color: '#dc3545', fontSize: '14px' }}>{errors.description}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Date *
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: errors.date ? '2px solid #dc3545' : '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        />
                        {errors.date && <span style={{ color: '#dc3545', fontSize: '14px' }}>{errors.date}</span>}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Time *
                        </label>
                        <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: errors.time ? '2px solid #dc3545' : '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        />
                        {errors.time && <span style={{ color: '#dc3545', fontSize: '14px' }}>{errors.time}</span>}
                    </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Location *
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: errors.location ? '2px solid #dc3545' : '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                        placeholder="Enter event location"
                    />
                    {errors.location && <span style={{ color: '#dc3545', fontSize: '14px' }}>{errors.location}</span>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Organizer *
                    </label>
                    <input
                        type="text"
                        name="organizer"
                        value={formData.organizer}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: errors.organizer ? '2px solid #dc3545' : '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                        placeholder="Enter organizer name"
                    />
                    {errors.organizer && <span style={{ color: '#dc3545', fontSize: '14px' }}>{errors.organizer}</span>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Max Participants
                    </label>
                    <input
                        type="number"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                        placeholder="Leave empty for unlimited"
                        min="1"
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Status
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: loading ? '#6c757d' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Creating Event...' : '✅ Create Event'}
                </button>
            </form>

            {/* Debug Info */}
            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '12px' }}>
                <strong>Debug Info:</strong><br />
                Date: {formData.date}<br />
                Time: {formData.time}<br />
                Combined: {formData.date && formData.time ? combineDateAndTime(formData.date, formData.time) : 'N/A'}
            </div>
        </div>
    );
};

export default AddEventForm;