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
        <footer className="bg-slate-950 text-slate-200 border-t border-slate-900 mt-auto font-sans text-sm">
            <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20 lg:px-8">
                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-slate-900">
                    {/* About Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-0.5 shadow-inner">
                                <img src="/logo.png" alt="ESCDC Logo" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-lg font-bold tracking-tight text-white uppercase">ESCDC</h3>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                            Building Together, Growing Together. Empowering Haramaya University students with career readiness and entrepreneurial capacity.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest">Quick Links</h4>
                        <ul className="space-y-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {['About Us', 'Programs', 'Events', 'Resources'].map((link) => (
                                <li key={link}>
                                    <button className="hover:text-white transition-colors flex items-center gap-1.5 group">
                                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                                        <span>{link}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest">Contact Us</h4>
                        <ul className="space-y-3.5 text-xs text-slate-400 font-medium">
                            <li className="flex items-start gap-2.5">
                                <span className="text-base shrink-0">📍</span>
                                <span className="leading-relaxed">Haramaya University Main Campus, Building II, Office No. 12</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <span className="text-base shrink-0">📧</span>
                                <a href="mailto:info@escdc.edu" className="hover:text-white transition-colors">info@escdc.edu</a>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <span className="text-base shrink-0">📞</span>
                                <span>+251 XXX XXX XXX</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest">Follow Us</h4>
                        <div className="flex gap-2.5">
                            {[
                                { icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z', label: 'Facebook', url: socialLinks.facebook_url },
                                { icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z', label: 'Twitter', url: socialLinks.twitter_url },
                                { icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z', label: 'LinkedIn', url: socialLinks.linkedin_url }
                            ].map((social, index) => (
                                <a
                                    key={index}
                                    href={social.url || '#'}
                                    target={social.url ? '_blank' : '_self'}
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
                                    aria-label={social.label}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d={social.icon} />
                                    </svg>
                                </a>
                            ))}
                        </div>
                        <p className="text-slate-500 text-xs font-sans mt-3">
                            Stay connected with our community and get the latest updates.
                        </p>
                    </div>
                </div>

                {/* Bottom copyright block */}
                <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500 font-sans">
                    <p className="text-center md:text-left">
                        © {new Date().getFullYear()} Haramaya University – Entrepreneurship and Student Career Development Club. All rights reserved.
                    </p>
                    <div className="flex gap-6 font-semibold uppercase tracking-wider text-[10px] text-slate-400">
                        <button className="hover:text-white transition-colors">Privacy Policy</button>
                        <button className="hover:text-white transition-colors">Terms of Service</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
