import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Home from './components/Home';
import About from './components/About';
import Programs from './components/Programs';
import Membership from './components/Membership';
import Leadership from './components/Leadership';
import Events from './components/Events';
import Resources from './components/Resources';
import Gallery from './components/Gallery';
import EventGallery from './components/EventGallery';
import Contact from './components/Contact';
import Announcements from './components/Announcements';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import AccessDenied from './components/auth/AccessDenied';
import Footer from './components/Footer';

// Sections that require ANY login
const PROTECTED_SECTIONS = ['events', 'gallery', 'event-gallery', 'resources', 'contact', 'announcements', 'admin', 'user-dashboard'];
// Sections that require an admin role specifically
const ADMIN_ONLY_SECTIONS = ['admin'];

const AppContent = () => {
    const [activeSection, setActiveSection] = useState('home');
    const { isAuthenticated, loading, isAdmin } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated && PROTECTED_SECTIONS.includes(activeSection)) {
            setActiveSection('home');
        }
    }, [isAuthenticated, loading]); // eslint-disable-line react-hooks/exhaustive-deps

    const renderSection = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            );
        }

        // Not authenticated — block protected sections
        if (PROTECTED_SECTIONS.includes(activeSection) && !isAuthenticated) {
            return (
                <div className="max-w-md mx-auto px-4 py-20 text-center">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
                        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-5">
                            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
                        <p className="text-gray-500 text-sm mb-6">Please log in to access this section.</p>
                        <button
                            onClick={() => setActiveSection('home')}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            );
        }

        // Admin-only section accessed by a regular member → Access Denied
        if (ADMIN_ONLY_SECTIONS.includes(activeSection) && isAuthenticated && !isAdmin()) {
            return <AccessDenied setActiveSection={setActiveSection} />;
        }

        switch (activeSection) {
            case 'home': return <Home setActiveSection={setActiveSection} />;
            case 'about': return <About setActiveSection={setActiveSection} />;
            case 'programs': return <Programs setActiveSection={setActiveSection} />;
            case 'membership': return <Membership />;
            case 'leadership': return <Leadership />;
            case 'events': return <Events />;
            case 'resources': return <Resources />;
            case 'gallery': return <Gallery />;
            case 'event-gallery': return <EventGallery />;
            case 'announcements': return <Announcements />;
            case 'contact': return <Contact />;
            case 'admin': return <AdminDashboard setActiveSection={setActiveSection} />;
            case 'user-dashboard': return <UserDashboard setActiveSection={setActiveSection} />;
            default: return <Home setActiveSection={setActiveSection} />;
        }
    };

    const hideChrome = activeSection === 'admin';

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {!hideChrome && <Header activeSection={activeSection} setActiveSection={setActiveSection} />}
            {!hideChrome && <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />}
            <main className="flex-1">
                {renderSection()}
            </main>
            {!hideChrome && <Footer />}
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;