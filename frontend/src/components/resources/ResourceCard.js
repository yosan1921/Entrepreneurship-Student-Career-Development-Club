import React, { useState } from 'react';
import ResourceFileIcon from './ResourceFileIcon';

function formatBytes(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const ResourceCard = ({ resource, onDownload }) => {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await onDownload(resource._id || resource.id);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
            {/* Top accent bar based on file type */}
            <div className={`h-1 w-full ${resource.fileType === 'pdf' ? 'bg-red-400' :
                    resource.fileType === 'mp4' ? 'bg-purple-400' :
                        ['docx', 'doc'].includes(resource.fileType) ? 'bg-blue-400' :
                            ['pptx', 'ppt'].includes(resource.fileType) ? 'bg-orange-400' :
                                ['xlsx', 'xls'].includes(resource.fileType) ? 'bg-emerald-400' :
                                    resource.fileType === 'zip' ? 'bg-yellow-400' :
                                        'bg-slate-300'
                }`} />

            <div className="p-5 flex flex-col flex-1">
                {/* Icon + Meta */}
                <div className="flex items-start gap-4 mb-4">
                    <ResourceFileIcon fileType={resource.fileType} size="md" />
                    <div className="flex-1 min-w-0">
                        {resource.category && (
                            <span className="inline-block text-[10px] font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-full mb-1.5">
                                {resource.category}
                            </span>
                        )}
                        <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {resource.title}
                        </h3>
                    </div>
                </div>

                {/* Description */}
                {resource.description && (
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">
                        {resource.description}
                    </p>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mb-4 mt-auto">
                    {resource.fileSize && (
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {formatBytes(resource.fileSize)}
                        </span>
                    )}
                    {resource.createdAt && (
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(resource.createdAt)}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {resource.downloadCount || 0} downloads
                    </span>
                </div>

                {/* Download Button */}
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-95 disabled:opacity-60 transition-all"
                >
                    {downloading ? (
                        <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Downloading…
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ResourceCard;
