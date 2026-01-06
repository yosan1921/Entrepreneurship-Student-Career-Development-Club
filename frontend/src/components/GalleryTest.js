import React, { useState, useEffect } from 'react';
import { galleryAPI } from '../services/api';

const GalleryTest = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({});

    useEffect(() => {
        testGalleryAPI();
    }, []);

    const testGalleryAPI = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🧪 Testing Gallery API from React...');

            // Test 1: Fetch all gallery items
            const response = await galleryAPI.getAll();
            console.log('API Response:', response.data);

            if (response.data.success) {
                setGalleryItems(response.data.data || []);
                console.log(`✅ Loaded ${response.data.data.length} gallery items`);
            } else {
                throw new Error('API returned success: false');
            }

            // Test 2: Fetch statistics
            try {
                const statsResponse = await galleryAPI.getStats();
                if (statsResponse.data.success) {
                    setStats(statsResponse.data.data);
                    console.log('✅ Statistics loaded:', statsResponse.data.data);
                }
            } catch (statsError) {
                console.log('⚠️ Statistics not available:', statsError.message);
            }

        } catch (error) {
            console.error('❌ Gallery API test failed:', error);
            setError(error.message);

            // Fallback to sample data
            console.log('📝 Using sample data as fallback');
            setGalleryItems([
                {
                    id: 1,
                    title: 'Sample Workshop',
                    description: 'This is sample data when API is not available',
                    mediaUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
                    mediaType: 'image',
                    category: 'workshop',
                    downloadCount: 0,
                    hasFile: false,
                    isExternal: true
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>🧪 Gallery API Test</h2>
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2>🧪 Gallery API Test Results</h2>

            {error && (
                <div style={{
                    background: '#f8d7da',
                    color: '#721c24',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <strong>API Error:</strong> {error}
                    <br />
                    <small>Using sample data as fallback</small>
                </div>
            )}

            {/* Statistics */}
            {Object.keys(stats).length > 0 && (
                <div style={{
                    background: '#d4edda',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <h3>📊 Gallery Statistics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                        <div><strong>Total:</strong> {stats.total || 0}</div>
                        <div><strong>Images:</strong> {stats.images || 0}</div>
                        <div><strong>Videos:</strong> {stats.videos || 0}</div>
                        <div><strong>Downloads:</strong> {stats.totalDownloads || 0}</div>
                        <div><strong>Size:</strong> {formatFileSize(stats.totalSize)}</div>
                    </div>
                </div>
            )}

            {/* Gallery Items */}
            <h3>🖼️ Gallery Items ({galleryItems.length})</h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
            }}>
                {galleryItems.map(item => (
                    <div key={item.id} style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: 'white'
                    }}>
                        {/* Media Preview */}
                        <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                            {item.mediaType === 'video' ? (
                                <div style={{
                                    position: 'relative',
                                    height: '100%',
                                    background: '#f0f0f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <img
                                        src={item.mediaUrl}
                                        alt={item.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        background: 'rgba(0,0,0,0.7)',
                                        color: 'white',
                                        padding: '10px',
                                        borderRadius: '50%',
                                        fontSize: '24px'
                                    }}>
                                        ▶️
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={item.mediaUrl}
                                    alt={item.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            )}
                        </div>

                        {/* Item Info */}
                        <div style={{ padding: '15px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#0b4ea2' }}>
                                {item.title}
                            </h4>

                            <p style={{
                                margin: '0 0 10px 0',
                                fontSize: '14px',
                                color: '#666',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                {item.description}
                            </p>

                            {/* Metadata */}
                            <div style={{ fontSize: '12px', color: '#888' }}>
                                <div><strong>Type:</strong> {item.mediaType} {item.mediaType === 'video' ? '🎥' : '🖼️'}</div>
                                <div><strong>Category:</strong> {item.category}</div>
                                <div><strong>Downloads:</strong> {item.downloadCount || 0}</div>
                                <div><strong>Source:</strong> {item.hasFile ? 'Uploaded File' : 'External URL'}</div>
                                {item.fileSize && <div><strong>Size:</strong> {formatFileSize(item.fileSize)}</div>}
                            </div>

                            {/* URLs for debugging */}
                            <details style={{ marginTop: '10px', fontSize: '11px' }}>
                                <summary style={{ cursor: 'pointer', color: '#0b4ea2' }}>🔍 Debug URLs</summary>
                                <div style={{ marginTop: '5px', background: '#f8f9fa', padding: '8px', borderRadius: '4px' }}>
                                    <div><strong>Media URL:</strong><br />{item.mediaUrl}</div>
                                    {item.downloadUrl && (
                                        <div style={{ marginTop: '5px' }}>
                                            <strong>Download URL:</strong><br />{item.downloadUrl}
                                        </div>
                                    )}
                                    {item.thumbnailUrl && (
                                        <div style={{ marginTop: '5px' }}>
                                            <strong>Thumbnail URL:</strong><br />{item.thumbnailUrl}
                                        </div>
                                    )}
                                </div>
                            </details>

                            {/* Action Buttons */}
                            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                {item.downloadUrl && (
                                    <a
                                        href={item.downloadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            background: '#0b4ea2',
                                            color: 'white',
                                            padding: '8px 12px',
                                            borderRadius: '4px',
                                            textDecoration: 'none',
                                            fontSize: '12px'
                                        }}
                                    >
                                        📥 Download
                                    </a>
                                )}
                                <a
                                    href={item.mediaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        background: '#6c757d',
                                        color: 'white',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        textDecoration: 'none',
                                        fontSize: '12px'
                                    }}
                                >
                                    🔗 View
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {galleryItems.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666',
                    background: '#f8f9fa',
                    borderRadius: '8px'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📸</div>
                    <h3>No Gallery Items Found</h3>
                    <p>The gallery is empty or the API is not responding.</p>
                </div>
            )}

            {/* Test Actions */}
            <div style={{
                marginTop: '30px',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '8px'
            }}>
                <h3>🧪 Test Actions</h3>
                <button
                    onClick={testGalleryAPI}
                    style={{
                        background: '#0b4ea2',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    🔄 Refresh Gallery
                </button>

                <button
                    onClick={() => window.open('/api/gallery', '_blank')}
                    style={{
                        background: '#28a745',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    🔍 View Raw API
                </button>
            </div>
        </div>
    );
};

export default GalleryTest;