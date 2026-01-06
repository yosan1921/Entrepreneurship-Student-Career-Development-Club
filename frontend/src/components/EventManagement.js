import React, { useState } from 'react';
import EventForm from './EventForm';
import './EventManagement.css';

const EventManagement = () => {
    const [showForm, setShowForm] = useState(false);
    const [events, setEvents] = useState([]);

    const handleEventCreated = (newEvent) => {
        setEvents(prev => [...prev, newEvent]);
        setShowForm(false);
    };

    return (
        <div className="event-management">
            <div className="header">
                <h2>Event Management</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(true)}
                >
                    ➕ Add New Event
                </button>
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <EventForm
                            onSuccess={handleEventCreated}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                </div>
            )}

            <div className="events-list">
                {events.length === 0 ? (
                    <p>No events created yet. Click "Add New Event" to get started.</p>
                ) : (
                    events.map(event => (
                        <div key={event.id} className="event-card">
                            <h3>{event.title}</h3>
                            <p>{event.description}</p>
                            <div className="event-meta">
                                <span>📅 {event.datetime}</span>
                                <span>📍 {event.location}</span>
                                <span>👤 {event.organizer}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EventManagement;