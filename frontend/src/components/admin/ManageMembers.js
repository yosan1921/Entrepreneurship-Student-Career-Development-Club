import React, { useState, useEffect, useMemo } from 'react';
import { membersAPI } from '../../services/api';

const ManageMembers = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('joined_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await membersAPI.getAll();
            if (response.data.success) {
                setMembers(response.data.members);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Memoized filtering and sorting to optimize performance
    const processedMembers = useMemo(() => {
        const filtered = members.filter(member =>
            member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.department?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'joined_at') {
                aValue = new Date(aValue || 0).getTime();
                bValue = new Date(bValue || 0).getTime();
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [members, searchTerm, sortBy, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(processedMembers.length / itemsPerPage);
    const paginatedMembers = processedMembers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when search or sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortBy, sortOrder, itemsPerPage]);

    const exportToCSV = () => {
        const csvContent = [
            ['Name', 'Email', 'Department', 'Registration Date', 'Status'],
            ...processedMembers.map(member => [
                member.full_name,
                member.email,
                member.department || '',
                formatDate(member.joined_at),
                member.status || 'Active'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `escdc-members-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'approved':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'rejected':
            case 'inactive':
                return 'bg-rose-100 text-rose-700 border-rose-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-semibold tracking-wider uppercase text-sm">Loading Members...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans pb-24">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Member Directory</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage and view all registered club members</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button 
                            onClick={fetchMembers}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Refresh
                        </button>
                        <button 
                            onClick={exportToCSV}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm shadow-indigo-600/20"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Filters & Stats Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Search & Sort Controls */}
                    <div className="lg:col-span-3 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, email, or department..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none w-full sm:w-48 pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                                >
                                    <option value="joined_at">Sort by Date</option>
                                    <option value="full_name">Sort by Name</option>
                                    <option value="email">Sort by Email</option>
                                    <option value="department">Sort by Dept</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                            <button
                                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="p-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                                title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                            >
                                <svg className={`w-5 h-5 transition-transform duration-300 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-2xl shadow-lg shadow-indigo-600/20 text-white flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                            <span className="text-indigo-100 text-sm font-medium">Total Members</span>
                            <span className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <svg className="w-5 h-5 text-indigo-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </span>
                        </div>
                        <div className="mt-4 flex items-end gap-2">
                            <span className="text-4xl font-black tracking-tight">{members.length}</span>
                            {searchTerm && (
                                <span className="text-sm text-indigo-200 mb-1">({processedMembers.length} filtered)</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Mobile View (Cards) */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {paginatedMembers.map(member => (
                            <div key={member.id || member._id} className="p-5 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
                                            {member.full_name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">{member.full_name}</h4>
                                            <a href={`mailto:${member.email}`} className="text-xs text-indigo-600 hover:underline">{member.email}</a>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md border ${getStatusStyle(member.status || 'active')}`}>
                                        {member.status || 'Active'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div>
                                        <span className="block font-semibold text-slate-700 mb-0.5">Department</span>
                                        {member.department || 'Not specified'}
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-slate-700 mb-0.5">Joined</span>
                                        {formatDate(member.joined_at)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop View (Table) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                    <th className="py-4 px-6 whitespace-nowrap">Member</th>
                                    <th className="py-4 px-6 whitespace-nowrap">Contact</th>
                                    <th className="py-4 px-6 whitespace-nowrap">Department</th>
                                    <th className="py-4 px-6 whitespace-nowrap">Joined Date</th>
                                    <th className="py-4 px-6 whitespace-nowrap text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedMembers.map(member => (
                                    <tr key={member.id || member._id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner group-hover:shadow-md transition-all">
                                                    {member.full_name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <span className="font-semibold text-slate-900 text-sm">{member.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                <a href={`mailto:${member.email}`} className="text-sm text-slate-600 hover:text-indigo-600 hover:underline">{member.email}</a>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 whitespace-nowrap">
                                                {member.department || 'Not specified'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm text-slate-600 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {formatDate(member.joined_at)}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider ${getStatusStyle(member.status || 'active')}`}>
                                                {member.status || 'Active'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {paginatedMembers.length === 0 && (
                        <div className="py-16 text-center flex flex-col items-center justify-center px-4">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No members found</h3>
                            <p className="text-sm text-slate-500 max-w-sm">
                                {searchTerm 
                                    ? `We couldn't find any members matching "${searchTerm}". Try adjusting your filters.` 
                                    : 'There are currently no members registered in the system.'}
                            </p>
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="mt-4 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    )}
                    
                    {/* Pagination Footer */}
                    {totalPages > 0 && (
                        <div className="bg-slate-50/50 border-t border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                                <span className="text-sm text-slate-500">
                                    Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, processedMembers.length)}</span> of <span className="font-bold text-slate-900">{processedMembers.length}</span>
                                </span>
                                <select 
                                    value={itemsPerPage} 
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none cursor-pointer shadow-sm"
                                >
                                    <option value="10">10 / page</option>
                                    <option value="25">25 / page</option>
                                    <option value="50">50 / page</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <span className="sr-only">Previous</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                
                                <div className="hidden sm:flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) pageNum = i + 1;
                                        else if (currentPage <= 3) pageNum = i + 1;
                                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                        else pageNum = currentPage - 2 + i;

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm ${
                                                    currentPage === pageNum
                                                        ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="sm:hidden text-sm font-bold text-slate-700 px-2">
                                    {currentPage} / {totalPages}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <span className="sr-only">Next</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageMembers;