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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-6">Contact Us</h2>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                            <span className="text-2xl flex-shrink-0">📍</span>
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-1">Address</h3>
                                <p className="text-gray-700">Haramaya University, Main Campus<br />Building II, Office No. 12</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                            <span className="text-2xl flex-shrink-0">📧</span>
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-1">Email</h3>
                                <a href="mailto:escdc@haramaya.edu.et" className="text-blue-600 hover:text-blue-800 transition-colors">
                                    escdc@haramaya.edu.et
                                </a>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                            <span className="text-2xl flex-shrink-0">📞</span>
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-1">Phone</h3>
                                <a href="tel:+251255530325" className="text-blue-600 hover:text-blue-800 transition-colors">
                                    +251-25-553-0325
                                </a>
                            </div>
                        </div>
                    </div>

                    <div>
                        {message && (
                            <div className={`p-4 mb-6 rounded-lg border-l-4 ${message.includes('successfully')
                                    ? 'bg-green-50 border-green-500 text-green-700'
                                    : 'bg-red-50 border-red-500 text-red-700'
                                }`}>
                                <p className="font-medium">{message}</p>
                            </div>
                        )}

                        {!showForm ? (
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 text-center">
                                <h3 className="text-xl font-bold text-blue-900 mb-4">Have a Question?</h3>
                                <p className="text-gray-700 mb-6">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300 hover:shadow-lg"
                                >
                                    Send us a Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Your Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Your Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="your.email@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        placeholder="What is this about?"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Your Message *
                                    </label>
                                    <textarea
                                        name="message"
                                        placeholder="Tell us more..."
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        rows="5"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100 resize-vertical"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300 hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Sending...' : 'Send Message'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        disabled={loading}
                                        className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;