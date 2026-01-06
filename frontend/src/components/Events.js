import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';

const Events = () => {
    const [events, setEvents] = useState({
        recent: [],
        upcoming: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);

            // Fetch upcoming events
            const upcomingResponse = await eventsAPI.getUpcoming();

            // Fetch completed events (recent activities)
            const completedResponse = await eventsAPI.getAll('completed');

            setEvents({
                upcoming: upcomingResponse.data.events || [],
                recent: completedResponse.data.events?.slice(0, 5) || []
            });
        } catch (error) {
            setError('Failed to load events');
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
                    <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-6">News & Events</h2>
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                        <p className="ml-4 text-gray-600">Loading events...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-8">News & Events</h2>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                    {/* Recent Activities */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 shadow-md">
                        <h3 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 flex items-center">
                            <span className="mr-2">📋</span>
                            Recent Activities
                        </h3>
                        {events.recent.length > 0 ? (
                            <ul className="space-y-4">
                                {events.recent.map((event) => (
                                    <li key={event._id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <strong className="text-blue-900 text-base sm:text-lg block mb-1">{event.title}</strong>
                                        {event.date && (
                                            <p className="text-sm text-gray-600 mb-2">
                                                📅 {formatDate(event.date)}
                                            </p>
                                        )}
                                        {event.description && (
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {event.description}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <ul className="space-y-3">
                                <li className="flex items-start text-sm sm:text-base text-gray-700">
                                    <span className="text-green-600 mr-2 flex-shrink-0">•</span>
                                    <span>Career guidance workshop</span>
                                </li>
                                <li className="flex items-start text-sm sm:text-base text-gray-700">
                                    <span className="text-green-600 mr-2 flex-shrink-0">•</span>
                                    <span>Entrepreneurship seminar</span>
                                </li>
                                <li className="flex items-start text-sm sm:text-base text-gray-700">
                                    <span className="text-green-600 mr-2 flex-shrink-0">•</span>
                                    <span>Leadership training</span>
                                </li>
                            </ul>
                        )}
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow-md">
                        <h3 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 flex items-center">
                            <span className="mr-2">🎯</span>
                            Upcoming Events
                        </h3>
                        {events.upcoming.length > 0 ? (
                            <ul className="space-y-4">
                                {events.upcoming.map((event) => (
                                    <li key={event._id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <strong className="text-blue-900 text-base sm:text-lg block mb-1">{event.title}</strong>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            {event.date && (
                                                <p>📅 {formatDate(event.date)}</p>
                                            )}
                                            {event.location && (
                                                <p>📍 {event.location}</p>
                                            )}
                                        </div>
                                        {event.description && (
                                            <p className="text-sm text-gray-700 leading-relaxed mt-2">
                                                {event.description}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <ul className="space-y-3">
                                <li className="flex items-start text-sm sm:text-base text-gray-700">
                                    <span className="text-blue-600 mr-2 flex-shrink-0">•</span>
                                    <span>Entrepreneurship Training Workshop</span>
                                </li>
                                <li className="flex items-start text-sm sm:text-base text-gray-700">
                                    <span className="text-blue-600 mr-2 flex-shrink-0">•</span>
                                    <span>Career Development Seminar</span>
                                </li>
                                <li className="flex items-start text-sm sm:text-base text-gray-700">
                                    <span className="text-blue-600 mr-2 flex-shrink-0">•</span>
                                    <span>Startup Pitch Competition</span>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Events;