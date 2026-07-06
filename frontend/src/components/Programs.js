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
            color: 'text-purple-600 bg-purple-50 border-purple-100',
            buttonColor: 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20',
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
                'Mentorship from founders',
                'Investor networking'
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
            color: 'text-blue-600 bg-blue-50 border-blue-100',
            buttonColor: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
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
            color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
            buttonColor: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
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
            title: 'Industry & Engagement',
            shortDesc: 'Connect with professionals and give back',
            fullDesc: 'Bridge the gap between academia and industry while making a positive impact in your community. Network with professionals, visit companies, and participate in meaningful community initiatives.',
            icon: '🤝',
            color: 'text-rose-600 bg-rose-50 border-rose-100',
            buttonColor: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20',
            items: [
                'Guest speaker sessions with industry leaders',
                'Company visits and site tours',
                'Community service initiatives',
                'Industry networking events',
                'Professional mentorship programs'
            ],
            benefits: [
                'Direct access to professionals',
                'Internship opportunities',
                'Community impact projects',
                'Network building'
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
                            <span className="text-xl">🛠️</span>
                            <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">Our Programs</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight uppercase tracking-tight">
                            Programs &amp; <span className="text-gradient">Activities</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-sans">
                            Comprehensive training programs designed to transform students into successful
                            entrepreneurs and professional leaders
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
            </section>

            {/* Programs Grid */}
            <section className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
                        {programs.map((program) => (
                            <div
                                key={program.id}
                                className={`group relative bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:border-slate-200 transition-all duration-300 shadow-premium hover:shadow-xl ${activeProgram === program.id ? 'ring-2 ring-indigo-500 border-transparent' : ''
                                    }`}
                            >
                                <div className="p-8 sm:p-10">
                                    {/* Icon Header */}
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${program.color} transition-all duration-300 group-hover:scale-105 text-3xl`}>
                                        {program.icon}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
                                        {program.title}
                                    </h3>

                                    {/* Short Description */}
                                    <p className="text-slate-500 font-sans mb-4 text-sm font-medium">
                                        {program.shortDesc}
                                    </p>

                                    {/* Full Description */}
                                    <p className="text-slate-600 font-sans text-sm leading-relaxed mb-6">
                                        {program.fullDesc}
                                    </p>

                                    {/* Collapsible Info Section */}
                                    <div className="space-y-6">
                                        {/* What You'll Learn */}
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
                                                </svg>
                                                What You'll Learn
                                            </h4>
                                            <ul className="space-y-2 font-sans text-slate-500 text-sm">
                                                {program.items.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="text-indigo-500 mt-1">•</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Benefits */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                                            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21" />
                                                </svg>
                                                Benefits
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans text-slate-500 text-sm">
                                                {program.benefits.map((benefit, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>{benefit}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Testimonial */}
                                        <div className="bg-white rounded-2xl p-5 border border-slate-100 relative">
                                            <div className="flex items-start gap-3">
                                                <span className="text-3xl text-indigo-500/20 absolute right-4 top-2 font-serif">“</span>
                                                <div className="font-sans">
                                                    <p className="text-slate-600 italic text-sm mb-3">
                                                        "{program.testimonial.quote}"
                                                    </p>
                                                    <div className="text-[11px] font-semibold uppercase tracking-wider">
                                                        <span className="text-slate-900">{program.testimonial.author}</span>
                                                        <span className="text-slate-400 mx-1.5">|</span>
                                                        <span className="text-slate-500">{program.testimonial.role}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Toggle State Button */}
                                    <button
                                        onClick={() => {
                                            setActiveProgram(activeProgram === program.id ? null : program.id);
                                        }}
                                        className={`mt-8 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all duration-300 ${activeProgram === program.id
                                            ? `${program.buttonColor} text-white shadow-lg hover:scale-102`
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                    >
                                        <svg className={`w-4 h-4 transition-transform duration-300 ${activeProgram === program.id ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>{activeProgram === program.id ? 'Selected' : 'Read More'}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Upcoming Events */}
            <section className="bg-white py-16 sm:py-24 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold tracking-widest text-[#4F46E5] uppercase bg-[#4F46E5]/10 px-4 py-1.5 rounded-full">
                            Calendar
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-4 tracking-tight">
                            Upcoming Events
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {upcomingEvents.map((event, index) => (
                            <div
                                key={index}
                                className="group bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-3xl p-8 transition-all duration-300 shadow-premium hover:shadow-lg hover:-translate-y-1"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-indigo-600/10 text-[#4F46E5] rounded-xl flex items-center justify-center font-extrabold text-sm group-hover:scale-105 transition-all">
                                        {event.date.split(' ')[1] || event.date}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{event.type}</div>
                                        <div className="text-xs text-slate-400 font-sans mt-0.5">{event.date}</div>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">
                                    {event.title}
                                </h3>
                                <button className="text-indigo-600 font-bold text-xs uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
                                    <span>Register Now</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-slate-950 py-20 relative overflow-hidden text-white border-t border-slate-900">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-500 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 border border-white/10 rounded-2xl mb-8">
                        <svg className="w-8 h-8 text-indigo-400 animate-bounce-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13M12 6.253C10.832 5.477 9.246 5 7.5 5" />
                        </svg>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 tracking-tight">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-lg text-slate-300 mb-10 leading-relaxed font-sans max-w-2xl mx-auto font-medium">
                        Join our programs and unlock your full potential. Whether you want to start a business,
                        advance your career, or develop leadership skills, we have the right program for you.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={handleEnroll}
                            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white text-slate-950 px-8 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all duration-300 shadow-xl hover:scale-103"
                        >
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span>Enroll Now</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Programs;