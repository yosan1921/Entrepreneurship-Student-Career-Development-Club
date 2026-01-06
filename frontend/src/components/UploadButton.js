import React, { useState, useRef } from 'react';
import { galleryAPI } from '../services/api';

const UploadButton = ({ onUploadSuccess, onUploadError, className = '', style = {} }) => {
    const [uploading, setUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleQuickUpload = (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            uploadFiles(Array.from(files), {
                title: `Upload ${new Date().toLocaleDateString()}`,
                description: 'Quick upload',
                category: 'other'
            });
        }
    };

    const uploadFiles = async (files, metadata) => {
        try {
            setUploading(true);
            setUploadProgress(0);

            const formData = new FormData();
            files.forEach(file => formData.append('media', file));
            formData.append('title', metadata.title || files[0].name);
            formData.append('description', metadata.description || '');
            formData.append('category', metadata.category || 'other');
            formData.append('eventDate', metadata.eventDate || '');
            formData.append('status', metadata.status || 'active');

            const response = await (files.length === 1
                ? galleryAPI.upload(formData, {
                    onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total))
                })
                : galleryAPI.uploadMultiple(formData, {
                    onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total))
                })
            );

            if (response.data.success) {
                if (onUploadSuccess) onUploadSuccess(response.data.data);
                setShowModal(false);
            } else {
                throw new Error(response.data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
            if (onUploadError) onUploadError(errorMessage);
            alert(`❌ Upload failed: ${errorMessage}`);
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`flex items-center gap-3 ${className}`} style={style}>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleQuickUpload}
                className="hidden"
                id="quick-upload-input"
            />

            <button
                onClick={() => setShowModal(true)}
                disabled={uploading}
                className="flex items-center gap-2 px-6 py-3 bg-[#0d47a1] text-white rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-50"
            >
                {uploading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading... {uploadProgress}%</span>
                    </div>
                ) : (
                    <>
                        <span className="text-xl">📤</span>
                        <span>Upload Media</span>
                    </>
                )}
            </button>

            {showModal && (
                <AdvancedUploadModal
                    onClose={() => setShowModal(false)}
                    onUpload={uploadFiles}
                    uploading={uploading}
                    uploadProgress={uploadProgress}
                />
            )}
        </div>
    );
};

const AdvancedUploadModal = ({ onClose, onUpload, uploading, uploadProgress }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [metadata, setMetadata] = useState({
        title: '',
        description: '',
        category: 'other',
        eventDate: new Date().toISOString().split('T')[0],
        status: 'active'
    });
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        if (!metadata.title && files.length > 0) {
            setMetadata(prev => ({ ...prev, title: files.length === 1 ? files[0].name.split('.')[0] : `${files.length} items upload` }));
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-slideUp" onClick={e => e.stopPropagation()}>
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Upload Media</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
                    </div>

                    <div
                        className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer mb-6 ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setSelectedFiles(Array.from(e.dataTransfer.files)); setDragOver(false); }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
                        <div className="text-4xl mb-2">📁</div>
                        <h4 className="font-bold text-gray-900">{selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : 'Click or drag files here'}</h4>
                        <p className="text-sm text-gray-500 mt-1">Images and Videos up to 100MB</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Title</label>
                            <input
                                type="text"
                                value={metadata.title}
                                onChange={e => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Enter title"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                            <select
                                value={metadata.category}
                                onChange={e => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="workshop">Workshop</option>
                                <option value="seminar">Seminar</option>
                                <option value="training">Training</option>
                                <option value="competition">Competition</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1 mb-8">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                        <textarea
                            value={metadata.description}
                            onChange={e => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                            rows="3"
                            placeholder="Tell us about this media..."
                        />
                    </div>

                    {uploading && (
                        <div className="mb-6">
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={uploading || selectedFiles.length === 0}
                            onClick={() => onUpload(selectedFiles, metadata)}
                            className="flex-1 px-6 py-3 bg-[#0d47a1] text-white rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-50"
                        >
                            {uploading ? 'Processing...' : 'Start Upload'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadButton;
