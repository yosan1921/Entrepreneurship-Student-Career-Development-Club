import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navigation = ({ activeSection, setActiveSection }) => {
    const { isAuthenticated, hasRole } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Public navigation items (before login)
    const publicNavItems = [
        { id: 'home', label: 'Home', description: 'Welcome to ESCDC Community' },
        { id: 'about', label: 'About', description: 'Learn about our mission and vision' },
        { id: 'programs', label: 'Programs', description: 'Explore our community programs' },
        { id: 'leadership', label: 'Leadership', description: 'Meet our leadership team' }
    ];

    // Member navigation items (after login)
    const memberNavItems = [
        { id: 'home', label: 'Home', description: 'Dashboard and updates' },
        { id: 'membership', label: 'Membership', description: 'Manage your membership profile' },
        { id: 'events', label: 'Events', description: 'Browse and register for events' },
        { id: 'gallery', label: 'Gallery', description: 'View community photos and videos' },
        { id: 'resources', label: 'Resources', description: 'Access member resources and documents' },
        { id: 'contact', label: 'Contact', description: 'Get in touch with us' },
        { id: 'announcements', label: 'Announcements', description: 'Latest news and updates' },
        { id: 'event-gallery', label: 'Event Files', description: 'Event documents and media' }
    ];

    // Choose nav items based on authentication
    let navItems = isAuthenticated ? memberNavItems : publicNavItems;

    // Add admin dashboard for authenticated users with admin roles
    if (isAuthenticated && hasRole(['super_admin', 'admin', 'editor'])) {
        navItems = [...navItems, { id: 'admin', label: 'Admin Dashboard', description: 'Manage system settings' }];
    }

    const handleNavClick = (itemId) => {
        setActiveSection(itemId);
        setMobileMenuOpen(false);
    };

    const getIcon = (id) => {
        const icons = {
            home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
            about: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
            programs: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
            membership: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
            leadership: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
            events: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
            resources: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
            announcements: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />,
            gallery: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
            'event-gallery': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />,
            contact: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
            admin: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        };
        return icons[id] || icons.home;
    };

    return (
        <nav className="sticky top-16 sm:top-20 z-40 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Mobile menu button */}
                <div className="flex lg:hidden justify-between items-center py-3">
                    <span className="text-gray-700 font-semibold">
                        {isAuthenticated ? 'Member Menu' : 'Menu'}
                    </span>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="text-gray-600 p-2 rounded-md hover:bg-gray-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Desktop menu */}
                <div className="hidden lg:flex lg:items-center lg:justify-center lg:space-x-1">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`
                                flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg
                                ${activeSection === item.id
                                    ? 'text-[#0d47a1] bg-blue-50'
                                    : 'text-gray-600 hover:text-[#0d47a1] hover:bg-gray-50'
                                }
                            `}
                            title={item.description}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {getIcon(item.id)}
                            </svg>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden pb-3 space-y-1">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg
                                    ${activeSection === item.id
                                        ? 'text-[#0d47a1] bg-blue-50'
                                        : 'text-gray-600 hover:text-[#0d47a1] hover:bg-gray-50'
                                    }
                                `}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {getIcon(item.id)}
                                </svg>
                                <div className="text-left">
                                    <div>{item.label}</div>
                                    <div className="text-xs text-gray-500">{item.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </nav >
    );
};

export default Navigation;
