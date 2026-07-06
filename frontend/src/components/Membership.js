import React, { useState } from 'react';
import { membersAPI } from '../services/api';

const Membership = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        department: '',
        student_id: '',
        year: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            console.log('Submitting registration:', formData);
            const response = await membersAPI.register(formData);
            console.log('Registration response:', response);

            if (response.data.success) {
                setMessage('Registration successful! Welcome to ESCDC!');
                setFormData({ full_name: '', email: '', department: '', student_id: '', year: '', phone: '' });
            }
        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'Registration failed. Please try again.';

            if (error.response) {
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = 'Cannot connect to server. Make sure backend is running.';
            } else {
                errorMessage = error.message || 'Unknown error occurred';
            }

            setMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="max-w-7xl mx-auto px-6 py-12 sm:py-20">
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
                <div className="grid lg:grid-cols-12">
                    {/* Left Column: Promotion Panel */}
                    <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500 rounded-full blur-[80px]"></div>
                        </div>

                        <div className="relative">
                            <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">
                                Apply Today
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold mt-6 mb-8 tracking-tight leading-tight">
                                Start Your Startup <br />&amp; Professional Journey
                            </h2>
                            <p className="text-slate-300 font-sans text-sm leading-relaxed mb-10">
                                Join ESCDC to develop practical skills, build professional networks, and enhance your career readiness.
                            </p>

                            <div className="space-y-6 font-sans text-sm">
                                {[
                                    { title: 'Free Skill Bootcamps', desc: 'Participate in professional CV writing & pitch training.' },
                                    { title: 'Certification Programs', desc: 'Get recognized for workshops and competitive milestones.' },
                                    { title: 'Mentoring Opportunities', desc: 'Gain direct career guidance from experienced startup founders.' },
                                    { title: 'Incubation Support', desc: 'Acquire resources to develop your business ideas.' }
                                ].map((benefit, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0 font-bold">
                                            ✓
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{benefit.title}</h4>
                                            <p className="text-slate-400 text-xs mt-0.5">{benefit.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-800 text-slate-400 text-xs font-sans tracking-wide">
                            📍 Haramaya University Chapter
                        </div>
                    </div>

                    {/* Right Column: Registration Form */}
                    <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16">
                        <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Member Registration</h3>
                        <p className="text-slate-500 font-sans text-sm mb-10">Please fill out the details below to complete your club application.</p>

                        {message && (
                            <div className={`p-5 mb-8 rounded-2xl border font-sans text-sm ${message.includes('successful')
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                                : 'bg-rose-50 border-rose-100 text-rose-800'
                            }`}>
                                <p className="font-bold">{message.includes('successful') ? '🎉 Success' : '⚠️ Alert'}</p>
                                <p className="mt-1 font-medium">{message}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Full Name *</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        placeholder="John Doe"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-sans text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="john.doe@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-sans text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Student ID</label>
                                    <input
                                        type="text"
                                        name="student_id"
                                        placeholder="Your student ID"
                                        value={formData.student_id}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-sans text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        placeholder="Software Engineering"
                                        value={formData.department}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-sans text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Year of Study</label>
                                    <input
                                        type="number"
                                        name="year"
                                        placeholder="Year (e.g. 1, 2, 3)"
                                        value={formData.year}
                                        onChange={handleChange}
                                        min="1"
                                        max="6"
                                        disabled={loading}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-sans text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="+251-XXX-XXXXXX"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-sans text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold hover:from-indigo-500 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 hover:scale-102 disabled:opacity-50 disabled:scale-100 mt-8"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Registering...</span>
                                    </>
                                ) : (
                                    <span>Submit Application</span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Membership;