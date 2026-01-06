import React from 'react';

const Resources = () => {
    const resources = [
        { title: 'CV & Cover Letter Templates', icon: '📄', color: 'from-blue-50 to-blue-100' },
        { title: 'Entrepreneurship Guides', icon: '📚', color: 'from-green-50 to-green-100' },
        { title: 'Career Planning Materials', icon: '🎯', color: 'from-purple-50 to-purple-100' }
    ];

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-8">Resources</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map((resource, index) => (
                        <div
                            key={index}
                            className={`bg-gradient-to-br ${resource.color} rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
                        >
                            <div className="text-4xl mb-4">{resource.icon}</div>
                            <h3 className="text-lg font-bold text-blue-900">{resource.title}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Resources;