import React, { useState } from 'react';
import { contactAPI } from '../services/api';

const Contact = () => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
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
            const response = await contactAPI.submit(formData);

            if (response.data.success) {
                setMessage('Message sent successfully! We will get back to you soon.');
                setFormData({ name: '', email: '', subject: '', message: '' });
                setShowForm(false);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
            setMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden py-20 sm:py-28">
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                    <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-500 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full px-4 py-2 mb-6 shadow-premium">
                            <span className="text-xl">📧</span>
                            <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">Connect</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight uppercase tracking-tight">
                            Get In <span className="text-gradient">Touch</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-sans font-medium">
                            Have questions or ideas? Drop us a message, and our team will get back to you shortly.
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
            </section>

            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
                <div className="bg-white rounded-[2.5rem] shadow-premium p-8 sm:p-14 border border-slate-100">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
                        {/* Info cards left */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl shadow-premium">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/50 text-[#4F46E5] flex items-center justify-center text-lg shrink-0">
                                        📍
                                    </div>
                                    <div className="font-sans">
                                        <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Address</h4>
                                        <p className="text-slate-500 text-sm leading-relaxed mt-2">
                                            Haramaya University, Main Campus<br />
                                            Building II, Office No. 12
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl shadow-premium">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
                                        📧
                                    </div>
                                    <div className="font-sans">
                                        <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Email</h4>
                                        <a href="mailto:escdc@haramaya.edu.et" className="text-indigo-600 hover:text-indigo-500 font-semibold text-sm block mt-2">
                                            escdc@haramaya.edu.et
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl shadow-premium">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100/50 text-amber-600 flex items-center justify-center text-lg shrink-0">
                                        📞
                                    </div>
                                    <div className="font-sans">
                                        <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Phone</h4>
                                        <a href="tel:+251255530325" className="text-indigo-600 hover:text-indigo-500 font-semibold text-sm block mt-2">
                                            +251-25-553-0325
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Message Panel Right */}
                        <div className="lg:col-span-7">
                            {message && (
                                <div className={`p-5 mb-6 rounded-2xl border font-sans text-sm ${message.includes('successfully')
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                                    : 'bg-rose-50 border-rose-100 text-rose-800'
                                }`}>
                                    <p className="font-bold">{message.includes('successfully') ? '🎉 Success' : '⚠️ Alert'}</p>
                                    <p className="mt-1 font-medium">{message}</p>
                                </div>
                            )}

                            {!showForm ? (
                                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 text-center shadow-premium">
                                    <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-premium">
                                        ✉️
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Have a Question?</h3>
                                    <p className="text-slate-500 font-sans text-xs max-w-xs mx-auto leading-relaxed mb-6">
                                        Send us a direct message and our operations team will respond to your queries.
                                    </p>
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="px-6 py-3 bg-slate-950 text-white rounded-xl font-bold hover:bg-slate-900 transition-all text-xs uppercase tracking-wider hover:scale-102"
                                    >
                                        Send Message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Your Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                disabled={loading}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-sans text-sm font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Your Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="john.doe@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                disabled={loading}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-sans text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Subject *</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            placeholder="Club activities query"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-sans text-sm font-medium"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Your Message *</label>
                                        <textarea
                                            name="message"
                                            placeholder="Write your message details here..."
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                            rows="5"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-sans text-sm font-medium resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg hover:scale-102 text-xs uppercase tracking-wider disabled:opacity-50"
                                        >
                                            {loading ? 'Sending...' : 'Send Message'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            disabled={loading}
                                            className="flex-1 px-6 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all text-xs uppercase tracking-wider border border-slate-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;