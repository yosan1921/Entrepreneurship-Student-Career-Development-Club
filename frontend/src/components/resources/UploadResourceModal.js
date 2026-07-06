import React, { useState, useRef } from 'react';
import ResourceFileIcon from './ResourceFileIcon';

const ALLOWED_TYPES = [
    { ext: 'pdf', mime: 'application/pdf' },
    { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { ext: 'doc', mime: 'application/msword' },
    { ext: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
    { ext: 'ppt', mime: 'application/vnd.ms-powerpoint' },
    { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { ext: 'xls', mime: 'application/vnd.ms-excel' },
    { ext: 'zip', mime: 'application/zip' },
    { ext: 'mp4', mime: 'video/mp4' }
];

const ACCEPT_STRING = ALLOWED_TYPES.map(t => `.${t.ext}`).join(',');

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    return ext;
}

const UploadResourceModal = ({ onClose, onSuccess, categories }) => {
    const fileInputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: categories[0] || 'Official Documents',
        isPublished: true
    });

    const handleFile = (file) => {
        const ext = file.name.split('.').pop().toLowerCase();
        const allowed = ALLOWED_TYPES.map(t => t.ext);
        if (!allowed.includes(ext)) {
            setError(`File type ".${ext}" is not allowed. Please upload: ${allowed.join(', ')}`);
            return;
        }
        setError('');
        setSelectedFile(file);
        // Auto-fill title from filename
        if (!formData.title) {
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
            setFormData(prev => ({ ...prev, title: nameWithoutExt }));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }
        if (!formData.title.trim()) {
            setError('Title is required.');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        const data = new FormData();
        data.append('file', selectedFile);
        data.append('title', formData.title.trim());
        data.append('description', formData.description.trim());
        data.append('category', formData.category);
        data.append('isPublished', formData.isPublished);

        try {
            // Import api dynamically to avoid circular imports
            const { resourcesAPI } = await import('../../services/api');
            const res = await resourcesAPI.uploadResource(data, (evt) => {
                if (evt.total) {
                    setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
                }
            });

            if (res.data.success) {
                onSuccess(res.data.resource, 'Resource uploaded successfully');
                onClose();
            } else {
                setError(res.data.message || 'Upload failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!uploading ? onClose : undefined} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Upload Resource</h2>
                        <p className="text-xs text-gray-500 mt-0.5">PDF, DOCX, PPTX, XLSX, ZIP, MP4 — max 100 MB</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* File Drop Zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => !selectedFile && fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer
                            ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/40'}
                            ${selectedFile ? 'p-4' : 'p-8'}`}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept={ACCEPT_STRING}
                            onChange={handleFileInput}
                            className="hidden"
                        />

                        {selectedFile ? (
                            <div className="flex items-center gap-4">
                                <ResourceFileIcon fileType={getFileType(selectedFile)} size="md" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                                    <p className="text-sm text-gray-500">{formatBytes(selectedFile.size)}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setUploadProgress(0); }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <p className="font-semibold text-gray-800">Drag & drop your file here</p>
                                <p className="text-sm text-gray-400 mt-1">or <span className="text-blue-600 font-medium">click to browse</span></p>
                            </div>
                        )}
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium text-gray-600">
                                <span>Uploading…</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                            placeholder="e.g. CV Template 2025"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all text-gray-900"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                            rows={3}
                            placeholder="Brief description of this resource…"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-gray-900 placeholder-gray-400"
                        />
                    </div>

                    {/* Publish toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Publish immediately</p>
                            <p className="text-xs text-gray-500 mt-0.5">Members can see and download this resource</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, isPublished: !p.isPublished }))}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${formData.isPublished ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${formData.isPublished ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Footer Buttons */}
                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={uploading}
                            className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || !selectedFile}
                            className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Uploading {uploadProgress}%
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    Upload Resource
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadResourceModal;
