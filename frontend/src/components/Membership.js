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
            console.error('Error response:', error.response);

            let errorMessage = 'Registration failed. Please try again.';

            if (error.response) {
                // Server responded with error status
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                // Request was made but no response received
                errorMessage = 'Cannot connect to server. Make sure backend is running.';
            } else {
                // Something else happened
                errorMessage = error.message || 'Unknown error occurred';
            }

            setMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">Membership</h2>
                <p className="text-base sm:text-lg text-gray-700 mb-8">
                    Join ESCDC to develop practical skills, build networks, and enhance your employability.
                </p>

                {message && (
                    <div className={`p-4 mb-6 rounded-lg border-l-4 ${message.includes('successful')
                            ? 'bg-green-50 border-green-500 text-green-700'
                            : 'bg-red-50 border-red-500 text-red-700'
                        }`}>
                        <p className="font-medium">{message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="full_name"
                                placeholder="Enter your full name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Student ID
                            </label>
                            <input
                                type="text"
                                name="student_id"
                                placeholder="Your student ID"
                                value={formData.student_id}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Department
                            </label>
                            <input
                                type="text"
                                name="department"
                                placeholder="Your department"
                                value={formData.department}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Year
                            </label>
                            <input
                                type="number"
                                name="year"
                                placeholder="Year (e.g., 1, 2, 3, 4)"
                                value={formData.year}
                                onChange={handleChange}
                                min="1"
                                max="6"
                                disabled={loading}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="+251-XXX-XXXXXX"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300 hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Membership;