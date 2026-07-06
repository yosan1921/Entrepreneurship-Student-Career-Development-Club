import React from 'react';

const About = ({ setActiveSection }) => {
    const milestones = [
        { year: '2020', title: 'Club Founded', description: 'ESCDC was established at Haramaya University' },
        { year: '2021', title: '100+ Members', description: 'Reached our first major membership milestone' },
        { year: '2022', title: 'First Startup', description: 'Launched our first student-led startup incubation' },
        { year: '2023', title: 'Industry Partnerships', description: 'Established partnerships with leading companies' },
        { year: '2024', title: '500+ Members', description: 'Growing community of aspiring entrepreneurs' },
    ];

    const values = [
        {
            icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
            title: 'Innovation',
            description: 'We foster creativity and encourage students to think outside the box',
            color: 'text-amber-600 bg-amber-50 border-amber-100/50'
        },
        {
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            title: 'Collaboration',
            description: 'Building strong networks and partnerships for mutual growth',
            color: 'text-[#4F46E5] bg-indigo-50 border-indigo-100/50'
        },
        {
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
            title: 'Leadership',
            description: 'Developing the next generation of ethical and effective leaders',
            color: 'text-purple-600 bg-purple-50 border-purple-100/50'
        },
        {
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
            title: 'Excellence',
            description: 'Striving for the highest standards in everything we do',
            color: 'text-emerald-600 bg-emerald-50 border-emerald-100/50'
        },
    ];

    const stats = [
        { value: '500+', label: 'Active Members', icon: '👥' },
        { value: '50+', label: 'Events Hosted', icon: '📅' },
        { value: '20+', label: 'Startups Incubated', icon: '🚀' },
        { value: '100%', label: 'Student Led', icon: '🎓' },
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden py-20 sm:py-28">
                {/* Decorative background orbs */}
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                    <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-500 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full px-4 py-2 mb-6 shadow-premium">
                            <span className="text-xl">✨</span>
                            <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">About ESCDC</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight uppercase tracking-tight">
                            Empowering <span className="text-gradient">Future Leaders</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-sans">
                            The Entrepreneurship and Student Career Development Club (ESCDC) is Haramaya University's
                            premier platform for nurturing entrepreneurial talent and building future-ready professionals.
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
            </section>

            {/* Who We Are Section */}
            <section className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Text Content */}
                        <div>
                            <span className="text-xs font-bold tracking-widest text-[#4F46E5] uppercase bg-[#4F46E5]/10 px-4 py-1.5 rounded-full">
                                Who We Are
                            </span>
                            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-4 mb-6 tracking-tight">
                                A Student-Led Movement <br />
                                for Professional Change
                            </h2>
                            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6 font-sans">
                                ESCDC is an officially recognized student club at Haramaya University, open to students
                                from all colleges and departments who are passionate about career success, business
                                creation, and leadership development.
                            </p>
                            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 font-sans">
                                We believe that every student has the potential to become a successful entrepreneur or
                                professional leader. Our mission is to unlock that potential through comprehensive training,
                                mentorship, networking opportunities, and hands-on experience.
                            </p>
                            <div className="flex flex-wrap gap-3 font-sans text-sm font-semibold">
                                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100/50">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Student-Led</span>
                                </div>
                                <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100/50">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
                                    </svg>
                                    <span>Officially Recognized</span>
                                </div>
                                <div className="flex items-center gap-2 text-purple-700 bg-purple-50 px-4 py-2.5 rounded-xl border border-purple-100/50">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                                    </svg>
                                    <span>All Departments Welcome</span>
                                </div>
                            </div>
                        </div>

                        {/* Visual Image Block */}
                        <div className="relative">
                            <div className="aspect-[4/3] bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 p-8 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-6xl mb-4 animate-bounce-subtle">🎓</div>
                                    <h4 className="text-xl font-bold text-white tracking-wide">ESCDC Members Community</h4>
                                    <p className="text-slate-400 font-sans text-xs mt-2 uppercase tracking-widest">Haramaya University Chapter</p>
                                </div>
                            </div>
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-500 rounded-full opacity-10 blur-2xl"></div>
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-sky-500 rounded-full opacity-10 blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact stats section */}
            <section className="py-16 sm:py-24 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold tracking-widest text-[#4F46E5] uppercase bg-[#4F46E5]/10 px-4 py-1.5 rounded-full">
                            Our Impact
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-4 tracking-tight">
                            Impact in Numbers
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="group bg-slate-50 border border-slate-100 rounded-3xl p-8 text-center transition-all duration-300 shadow-premium hover:shadow-lg hover:-translate-y-1 hover:border-indigo-100/50"
                            >
                                <div className="text-4xl mb-4 group-hover:scale-105 transition-transform duration-300">
                                    {stat.icon}
                                </div>
                                <div className="text-4xl font-extrabold text-slate-900 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-slate-500 font-semibold uppercase tracking-wider text-xs font-sans">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold tracking-widest text-[#4F46E5] uppercase bg-[#4F46E5]/10 px-4 py-1.5 rounded-full">
                            Our History
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-4 tracking-tight">
                            Milestones & Achievements
                        </h2>
                    </div>

                    <div className="relative">
                        {/* Vertical Timeline Line */}
                        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-slate-200"></div>

                        <div className="space-y-12">
                            {milestones.map((milestone, index) => (
                                <div
                                    key={index}
                                    className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                        } flex-col gap-8 md:gap-0`}
                                >
                                    {/* Content Card */}
                                    <div className="md:w-1/2 w-full px-0 md:px-8">
                                        <div className={`bg-white rounded-3xl p-8 border border-slate-100 shadow-premium hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                                            }`}>
                                            <div className="inline-block bg-[#4F46E5] text-white px-4 py-1 rounded-full text-xs font-bold mb-4 font-sans tracking-wide">
                                                {milestone.year}
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                                {milestone.title}
                                            </h3>
                                            <p className="text-slate-500 font-sans text-sm leading-relaxed">
                                                {milestone.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Center Dot Indicator */}
                                    <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-5 h-5 bg-white rounded-full border-4 border-[#4F46E5] shadow-md z-10"></div>

                                    {/* Spacer */}
                                    <div className="hidden md:block md:w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-16 sm:py-24 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold tracking-widest text-[#4F46E5] uppercase bg-[#4F46E5]/10 px-4 py-1.5 rounded-full">
                            Principles
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-4 tracking-tight">
                            Our Core Values
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="group bg-slate-50 border border-slate-100 rounded-3xl p-8 transition-all duration-300 shadow-premium hover:shadow-lg hover:-translate-y-1 hover:border-indigo-100/50"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${value.color} transition-all duration-300 group-hover:scale-105`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={value.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-sans text-sm">{value.description}</p>
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
                    <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 tracking-tight">
                        Ready to Join Our Community?
                    </h2>
                    <p className="text-lg text-slate-300 mb-10 leading-relaxed font-sans max-w-2xl mx-auto">
                        Become part of a vibrant community of aspiring entrepreneurs and future leaders at Haramaya University.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => setActiveSection && setActiveSection('membership')}
                            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white text-slate-950 px-8 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all duration-300 shadow-xl hover:scale-103"
                        >
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span>Become a Member</span>
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
                </div>
            </section>
        </div>
    );
};

export default About;