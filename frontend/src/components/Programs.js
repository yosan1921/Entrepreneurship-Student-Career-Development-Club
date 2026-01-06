import React, { useState } from 'react';

const Programs = ({ setActiveSection }) => {
    const handleEnroll = () => {
        if (setActiveSection) {
            setActiveSection('membership');
        }
    };

    const [activeProgram, setActiveProgram] = useState(null);

    const programs = [
        {
            id: 1,
            title: 'Entrepreneurship Development',
            shortDesc: 'Transform your ideas into successful businesses',
            fullDesc: 'Our entrepreneurship program provides comprehensive training in business ideation, validation, and execution. Learn from successful entrepreneurs and gain hands-on experience in building your startup.',
            icon: '💡',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'from-purple-50 to-purple-100',
            items: [
                'Business idea generation and validation',
                'Startup training and incubation',
                'Pitch competitions and funding opportunities',
                'Business model canvas workshops',
                'Market research and analysis'
            ],
            benefits: [
                'Access to incubation facilities',
                'Seed funding opportunities',
                'Mentorship from successful entrepreneurs',
                'Networking with investors'
            ],
            testimonial: {
                quote: "The entrepreneurship program helped me launch my tech startup. The mentorship was invaluable!",
                author: "Sarah M.",
                role: "Tech Entrepreneur"
            }
        },
        {
            id: 2,
            title: 'Career Development',
            shortDesc: 'Build the skills employers are looking for',
            fullDesc: 'Prepare yourself for the competitive job market with our comprehensive career development program. From resume building to interview mastery, we cover everything you need to land your dream job.',
            icon: '🎯',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'from-blue-50 to-blue-100',
            items: [
                'Professional CV and cover letter writing',
                'Interview skills and techniques',
                'Career guidance and counseling',
                'Industry-specific skill development',
                'Job search strategies'
            ],
            benefits: [
                'One-on-one career counseling',
                'Mock interview sessions',
                'Job placement assistance',
                'Industry connections'
            ],
            testimonial: {
                quote: "Thanks to ESCDC's career program, I secured my dream job at a Fortune 500 company!",
                author: "John D.",
                role: "Business Analyst"
            }
        },
        {
            id: 3,
            title: 'Leadership & Soft Skills',
            shortDesc: 'Develop essential leadership qualities',
            fullDesc: 'Leadership is not just about managing people; it\'s about inspiring change. Our program focuses on developing emotional intelligence, communication skills, and ethical leadership principles.',
            icon: '🌟',
            color: 'from-green-500 to-green-600',
            bgColor: 'from-green-50 to-green-100',
            items: [
                'Effective communication skills',
                'Team building and collaboration',
                'Ethical leadership principles',
                'Public speaking and presentation',
                'Conflict resolution'
            ],
            benefits: [
                'Leadership training workshops',
                'Team project opportunities',
                'Public speaking practice',
                'Community leadership roles'
            ],
            testimonial: {
                quote: "The leadership program transformed my confidence and communication skills completely.",
                author: "Aisha K.",
                role: "Team Lead"
            }
        },
        {
            id: 4,
            title: 'Industry & Community Engagement',
            shortDesc: 'Connect with professionals and give back',
            fullDesc: 'Bridge the gap between academia and industry while making a positive impact in your community. Network with professionals, visit companies, and participate in meaningful community initiatives.',
            icon: '🤝',
            color: 'from-orange-500 to-orange-600',
            bgColor: 'from-orange-50 to-orange-100',
            items: [
                'Guest speaker sessions with industry leaders',
                'Company visits and site tours',
                'Community service initiatives',
                'Industry networking events',
                'Professional mentorship programs'
            ],
            benefits: [
                'Direct access to industry professionals',
                'Internship opportunities',
                'Community impact projects',
                'Professional network building'
            ],
            testimonial: {
                quote: "The industry connections I made through ESCDC opened doors I never imagined possible.",
                author: "Michael T.",
                role: "Marketing Professional"
            }
        }
    ];

    const upcomingEvents = [
        { title: 'Startup Bootcamp', date: 'Feb 15-17', type: 'Workshop' },
        { title: 'Career Fair 2024', date: 'Mar 5', type: 'Networking' },
        { title: 'Leadership Summit', date: 'Mar 20', type: 'Conference' },
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span className="text-sm font-semibold">Our Programs</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Programs & Activities
                        </h1>
                        <p className="text-lg sm:text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
                            Comprehensive training programs designed to transform students into successful
                            entrepreneurs and professional leaders
                        </p>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb" />
                    </svg>
                </div>
            </section>

            {/* Programs Grid */}
            <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        {programs.map((program) => (
                            <div
                                key={program.id}
                                className={`group relative bg-white rounded-3xl overflow-hidden border-2 border-gray-100 hover:border-purple-300 transition-all duration-300 hover:shadow-2xl ${activeProgram === program.id ? 'ring-4 ring-purple-300' : ''
                                    }`}
                            >
                                {/* Background Gradient */}
                                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${program.bgColor} rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity`}></div>

                                <div className="relative p-8">
                                    {/* Icon */}
                                    <div className={`w-20 h-20 bg-gradient-to-br ${program.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 text-4xl`}>
                                        {program.icon}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        {program.title}
                                    </h3>

                                    {/* Short Description */}
                                    <p className="text-gray-600 mb-4">
                                        {program.shortDesc}
                                    </p>

                                    {/* Full Description */}
                                    <p className="text-gray-700 leading-relaxed mb-6">
                                        {program.fullDesc}
                                    </p>

                                    {/* What You'll Learn */}
                                    <div className="mb-6">
                                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            What You'll Learn
                                        </h4>
                                        <ul className="space-y-2">
                                            {program.items.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <span className="text-purple-600 mt-1">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Benefits */}
                                    <div className={`bg-gradient-to-br ${program.bgColor} rounded-2xl p-4 mb-6`}>
                                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                            Program Benefits
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {program.benefits.map((benefit, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{benefit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Testimonial */}
                                    <div className="bg-white rounded-2xl p-4 border-2 border-gray-100">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-8 h-8 text-purple-600 opacity-50 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                            </svg>
                                            <div>
                                                <p className="text-sm text-gray-700 italic mb-2">
                                                    "{program.testimonial.quote}"
                                                </p>
                                                <div className="text-xs">
                                                    <div className="font-bold text-gray-900">{program.testimonial.author}</div>
                                                    <div className="text-gray-600">{program.testimonial.role}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enroll Button */}
                                    <button
                                        onClick={() => setActiveProgram(program.id)}
                                        className={`mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeProgram === program.id
                                            ? `bg-gradient-to-r ${program.color} text-white shadow-lg`
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>{activeProgram === program.id ? 'Selected' : 'Learn More'}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Upcoming Events */}
            <section className="bg-white py-16 sm:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-semibold">Coming Soon</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Upcoming Events
                        </h2>
                        <p className="text-lg text-gray-600">
                            Don't miss out on these exciting opportunities
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {upcomingEvents.map((event, index) => (
                            <div
                                key={index}
                                className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                                        {event.date.split(' ')[1] || event.date.split('-')[0]}
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-purple-600 uppercase">{event.type}</div>
                                        <div className="text-sm text-gray-600">{event.date}</div>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {event.title}
                                </h3>
                                <button className="text-purple-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                    <span>Register Now</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 py-16 sm:py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-xl text-purple-100 mb-10 leading-relaxed">
                        Join our programs and unlock your full potential. Whether you want to start a business,
                        advance your career, or develop leadership skills, we have the right program for you.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleEnroll}
                            className="group flex items-center justify-center gap-2 bg-white text-purple-700 px-8 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span>Enroll Now</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                        <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>View Schedule</span>
                        </button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/80">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">4 Comprehensive Programs</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">Expert Mentors</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">Hands-on Experience</span>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Programs;