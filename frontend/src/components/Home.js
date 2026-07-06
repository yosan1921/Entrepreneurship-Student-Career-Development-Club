import React from 'react';

const Home = ({ setActiveSection }) => {
    const handleBecomeMember = () => {
        if (setActiveSection) {
            setActiveSection('membership');
        }
    };

    const handleLearnMore = () => {
        if (setActiveSection) {
            setActiveSection('about');
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden py-24 sm:py-32 lg:py-40">
                {/* Decorative Background Elements (Orbs & Grid) */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-sky-500/20 rounded-full blur-[140px]"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* University Badge */}
                        <div className="inline-flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full px-5 py-2.5 mb-10 shadow-premium animate-fade-in">
                            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b]"></div>
                            <span className="text-xs sm:text-sm font-bold tracking-wider text-slate-200 uppercase">
                                Haramaya University
                            </span>
                        </div>

                        {/* Logo */}
                        <div className="flex justify-center mb-10 animate-fade-in">
                            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-[2rem] overflow-hidden bg-white/5 backdrop-blur-sm shadow-2xl border border-white/10 p-1">
                                <img
                                    src="/logo.png"
                                    alt="ESCDC Logo"
                                    className="w-full h-full object-cover rounded-[1.8rem]"
                                />
                            </div>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight uppercase">
                            Entrepreneurship <br className="hidden sm:inline" />
                            <span className="text-gradient">Student Career</span> <br />
                            <span className="text-gradient-gold">Development Club</span>
                        </h1>

                        {/* Tagline */}
                        <p className="text-lg sm:text-xl font-medium text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Empowering Students. Building Careers. Creating Entrepreneurs. A student-led platform dedicated to fostering startup mindset, leadership, and professional growth.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={handleBecomeMember}
                                className="group w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold hover:from-indigo-500 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 hover:scale-103"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                <span>Join ESCDC</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </button>
                            <button
                                onClick={handleLearnMore}
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/40 hover:border-slate-600 backdrop-blur-sm transition-all duration-300 hover:scale-103"
                            >
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Smooth Transition Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
            </section>

            {/* Welcome Section */}
            <section className="-mt-10 relative z-10 py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="bg-white rounded-[2.5rem] shadow-premium p-8 sm:p-14 border border-slate-100">
                        <div className="text-center mb-12">
                            <span className="text-xs font-bold tracking-widest text-[#4F46E5] uppercase bg-[#4F46E5]/10 px-4 py-1.5 rounded-full">
                                Welcome to ESCDC
                            </span>
                            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-4 tracking-tight">
                                Building the Next Generation
                            </h2>
                            <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-sky-400 mx-auto mt-6 rounded-full"></div>
                        </div>

                        <p className="text-lg text-slate-600 leading-relaxed mb-16 text-center max-w-4xl mx-auto font-sans">
                            The Entrepreneurship and Student Career Development Club (ESCDC) of Haramaya University
                            is a student-led academic and professional development platform dedicated to empowering
                            students with an entrepreneurial mindset, career readiness skills, and leadership capacity.
                        </p>

                        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
                            {/* Vision Card */}
                            <div className="group relative bg-gradient-to-b from-slate-50 to-white rounded-3xl p-8 sm:p-10 border border-slate-100 hover:border-indigo-200 transition-all duration-300 shadow-premium hover:shadow-xl hover:-translate-y-1">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl opacity-40 group-hover:opacity-75 transition-opacity"></div>
                                <div className="relative">
                                    <div className="w-14 h-14 bg-indigo-600/10 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
                                    <p className="text-slate-600 leading-relaxed font-sans">
                                        To create a generation of innovative, employable, and entrepreneurial graduates who
                                        contribute meaningfully to national and global development.
                                    </p>
                                </div>
                            </div>

                            {/* Mission Card */}
                            <div className="group relative bg-gradient-to-b from-slate-50 to-white rounded-3xl p-8 sm:p-10 border border-slate-100 hover:border-emerald-200 transition-all duration-300 shadow-premium hover:shadow-xl hover:-translate-y-1">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl opacity-40 group-hover:opacity-75 transition-opacity"></div>
                                <div className="relative">
                                    <div className="w-14 h-14 bg-emerald-600/10 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
                                    <ul className="space-y-4 font-sans text-slate-600">
                                        {[
                                            'Promote an entrepreneurship culture among students',
                                            'Enhance career development and leadership skills',
                                            'Connect students with industry professionals',
                                            'Support student-led innovations and business ideas'
                                        ].map((item, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 sm:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold tracking-widest text-[#4F46E5] uppercase bg-[#4F46E5]/10 px-4 py-1.5 rounded-full">
                            Member Benefits
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-4 tracking-tight">
                            Why Join Us?
                        </h2>
                        <p className="text-slate-500 max-w-xl mx-auto mt-4 font-sans">
                            Discover the professional advantages and career resources of being part of our vibrant community
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                                title: 'Learning Resources',
                                description: 'Access exclusive files, resume checklists, and startup pitch toolkits.',
                                color: 'text-purple-600 bg-purple-50 border-purple-100/50'
                            },
                            {
                                icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
                                title: 'Networking',
                                description: 'Connect directly with peers, guest mentors, and career development experts.',
                                color: 'text-blue-600 bg-blue-50 border-blue-100/50'
                            },
                            {
                                icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                                title: 'Career Growth',
                                description: 'Develop soft skills and practical experience targeting leading job positions.',
                                color: 'text-amber-600 bg-amber-50 border-amber-100/50'
                            },
                            {
                                icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
                                title: 'Innovation',
                                description: 'Collaborate on startup projects and commercialize your creative ideas.',
                                color: 'text-rose-600 bg-rose-50 border-rose-100/50'
                            },
                            {
                                icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                                title: 'Events & Seminars',
                                description: 'Participate in bootcamps, pitch stages, and exclusive workshops.',
                                color: 'text-emerald-600 bg-emerald-50 border-emerald-100/50'
                            },
                            {
                                icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
                                title: 'Leadership Roles',
                                description: 'Lead club projects, manage teams, and refine communication abilities.',
                                color: 'text-indigo-600 bg-indigo-50 border-indigo-100/50'
                            }
                        ].map((feature, index) => (
                            <div key={index} className="group bg-white rounded-3xl p-8 border border-slate-100 hover:border-slate-200 transition-all duration-300 shadow-premium hover:shadow-lg hover:-translate-y-1">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${feature.color} transition-all duration-300 group-hover:scale-105`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-sans text-sm">{feature.description}</p>
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 tracking-tight">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-lg text-slate-300 mb-10 leading-relaxed font-sans max-w-2xl mx-auto">
                        Join hundreds of ambitious Haramaya University students who are building their careers and starting business ideas.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={handleBecomeMember}
                            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white text-slate-950 px-8 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all duration-300 shadow-xl hover:scale-103"
                        >
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span>Join ESCDC Now</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>

                        <button
                            onClick={() => setActiveSection && setActiveSection('contact')}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/50 backdrop-blur-sm transition-all duration-300 hover:scale-103"
                        >
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Contact Us</span>
                        </button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-12 flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-slate-400 font-sans text-xs uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Free to Join</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>500+ Members</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Trusted by Students</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
