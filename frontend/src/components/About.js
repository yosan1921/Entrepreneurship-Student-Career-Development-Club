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
            color: 'from-yellow-500 to-orange-500'
        },
        {
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            title: 'Collaboration',
            description: 'Building strong networks and partnerships for mutual growth',
            color: 'from-blue-500 to-indigo-500'
        },
        {
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
            title: 'Leadership',
            description: 'Developing the next generation of ethical and effective leaders',
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
            title: 'Excellence',
            description: 'Striving for the highest standards in everything we do',
            color: 'from-green-500 to-teal-500'
        },
    ];

    const stats = [
        { value: '500+', label: 'Active Members', icon: '👥' },
        { value: '50+', label: 'Events Hosted', icon: '📅' },
        { value: '20+', label: 'Startups Launched', icon: '🚀' },
        { value: '100%', label: 'Student Led', icon: '🎓' },
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="text-sm font-semibold">About ESCDC</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Empowering Future Leaders
                        </h1>
                        <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                            The Entrepreneurship and Student Career Development Club (ESCDC) is Haramaya University's
                            premier platform for nurturing entrepreneurial talent and building future-ready professionals.
                        </p>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb" />
                    </svg>
                </div>
            </section>

            {/* Who We Are Section */}
            <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Text Content */}
                        <div>
                            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-2 mb-4">
                                <span className="text-sm font-semibold">Who We Are</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                                A Student-Led Movement for Change
                            </h2>
                            <p className="text-lg text-gray-700 leading-relaxed mb-6">
                                ESCDC is an officially recognized student club at Haramaya University, open to students
                                from all colleges and departments who are passionate about career success, business
                                creation, and leadership development.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed mb-8">
                                We believe that every student has the potential to become a successful entrepreneur or
                                professional leader. Our mission is to unlock that potential through comprehensive training,
                                mentorship, networking opportunities, and hands-on experience.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-semibold">Student-Led</span>
                                </div>
                                <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-semibold">Officially Recognized</span>
                                </div>
                                <div className="flex items-center gap-2 text-purple-700 bg-purple-50 px-4 py-2 rounded-lg">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-semibold">All Departments Welcome</span>
                                </div>
                            </div>
                        </div>

                        {/* Image Placeholder */}
                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl overflow-hidden shadow-2xl">
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center p-8">
                                        <div className="text-6xl mb-4">🎓</div>
                                        <p className="text-gray-600 font-semibold">Team Photo Placeholder</p>
                                        <p className="text-sm text-gray-500 mt-2">ESCDC Members</p>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative Elements */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-600 rounded-full opacity-20 blur-2xl"></div>
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-600 rounded-full opacity-20 blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white py-16 sm:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Our Impact in Numbers
                        </h2>
                        <p className="text-lg text-gray-600">
                            Making a real difference in the student community
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 text-center border-2 border-gray-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                            >
                                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                                    {stat.icon}
                                </div>
                                <div className="text-4xl font-bold text-gray-900 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-gray-600 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-2 mb-4">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold">Our Journey</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Milestones & Achievements
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            From humble beginnings to a thriving community of innovators
                        </p>
                    </div>

                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-600 to-indigo-600"></div>

                        <div className="space-y-12">
                            {milestones.map((milestone, index) => (
                                <div
                                    key={index}
                                    className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                        } flex-col gap-8`}
                                >
                                    {/* Content Card */}
                                    <div className="md:w-1/2 w-full">
                                        <div className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                                            }`}>
                                            <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-3">
                                                {milestone.year}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                {milestone.title}
                                            </h3>
                                            <p className="text-gray-600">
                                                {milestone.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Center Dot */}
                                    <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>

                                    {/* Spacer */}
                                    <div className="hidden md:block md:w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-white py-16 sm:py-20 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Our Core Values
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            The principles that guide everything we do
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                            >
                                <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={value.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 py-16 sm:py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        Ready to Join Our Community?
                    </h2>
                    <p className="text-xl text-blue-100 mb-10 leading-relaxed">
                        Become part of a vibrant community of aspiring entrepreneurs and future leaders.
                        Your journey to success starts here!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => setActiveSection && setActiveSection('membership')}
                            className="group flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span>Become a Member</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                        <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Contact Us</span>
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default About;