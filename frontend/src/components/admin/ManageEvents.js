import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../../services/api';

const ManageEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await eventsAPI.getAll();
            if (response.data.success) {
                setEvents(response.data.events);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading events...</div>;
    }

    return (
        <div className="manage-events">
            <div className="section-header">
                <h3>Manage Events & News</h3>
                <button className="btn btn-primary">+ Add Event</button>
            </div>

            <div className="events-list">
                {events.map(event => (
                    <div key={event.id} className="event-card">
                        <div className="event-info">
                            <h4>{event.title}</h4>
                            <p>{event.description}</p>
                            <div className="event-meta">
                                <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                                <span>📍 {event.location}</span>
                                <span className={`status-badge status-${event.status}`}>
                                    {event.status}
                                </span>
                            </div>
                        </div>
                        <div className="event-actions">
                            <button className="btn btn-sm btn-secondary">Edit</button>
                            <button className="btn btn-sm btn-danger">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageEvents;