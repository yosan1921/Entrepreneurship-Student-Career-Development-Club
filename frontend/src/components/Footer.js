import { useState, useEffect } from 'react';
import { systemSettingsAPI } from '../services/api';

const Footer = () => {
    const [socialLinks, setSocialLinks] = useState({
        facebook_url: '',
        instagram_url: '',
        linkedin_url: '',
        twitter_url: ''
    });

    useEffect(() => {
        const fetchSocialLinks = async () => {
            try {
                const response = await systemSettingsAPI.getPublicSettings();
                if (response.data.success) {
                    const settings = response.data.data;
                    setSocialLinks({
                        facebook_url: settings.facebook_url || '',
                        instagram_url: settings.instagram_url || '',
                        linkedin_url: settings.linkedin_url || '',
                        twitter_url: settings.twitter_url || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching social links:', error);
            }
        };

        fetchSocialLinks();
    }, []);

    return (
        <footer className="bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#2563eb] text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* About Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                                <span className="text-lg font-bold">C</span>
                            </div>
                            <h3 className="text-xl font-bold">Community Hub</h3>
                        </div>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            Building Together, Growing Together. Empowering the next generation of leaders and entrepreneurs.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            {['About Us', 'Programs', 'Events', 'Resources'].map((link) => (
                                <li key={link}>
                                    <button className="text-blue-100 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        {link}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-3 text-sm text-blue-100">
                            <li className="flex items-start gap-2">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Haramaya University</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>info@escdc.edu</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>+251 XXX XXX XXX</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
                        <div className="flex gap-3">
                            {[
                                { icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z', label: 'Facebook', url: socialLinks.facebook_url },
                                { icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z', label: 'Twitter', url: socialLinks.twitter_url },
                                { icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z', label: 'LinkedIn', url: socialLinks.linkedin_url }
                            ].map((social, index) => (
                                social.url ? (
                                    <a
                                        key={index}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                                        aria-label={social.label}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d={social.icon} />
                                        </svg>
                                    </a>
                                ) : (
                                    <button
                                        key={index}
                                        className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                                        aria-label={social.label}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d={social.icon} />
                                        </svg>
                                    </button>
                                )
                            ))}
                        </div>
                        <p className="text-blue-100 text-sm mt-4">
                            Stay connected with our community and get the latest updates.
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/20 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-blue-100 text-center md:text-left">
                            © {new Date().getFullYear()} Haramaya University – Entrepreneurship and Student Career Development Club. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm text-blue-100">
                            <button className="hover:text-white transition-colors">Privacy Policy</button>
                            <button className="hover:text-white transition-colors">Terms of Service</button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
