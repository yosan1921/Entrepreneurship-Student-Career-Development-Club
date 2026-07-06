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
            const upcomingResponse = await eventsAPI.getUpcoming();
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
            <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-sans text-sm font-semibold uppercase tracking-wider">Loading events...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden py-20 sm:py-28">
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                    <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-500 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full px-4 py-2 mb-6 shadow-premium">
                            <span className="text-xl">📅</span>
                            <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">Updates</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight uppercase tracking-tight">
                            News &amp; <span className="text-gradient">Events</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-sans font-medium">
                            Stay up to date with workshops, completed activities, and upcoming opportunities
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
            </section>

            {/* Events Grid Section */}
            <section className="max-w-7xl mx-auto px-6 py-12 sm:py-20 -mt-16 relative z-10">
                <div className="bg-white rounded-[2.5rem] shadow-premium p-8 sm:p-12 lg:p-16 border border-slate-100">
                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 mb-8 rounded-2xl font-sans text-sm font-medium">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Completed Events Column */}
                        <div>
                            <div className="flex items-center gap-3.5 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-100/50">
                                    📋
                                </div>
                                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                    Recent Activities
                                </h3>
                            </div>

                            {events.recent.length > 0 ? (
                                <ul className="space-y-6">
                                    {events.recent.map((event) => (
                                        <li key={event._id} className="group bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl p-6 shadow-premium hover:shadow-md transition-all duration-300">
                                            <strong className="text-slate-900 text-lg block mb-2 group-hover:text-indigo-600 transition-colors font-extrabold tracking-tight">
                                                {event.title}
                                            </strong>
                                            {event.date && (
                                                <div className="flex items-center gap-2 text-slate-400 font-sans text-xs mb-3 font-semibold uppercase tracking-wider">
                                                    <span>📅</span>
                                                    <span>{formatDate(event.date)}</span>
                                                </div>
                                            )}
                                            {event.description && (
                                                <p className="text-slate-500 font-sans text-sm leading-relaxed">
                                                    {event.description}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <ul className="space-y-4">
                                    {[
                                        { title: 'Career Guidance Workshop', desc: 'Practical CV formulation and cover letter guidelines for graduates.' },
                                        { title: 'Entrepreneurship Seminar', desc: 'Fireside chat with regional startup developers regarding market entries.' },
                                        { title: 'Leadership & Project Training', desc: 'Enhancing teamwork, active communication, and conflict resolution.' }
                                    ].map((event, idx) => (
                                        <li key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-premium">
                                            <strong className="text-slate-900 text-lg block mb-2 font-extrabold tracking-tight">
                                                {event.title}
                                            </strong>
                                            <p className="text-slate-500 font-sans text-sm leading-relaxed">
                                                {event.desc}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Upcoming Events Column */}
                        <div>
                            <div className="flex items-center gap-3.5 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-bold text-lg border border-indigo-100/50">
                                    🎯
                                </div>
                                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                    Upcoming Events
                                </h3>
                            </div>

                            {events.upcoming.length > 0 ? (
                                <ul className="space-y-6">
                                    {events.upcoming.map((event) => (
                                        <li key={event._id} className="group bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl p-6 shadow-premium hover:shadow-md transition-all duration-300">
                                            <strong className="text-slate-900 text-lg block mb-2 group-hover:text-indigo-600 transition-colors font-extrabold tracking-tight">
                                                {event.title}
                                            </strong>
                                            <div className="flex flex-wrap gap-4 text-slate-400 font-sans text-xs mb-3 font-semibold uppercase tracking-wider">
                                                {event.date && (
                                                    <div className="flex items-center gap-1">
                                                        <span>📅</span>
                                                        <span>{formatDate(event.date)}</span>
                                                    </div>
                                                )}
                                                {event.location && (
                                                    <div className="flex items-center gap-1 text-indigo-500">
                                                        <span>📍</span>
                                                        <span>{event.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {event.description && (
                                                <p className="text-slate-500 font-sans text-sm leading-relaxed mt-2">
                                                    {event.description}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <ul className="space-y-4">
                                    {[
                                        { title: 'Incubation Hackathon Stage', desc: 'Pitch staging competition featuring seed investment awards.' },
                                        { title: 'Regional Business Summit', desc: 'Paneling series hosting regional business executives.' },
                                        { title: 'Career Prep Fair 2026', desc: 'Mock interviews, cover letter audits, and corporate networking.' }
                                    ].map((event, idx) => (
                                        <li key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-premium">
                                            <strong className="text-slate-900 text-lg block mb-2 font-extrabold tracking-tight">
                                                {event.title}
                                            </strong>
                                            <p className="text-slate-500 font-sans text-sm leading-relaxed">
                                                {event.desc}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Events;