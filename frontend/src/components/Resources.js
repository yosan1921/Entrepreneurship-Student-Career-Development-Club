import React from 'react';

const Resources = () => {
    const resources = [
        { title: 'CV & Cover Letter Templates', icon: '📄', color: 'bg-indigo-50 border-indigo-100/50 text-indigo-600' },
        { title: 'Entrepreneurship Guides', icon: '📚', color: 'bg-emerald-50 border-emerald-100/50 text-emerald-600' },
        { title: 'Career Planning Materials', icon: '🎯', color: 'bg-amber-50 border-amber-100/50 text-amber-600' }
    ];

    return (
        <section className="max-w-7xl mx-auto px-6 py-12 sm:py-20">
            <div className="bg-white rounded-[2.5rem] shadow-premium p-8 sm:p-14 border border-slate-100">
                <div className="mb-10 text-center sm:text-left">
                    <span className="text-xs font-bold tracking-widest text-[#4F46E5] uppercase bg-[#4F46E5]/10 px-4 py-1.5 rounded-full">
                        Resources
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
                        Member Resources
                    </h2>
                    <p className="text-slate-500 font-sans text-sm mt-2 max-w-xl leading-relaxed">
                        Access exclusive CV templates, business guides, and planning toolkits curated to guide your professional milestones.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {resources.map((resource, index) => (
                        <div
                            key={index}
                            className="group bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-3xl p-8 transition-all duration-300 shadow-premium hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${resource.color} transition-all duration-300 group-hover:scale-105 text-2xl`}>
                                {resource.icon}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors">
                                {resource.title}
                            </h3>
                            <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 uppercase tracking-wider mt-6 font-sans">
                                <span>Download File</span>
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Resources;