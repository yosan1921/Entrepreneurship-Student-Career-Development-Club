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
import Footer from './components/Footer';

// Protected sections that require login
const PROTECTED_SECTIONS = ['events', 'gallery', 'event-gallery', 'resources', 'contact', 'announcements', 'admin'];

function AppContent() {
    const [activeSection, setActiveSection] = useState('home');
    const { isAuthenticated } = useAuth();

    // Redirect to home if user tries to access protected section without login
    useEffect(() => {
        if (!isAuthenticated && PROTECTED_SECTIONS.includes(activeSection)) {
            setActiveSection('home');
        }
    }, [isAuthenticated, activeSection]);

    const renderSection = () => {
        // Check if section is protected and user is not authenticated
        if (PROTECTED_SECTIONS.includes(activeSection) && !isAuthenticated) {
            return (
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <svg className="w-16 h-16 mx-auto text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
                        <p className="text-gray-600 mb-6">
                            Please login to access this section. This content is only available to registered members.
                        </p>
                        <button
                            onClick={() => setActiveSection('home')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            );
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
            case 'admin': return <AdminDashboard />;
            default: return <Home setActiveSection={setActiveSection} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header activeSection={activeSection} setActiveSection={setActiveSection} />
            <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
            <main className="flex-1">
                {renderSection()}
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;