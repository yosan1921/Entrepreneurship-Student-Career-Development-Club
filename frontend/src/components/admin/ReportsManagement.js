import React, { useState, useEffect, useCallback } from 'react';
import { reportsAPI } from '../../services/api';

const ReportsManagement = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingReport, setEditingReport] = useState(null);
    const [stats, setStats] = useState({});
    const [uploadProgress, setUploadProgress] = useState(0);
    const [filter, setFilter] = useState({
        type: 'all',
        status: 'all',
        visibility: 'all',
        academicYear: 'all'
    });

    const reportTypes = [
        { id: 'annual_plan', label: 'Annual Plan', icon: '📅', color: 'blue' },
        { id: 'semester_plan', label: 'Semester Plan', icon: '📚', color: 'indigo' },
        { id: 'event_report', label: 'Event Report', icon: '📊', color: 'purple' },
        { id: 'financial_report', label: 'Financial Report', icon: '💰', color: 'green' },
        { id: 'activity_report', label: 'Activity Report', icon: '📈', color: 'orange' },
        { id: 'other', label: 'Other', icon: '📄', color: 'gray' }
    ];

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (filter.type !== 'all') params.type = filter.type;
            if (filter.status !== 'all') params.status = filter.status;
            if (filter.visibility !== 'all') params.visibility = filter.visibility;
            if (filter.academicYear !== 'all') params.academicYear = filter.academicYear;

            const response = await reportsAPI.getAllAdmin(params.type, params.status, params.visibility, params.academicYear);
            if (response.data.success) {
                setReports(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await reportsAPI.getStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    useEffect(() => {
        fetchReports();
        fetchStats();
    }, [fetchReports, fetchStats]);

    const handleUpload = async (formData) => {
        try {
            setUploadProgress(0);
            const response = await reportsAPI.upload(formData, {
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });

            if (response.data.success) {
                setShowUploadModal(false);
                fetchReports();
                fetchStats();
                alert('Report uploaded successfully!');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading report: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploadProgress(0);
        }
    };

    const handleEdit = async (id, reportData) => {
        try {
            const response = await reportsAPI.update(id, reportData);
            if (response.data.success) {
                setShowEditModal(false);
                setEditingReport(null);
                fetchReports();
                fetchStats();
                alert('Report updated successfully!');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Error updating report: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await reportsAPI.delete(id);
            if (response.data.success) {
                fetchReports();
                fetchStats();
                alert('Report deleted successfully!');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting report: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDownload = (report) => {
        window.open(report.downloadUrl, '_blank');
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTypeConfig = (type) => {
        return reportTypes.find(t => t.id === type) || reportTypes[5];
    };

    const getUniqueYears = () => {
        const years = [...new Set(reports.map(r => r.academicYear))].filter(Boolean);
        return years.sort((a, b) => b - a);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-700 ring-green-600/20';
            case 'draft': return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
            case 'archived': return 'bg-gray-100 text-gray-700 ring-gray-600/20';
            default: return 'bg-gray-100 text-gray-700 ring-gray-600/20';
        }
    };

    if (loading && reports.length === 0) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Planning</h1>
                    <p className="text-gray-500 mt-1">Manage documents, plans, and reports</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => {
                            fetchReports();
                            fetchStats();
                        }}
                        className="px-4 py-2.5 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm transition-all flex items-center gap-2 font-medium text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-sm shadow-blue-200 transition-all flex items-center gap-2 font-medium text-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Upload Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total Reports', value: stats.total || 0, icon: '📊', color: 'blue' },
                    { label: 'Published', value: stats.published || 0, icon: '✅', color: 'green' },
                    { label: 'Downloads', value: stats.totalDownloads || 0, icon: '📥', color: 'indigo' },
                    { label: 'Total Size', value: formatFileSize(stats.totalSize || 0), icon: '💾', color: 'purple' },
                    { label: 'This Month', value: stats.recent || 0, icon: '📅', color: 'orange' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <span className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                                {stat.icon}
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-500 truncate">{stat.label}</p>
                                <p className="text-lg font-bold text-gray-900 truncate">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                        <span className="text-sm font-medium">Filters:</span>
                    </div>

                    <select
                        value={filter.type}
                        onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                        className="form-select bg-gray-50 border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-10"
                    >
                        <option value="all">All Types</option>
                        {reportTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                    </select>

                    <select
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        className="form-select bg-gray-50 border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-10"
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                    </select>

                    <select
                        value={filter.visibility}
                        onChange={(e) => setFilter({ ...filter, visibility: e.target.value })}
                        className="form-select bg-gray-50 border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-10"
                    >
                        <option value="all">All Visibility</option>
                        <option value="public">Public</option>
                        <option value="members">Members</option>
                        <option value="admin_only">Admin Only</option>
                    </select>

                    <select
                        value={filter.academicYear}
                        onChange={(e) => setFilter({ ...filter, academicYear: e.target.value })}
                        className="form-select bg-gray-50 border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-10"
                    >
                        <option value="all">All Years</option>
                        {getUniqueYears().map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Reports Grid */}
            {reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No reports found</h3>
                    <p className="text-gray-500 text-sm mt-1">Upload a new report to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {reports.map(report => {
                        const typeConfig = getTypeConfig(report.type);
                        return (
                            <div key={report.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
                                {/* Card Header */}
                                <div className="p-5 pb-3 flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg bg-${typeConfig.color}-50 text-${typeConfig.color}-600`}>
                                            <span className="text-xl">{typeConfig.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{typeConfig.label}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1 ring-inset ${getStatusColor(report.status)}`}>
                                                    {report.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap border border-gray-100">
                                        {report.visibility === 'public' ? '🌍 Public' :
                                            report.visibility === 'members' ? '👥 Members' : '🔒 Admin Only'}
                                    </span>
                                </div>

                                {/* Card Body */}
                                <div className="px-5 py-2 flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors" title={report.title}>
                                        {report.title}
                                    </h3>
                                    {report.description && (
                                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                                            {report.description}
                                        </p>
                                    )}
                                </div>

                                {/* Card Footer */}
                                <div className="px-5 py-4 mt-auto border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-500 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            {formatDate(report.createdAt)}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            {formatFileSize(report.fileSize)}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            <span className="truncate max-w-[100px]">{report.uploadedByName || 'Unknown'}</span>
                                        </div>
                                        {report.downloadCount > 0 && (
                                            <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
                                                {report.downloadCount}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDownload(report)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200 text-sm font-medium transition-colors"
                                            title="Download"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            Download
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingReport(report);
                                                setShowEditModal(true);
                                            }}
                                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                                            title="Edit"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(report.id)}
                                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <ReportUploadModal
                    onClose={() => setShowUploadModal(false)}
                    onUpload={handleUpload}
                    uploadProgress={uploadProgress}
                    reportTypes={reportTypes}
                />
            )}

            {/* Edit Modal */}
            {showEditModal && editingReport && (
                <ReportEditModal
                    report={editingReport}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingReport(null);
                    }}
                    onSave={(data) => handleEdit(editingReport.id, data)}
                    reportTypes={reportTypes}
                />
            )}
        </div>
    );
};

// Report Upload Modal Component
const ReportUploadModal = ({ onClose, onUpload, uploadProgress, reportTypes }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'annual_plan',
        period: '',
        academicYear: new Date().getFullYear().toString(),
        status: 'published',
        visibility: 'admin_only'
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('Please select a file to upload');
            return;
        }
        if (!formData.title.trim()) {
            alert('Please enter a title');
            return;
        }

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('report', selectedFile);
        uploadData.append('title', formData.title);
        uploadData.append('description', formData.description);
        uploadData.append('type', formData.type);
        uploadData.append('period', formData.period);
        uploadData.append('academicYear', formData.academicYear);
        uploadData.append('status', formData.status);
        uploadData.append('visibility', formData.visibility);

        await onUpload(uploadData);
        setUploading(false);
    };

    const getFileIcon = (file) => {
        const ext = file.name.split('.').pop().toLowerCase();
        switch (ext) {
            case 'pdf': return '📄';
            case 'doc': case 'docx': return '📝';
            case 'xls': case 'xlsx': return '📊';
            case 'ppt': case 'pptx': return '📋';
            default: return '📄';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-gray-900">Upload Report</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* File Upload Area */}
                    <div className="form-group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Report File <span className="text-red-500">*</span></label>
                        <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${selectedFile ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}>
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer block">
                                {selectedFile ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-3xl">{getFileIcon(selectedFile)}</span>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-blue-900">{selectedFile.name}</p>
                                            <p className="text-xs text-blue-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <button type="button" onClick={(e) => { e.preventDefault(); setSelectedFile(null); }} className="text-blue-400 hover:text-blue-600 ml-4">✕</button>
                                    </div>
                                ) : (
                                    <>
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                        <p className="mt-2 text-sm text-gray-600 font-medium">Click to upload or drag and drop</p>
                                        <p className="mt-1 text-xs text-gray-400">PDF, DOC, XLS, PPT (Max 50MB)</p>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter report title"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Report Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                            >
                                {reportTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Academic Year</label>
                            <input
                                type="text"
                                value={formData.academicYear}
                                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                placeholder="e.g. 2024"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description..."
                                rows="3"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Period</label>
                            <input
                                type="text"
                                value={formData.period}
                                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                placeholder="e.g. Q1 2024"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                    >
                                        <option value="draft">📝 Draft</option>
                                        <option value="published">✅ Published</option>
                                        <option value="archived">📦 Archived</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Visibility</label>
                                    <select
                                        value={formData.visibility}
                                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                    >
                                        <option value="admin_only">🔒 Admin</option>
                                        <option value="members">👥 Members</option>
                                        <option value="public">🌍 Public</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {uploading && uploadProgress > 0 && (
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
                            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                            <p className="text-xs text-center text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={uploading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-all disabled:opacity-50">
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Report Edit Modal Component
const ReportEditModal = ({ report, onClose, onSave, reportTypes }) => {
    const [formData, setFormData] = useState({
        title: report?.title || '',
        description: report?.description || '',
        type: report?.type || 'annual_plan',
        period: report?.period || '',
        academicYear: report?.academicYear || new Date().getFullYear().toString(),
        status: report?.status || 'published',
        visibility: report?.visibility || 'admin_only'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert('Title is required');
            return;
        }
        await onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-gray-900">Edit Report</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Report Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                            >
                                {reportTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Academic Year</label>
                            <input
                                type="text"
                                value={formData.academicYear}
                                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Period</label>
                            <input
                                type="text"
                                value={formData.period}
                                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                    >
                                        <option value="draft">📝 Draft</option>
                                        <option value="published">✅ Published</option>
                                        <option value="archived">📦 Archived</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Visibility</label>
                                    <select
                                        value={formData.visibility}
                                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                    >
                                        <option value="admin_only">🔒 Admin</option>
                                        <option value="members">👥 Members</option>
                                        <option value="public">🌍 Public</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-all">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportsManagement;