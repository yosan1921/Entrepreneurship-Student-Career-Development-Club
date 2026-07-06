import React, { useState, useEffect, useCallback, useRef } from 'react';
import { resourcesAPI } from '../services/api';
import ResourceCard from './resources/ResourceCard';

const ITEMS_PER_PAGE = 12;

// Toast notification component
const Toast = ({ toasts, onRemove }) => (
    <div className="fixed bottom-6 right-6 z-50 space-y-2">
        {toasts.map(t => (
            <div
                key={t.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm animate-slide-up
                    ${t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
            >
                {t.type === 'success' ? (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
                <span className="flex-1">{t.message}</span>
                <button onClick={() => onRemove(t.id)} className="opacity-70 hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        ))}
    </div>
);

const Resources = () => {
    const [resources, setResources] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [toasts, setToasts] = useState([]);
    const searchTimeout = useRef(null);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const fetchResources = useCallback(async (searchVal, category, pageNum) => {
        try {
            setLoading(true);
            const params = {
                page: pageNum,
                limit: ITEMS_PER_PAGE,
                ...(searchVal && { search: searchVal }),
                ...(category && category !== 'All' && { category })
            };
            const res = await resourcesAPI.getAll(params);
            if (res.data.success) {
                setResources(res.data.resources || []);
                setTotal(res.data.total || 0);
                setTotalPages(res.data.totalPages || 1);
            }
        } catch (err) {
            console.error('Error fetching resources:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch categories once
    useEffect(() => {
        resourcesAPI.getCategories()
            .then(res => {
                if (res.data.success) {
                    setCategories(res.data.categories.map(c => c.name));
                }
            })
            .catch(console.error);
    }, []);

    // Fetch resources when filters change
    useEffect(() => {
        fetchResources(search, activeCategory, page);
    }, [fetchResources, search, activeCategory, page]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setSearch(val);
            setPage(1);
        }, 400);
    };

    const handleCategoryChange = (cat) => {
        setActiveCategory(cat);
        setPage(1);
    };

    const handleDownload = async (resourceId) => {
        try {
            const url = resourcesAPI.downloadFile(resourceId);
            const a = document.createElement('a');
            a.href = url;
            a.click();
            addToast('Download started');
            // Optimistically increment count in UI
            setResources(prev => prev.map(r =>
                (r._id === resourceId || r.id === resourceId)
                    ? { ...r, downloadCount: (r.downloadCount || 0) + 1 }
                    : r
            ));
        } catch (err) {
            addToast('Download failed. Please try again.', 'error');
        }
    };

    const allCategories = ['All', ...categories];

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <Toast toasts={toasts} onRemove={(id) => setToasts(p => p.filter(t => t.id !== id))} />

            {/* Page Header */}
            <div className="mb-10">
                <span className="inline-block text-xs font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 px-4 py-1.5 rounded-full mb-4">
                    Resources
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    Member Resources
                </h1>
                <p className="mt-3 text-gray-500 max-w-xl leading-relaxed">
                    Access CV templates, career guides, research papers, and more — curated exclusively for ESCDC members.
                </p>
            </div>

            {/* Search + Stats bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
                <div className="relative flex-1 max-w-lg">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search resources…"
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-all"
                    />
                </div>
                <p className="text-sm text-gray-400 flex-shrink-0">
                    {loading ? 'Loading…' : `${total} resource${total !== 1 ? 's' : ''} found`}
                </p>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
                {allCategories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border
                            ${activeCategory === cat
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse">
                            <div className="h-1 bg-gray-200 rounded-t-2xl" />
                            <div className="p-5 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                                        <div className="h-4 bg-gray-200 rounded" />
                                    </div>
                                </div>
                                <div className="h-3 bg-gray-200 rounded" />
                                <div className="h-3 bg-gray-200 rounded w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : resources.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No resources found</h3>
                    <p className="text-gray-500 max-w-sm">
                        {search || activeCategory !== 'All'
                            ? 'Try adjusting your search or filters.'
                            : 'Resources will appear here once they are published by admins.'}
                    </p>
                    {(search || activeCategory !== 'All') && (
                        <button
                            onClick={() => { setSearch(''); setActiveCategory('All'); setPage(1); }}
                            className="mt-4 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {resources.map(resource => (
                        <ResourceCard
                            key={resource._id || resource.id}
                            resource={resource}
                            onDownload={handleDownload}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>

                    <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                            .reduce((acc, p, idx, arr) => {
                                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, idx) =>
                                p === '…' ? (
                                    <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-400 text-sm">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors
                                            ${page === p
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                    </div>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </section>
    );
};

export default Resources;
