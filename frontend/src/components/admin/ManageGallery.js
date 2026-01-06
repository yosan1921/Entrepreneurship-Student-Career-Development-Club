import React, { useState, useEffect } from 'react';
import { galleryAPI } from '../../services/api';

const ManageGallery = () => {
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            setLoading(true);
            const response = await galleryAPI.getAllAdmin();
            if (response.data.success) {
                setGallery(response.data.gallery);
            }
        } catch (error) {
            console.error('Error fetching gallery:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading gallery...</div>;
    }

    return (
        <div className="manage-gallery">
            <div className="section-header">
                <h3>Manage Gallery</h3>
                <button className="btn btn-primary">+ Add Image</button>
            </div>

            <div className="gallery-grid">
                {gallery.map(item => (
                    <div key={item.id} className="gallery-item">
                        <div className="gallery-image">
                            <img src={item.imageUrl} alt={item.title} />
                        </div>
                        <div className="gallery-info">
                            <h4>{item.title}</h4>
                            <p>{item.description}</p>
                            <div className="gallery-meta">
                                <span className="category">{item.category}</span>
                                <span className={`status-badge status-${item.status}`}>
                                    {item.status}
                                </span>
                            </div>
                        </div>
                        <div className="gallery-actions">
                            <button className="btn btn-sm btn-secondary">Edit</button>
                            <button className="btn btn-sm btn-danger">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageGallery;