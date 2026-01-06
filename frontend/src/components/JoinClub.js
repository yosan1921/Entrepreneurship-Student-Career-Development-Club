import React, { useState } from 'react';
import { membersAPI } from '../services/api';

const JoinClub = () => {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        studentId: '',
        program: '',
        year: '',
        interests: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Validate required fields
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.studentId || !formData.program || !formData.year) {
                alert('Please fill in all required fields');
                setSubmitting(false);
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                alert('Please enter a valid email address');
                setSubmitting(false);
                return;
            }

            // Map frontend fields to backend/database expected fields
            const memberData = {
                full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
                student_id: formData.studentId.trim(),
                department: formData.program.trim(),
                year: formData.year,
                phone: formData.phone.trim() || null,
                email: formData.email.trim().toLowerCase(),
                interests: formData.interests.trim() || null
            };

            const response = await membersAPI.register(memberData);

            if (response.data.success) {
                alert('🎉 ' + response.data.message + '\n\nThank you for joining ESCDC! We look forward to working with you.');
                setShowModal(false);
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    studentId: '',
                    program: '',
                    year: '',
                    interests: ''
                });
            } else {
                alert(response.data.message || 'Error submitting form. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'Error submitting form. Please check your connection and try again.';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 400) {
                errorMessage = 'Invalid form data. Please check all fields and try again.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            }

            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div>
            {/* Redesigned Premium "Join Club" Button */}
            <button
                className="group relative inline-flex items-center justify-center px-8 py-3.5 font-bold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 overflow-hidden"
                onClick={() => setShowModal(true)}
            >
                <div className="absolute inset-0 w-3 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-40 group-hover:translate-x-40 transition-all duration-700 ease-out"></div>
                <span className="relative flex items-center gap-2">
                    Join Our Community
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </span>
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up relative pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white px-6 py-5 rounded-t-2xl flex justify-between items-center z-10">
                            <div>
                                <h3 className="text-2xl font-bold">Join Our Community</h3>
                                <p className="text-blue-100 text-sm mt-1">Start your journey with us today</p>
                            </div>
                            <button
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                                onClick={() => setShowModal(false)}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                                <p className="text-gray-700 leading-relaxed">
                                    Ready to start your entrepreneurial journey? Join the Entrepreneurship
                                    and Student Career Development Club and unlock opportunities for growth,
                                    networking, and skill development.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="Enter your first name"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors duration-200 text-gray-900 bg-white placeholder-gray-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Enter your last name"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors duration-200 text-gray-900 bg-white placeholder-gray-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your.email@example.com"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors duration-200 text-gray-900 bg-white placeholder-gray-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+251..."
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors duration-200 text-gray-900 bg-white placeholder-gray-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Student ID *</label>
                                        <input
                                            type="text"
                                            name="studentId"
                                            value={formData.studentId}
                                            onChange={handleChange}
                                            placeholder="e.g., CS/1234/15"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors duration-200 text-gray-900 bg-white placeholder-gray-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Year of Study *</label>
                                        <select
                                            name="year"
                                            value={formData.year}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors duration-200 bg-white text-gray-900 focus:text-gray-900"
                                            required
                                        >
                                            <option value="">Select Year</option>
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="4th Year">4th Year</option>
                                            <option value="Graduate">Graduate</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Program/Major *</label>
                                    <input
                                        type="text"
                                        name="program"
                                        value={formData.program}
                                        onChange={handleChange}
                                        placeholder="e.g., Business Administration, Computer Science"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors duration-200 text-gray-900 bg-white placeholder-gray-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Areas of Interest</label>
                                    <textarea
                                        name="interests"
                                        value={formData.interests}
                                        onChange={handleChange}
                                        placeholder="Tell us about your entrepreneurial interests, career goals, or what you hope to gain from joining ESCDC..."
                                        rows="4"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors duration-200 resize-none text-gray-900 bg-white placeholder-gray-500"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => setShowModal(false)}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Submit Application
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JoinClub;
