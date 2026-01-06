import React, { useState } from 'react';
import UploadButton from './UploadButton';
import { galleryAPI } from '../services/api';

const UploadPage = () => {
    const [uploadHistory, setUploadHistory] = useState([]);
    const [stats, setStats] = useState({});

    const handleUploadSuccess = (data) => {
        console.log('Upload successful:', data);

        // Add to upload history
        const newUpload = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            data: data,
            status: 'success'
        };
        setUploadHistory(prev => [newUpload, ...prev.slice(0, 9)]); // Keep last 10

        // Refresh stats
        fetchStats();

        // Show success message
        alert(`✅ Upload successful! ${Array.isArray(data.uploaded) ? data.uploaded.length : 1} file(s) uploaded.`);
    };

    const handleUploadError = (error) => {
        console.error('Upload error:', error);

        // Add to upload history
        const newUpload = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            error: error,
            status: 'error'
        };
        setUploadHistory(prev => [newUpload, ...prev.slice(0, 9)]);

        alert(`❌ Upload failed: ${error}`);
    };

    const fetchStats = async () => {
        try {
            const response = await galleryAPI.getStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    React.useEffect(() => {
        fetchStats();
    }, []);

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ color: '#0b4ea2', marginBottom: '10px' }}>📤 Media Upload Center</h1>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Upload images, photos, files, and videos to the gallery
                </p>
            </div>

            {/* Upload Section */}
            <div style={{
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                padding: '30px',
                borderRadius: '15px',
                border: '2px dashed #0b4ea2',
                textAlign: 'center',
                marginBottom: '30px'
            }}>
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ color: '#0b4ea2', marginBottom: '10px' }}>🎯 Upload Your Media</h2>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Supports images (JPG, PNG, GIF, WebP) and videos (MP4, AVI, MOV, WebM)
                        <br />
                        Maximum file size: 100MB per file
                    </p>
                </div>

                <UploadButton
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                    style={{ justifyContent: 'center' }}
                />
            </div>

            {/* Stats Section */}
            {Object.keys(stats).length > 0 && (
                <div style={{
                    background: 'white',
                    padding: '25px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    marginBottom: '30px'
                }}>
                    <h3 style={{ color: '#0b4ea2', marginBottom: '20px' }}>📊 Gallery Statistics</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '20px'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0b4ea2' }}>
                                {stats.total || 0}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>Total Items</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                                {stats.images || 0}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>Images</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                                {stats.videos || 0}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>Videos</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                                {stats.totalDownloads || 0}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>Downloads</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6f42c1' }}>
                                {formatFileSize(stats.totalSize)}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>Total Size</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload History */}
            {uploadHistory.length > 0 && (
                <div style={{
                    background: 'white',
                    padding: '25px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ color: '#0b4ea2', marginBottom: '20px' }}>📋 Recent Uploads</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {uploadHistory.map(upload => (
                            <div key={upload.id} style={{
                                padding: '15px',
                                background: upload.status === 'success' ? '#d4edda' : '#f8d7da',
                                border: `1px solid ${upload.status === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{
                                        fontWeight: 'bold',
                                        color: upload.status === 'success' ? '#155724' : '#721c24',
                                        marginBottom: '5px'
                                    }}>
                                        {upload.status === 'success' ? '✅ Upload Successful' : '❌ Upload Failed'}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                        {upload.timestamp}
                                    </div>
                                    {upload.data && (
                                        <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                                            {Array.isArray(upload.data.uploaded)
                                                ? `${upload.data.uploaded.length} files uploaded`
                                                : `File: ${upload.data.fileName || 'Unknown'}`
                                            }
                                        </div>
                                    )}
                                    {upload.error && (
                                        <div style={{ fontSize: '13px', color: '#721c24', marginTop: '5px' }}>
                                            Error: {upload.error}
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontSize: '20px' }}>
                                    {upload.status === 'success' ? '🎉' : '⚠️'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div style={{
                background: '#f8f9fa',
                padding: '25px',
                borderRadius: '12px',
                marginTop: '30px'
            }}>
                <h3 style={{ color: '#0b4ea2', marginBottom: '15px' }}>📖 How to Use</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div>
                        <h4 style={{ color: '#333', marginBottom: '10px' }}>🚀 Quick Upload</h4>
                        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                            Click "Upload Media" to quickly upload files with default settings.
                            Perfect for fast uploads with minimal configuration.
                        </p>
                    </div>
                    <div>
                        <h4 style={{ color: '#333', marginBottom: '10px' }}>⚙️ Advanced Upload</h4>
                        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                            Click "Advanced Upload" to add titles, descriptions, categories,
                            and event dates. Supports drag & drop and multiple files.
                        </p>
                    </div>
                    <div>
                        <h4 style={{ color: '#333', marginBottom: '10px' }}>📁 Supported Files</h4>
                        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                            Images: JPG, PNG, GIF, WebP, BMP, TIFF<br />
                            Videos: MP4, AVI, MOV, WMV, FLV, WebM, MKV
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;