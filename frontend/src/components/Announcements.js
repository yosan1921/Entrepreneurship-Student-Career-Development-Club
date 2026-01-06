import React, { useState, useEffect } from 'react';
import { announcementsAPI, announcementCommentsAPI, announcementLikesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Announcements = () => {
    const { user, isAuthenticated } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await announcementsAPI.getAll('public', 'published');
            if (response.data.success) {
                setAnnouncements(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            urgent: { color: 'bg-red-100 text-red-800', icon: '🚨', label: 'Urgent' },
            high: { color: 'bg-orange-100 text-orange-800', icon: '⚠️', label: 'High Priority' },
            normal: { color: 'bg-blue-100 text-blue-800', icon: 'ℹ️', label: 'Normal' },
            low: { color: 'bg-gray-100 text-gray-800', icon: '📌', label: 'Low Priority' }
        };
        return badges[priority] || badges.normal;
    };

    if (loading) {
        return <div className="loading">Loading announcements...</div>;
    }

    return (
        <div className="announcements-page">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-4">📢 Announcements</h1>
                        <p className="text-xl text-blue-100">
                            Stay updated with the latest news and important information
                        </p>
                    </div>
                </div>
            </section>

            {/* Announcements List */}
            <section className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {announcements.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">No announcements available at the moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {announcements.map((announcement) => (
                                <AnnouncementCard
                                    key={announcement.id}
                                    announcement={announcement}
                                    formatDate={formatDate}
                                    getPriorityBadge={getPriorityBadge}
                                    isExpanded={selectedAnnouncement === announcement.id}
                                    onToggle={() => setSelectedAnnouncement(
                                        selectedAnnouncement === announcement.id ? null : announcement.id
                                    )}
                                    user={user}
                                    isAuthenticated={isAuthenticated}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

const AnnouncementCard = ({ announcement, formatDate, getPriorityBadge, isExpanded, onToggle, user, isAuthenticated }) => {
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentForm, setCommentForm] = useState({
        user_name: '',
        user_email: '',
        comment_text: ''
    });
    const [editingComment, setEditingComment] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [likeUserEmail, setLikeUserEmail] = useState('');
    const [likeUserName, setLikeUserName] = useState('');
    const [showLikeForm, setShowLikeForm] = useState(false);

    const priorityBadge = getPriorityBadge(announcement.priority);

    useEffect(() => {
        fetchLikesCount();
        checkIfLiked();
        if (isExpanded) {
            fetchComments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExpanded, isAuthenticated]);

    const fetchLikesCount = async () => {
        try {
            const response = await announcementLikesAPI.getCount(announcement.id);
            if (response.data.success) {
                setLikesCount(response.data.count);
            }
        } catch (error) {
            console.error('Error fetching likes count:', error);
        }
    };

    const checkIfLiked = async () => {
        try {
            // For authenticated users, the backend will check by user_id from token
            // For guest users, we check by email if they've provided it
            const response = await announcementLikesAPI.checkLiked(announcement.id, likeUserEmail);
            if (response.data.success) {
                setIsLiked(response.data.liked);
            }
        } catch (error) {
            console.error('Error checking like status:', error);
        }
    };

    const handleLikeToggle = async () => {
        // If user is authenticated, no need for form
        if (isAuthenticated) {
            try {
                const response = await announcementLikesAPI.toggle({
                    announcement_id: announcement.id
                });

                if (response.data.success) {
                    setIsLiked(response.data.liked);
                    setLikesCount(response.data.count);
                }
            } catch (error) {
                console.error('Error toggling like:', error);
                alert('Error updating like: ' + (error.response?.data?.message || error.message));
            }
        } else {
            // Guest user - show form if not filled
            if (!likeUserEmail || !likeUserName) {
                setShowLikeForm(true);
                return;
            }

            try {
                const response = await announcementLikesAPI.toggle({
                    announcement_id: announcement.id,
                    user_email: likeUserEmail,
                    user_name: likeUserName
                });

                if (response.data.success) {
                    setIsLiked(response.data.liked);
                    setLikesCount(response.data.count);
                    setShowLikeForm(false);
                }
            } catch (error) {
                console.error('Error toggling like:', error);
                alert('Error updating like: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleLikeFormSubmit = (e) => {
        e.preventDefault();
        handleLikeToggle();
    };

    const fetchComments = async () => {
        try {
            setLoadingComments(true);
            const response = await announcementCommentsAPI.getByAnnouncement(announcement.id);
            if (response.data.success) {
                setComments(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        // For authenticated users, only comment_text is required
        if (isAuthenticated) {
            if (!commentForm.comment_text) {
                alert('Please enter a comment');
                return;
            }

            try {
                setSubmitting(true);
                const response = await announcementCommentsAPI.create({
                    announcement_id: announcement.id,
                    comment_text: commentForm.comment_text
                });

                if (response.data.success) {
                    setCommentForm({ user_name: '', user_email: '', comment_text: '' });
                    fetchComments();
                    alert('Comment added successfully!');
                }
            } catch (error) {
                console.error('Error adding comment:', error);
                alert('Error adding comment: ' + (error.response?.data?.message || error.message));
            } finally {
                setSubmitting(false);
            }
        } else {
            // For non-authenticated users, show login message
            alert('Please log in to comment on announcements.');
        }
    };

    const handleEditComment = async (commentId, newText) => {
        try {
            const response = await announcementCommentsAPI.update(commentId, {
                comment_text: newText
            });

            if (response.data.success) {
                setEditingComment(null);
                fetchComments();
                alert('Comment updated successfully!');
            }
        } catch (error) {
            console.error('Error updating comment:', error);
            alert('Error updating comment: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            const response = await announcementCommentsAPI.delete(commentId);
            if (response.data.success) {
                fetchComments();
                alert('Comment deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Error deleting comment: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Announcement Header */}
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityBadge.color}`}>
                                {priorityBadge.icon} {priorityBadge.label}
                            </span>
                            <span className="text-sm text-gray-500">
                                {formatDate(announcement.publishDate)}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {announcement.title}
                        </h2>
                    </div>
                </div>

                <div className="prose max-w-none text-gray-700 mb-4">
                    {announcement.content}
                </div>

                {/* Like Section */}
                <div className="mt-4 pt-4 border-t">
                    {!isAuthenticated && showLikeForm && !likeUserEmail ? (
                        <form onSubmit={handleLikeFormSubmit} className="mb-4 bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-3">Please enter your details to like this announcement:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={likeUserName}
                                    onChange={(e) => setLikeUserName(e.target.value)}
                                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Your Email"
                                    value={likeUserEmail}
                                    onChange={(e) => setLikeUserEmail(e.target.value)}
                                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    required
                                />
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                    Submit & Like
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowLikeForm(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : null}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleLikeToggle}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isLiked
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                title={isAuthenticated ? 'Click to like/unlike' : 'Click to like (guest)'}
                            >
                                <span className="text-xl">{isLiked ? '👍' : '👍🏻'}</span>
                                <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
                            </button>
                            <span className="text-sm text-gray-500">
                                Posted by {announcement.createdByName || 'Admin'}
                            </span>
                        </div>
                        <button
                            onClick={onToggle}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                        >
                            💬 {isExpanded ? 'Hide' : 'Show'} Comments ({comments.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            {isExpanded && (
                <div className="border-t bg-gray-50 p-6">
                    <h3 className="text-lg font-semibold mb-4">Comments</h3>

                    {/* Comment Form */}
                    {isAuthenticated ? (
                        <form onSubmit={handleSubmitComment} className="mb-6 bg-white p-4 rounded-lg shadow-sm">
                            <div className="mb-3">
                                <p className="text-sm text-gray-600">
                                    Commenting as <span className="font-semibold">{user?.username || user?.email}</span>
                                </p>
                            </div>
                            <textarea
                                placeholder="Write your comment..."
                                value={commentForm.comment_text}
                                onChange={(e) => setCommentForm({ ...commentForm, comment_text: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="3"
                                required
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {submitting ? 'Posting...' : 'Post Comment'}
                            </button>
                        </form>
                    ) : (
                        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-blue-800 text-center">
                                Please <a href="/login" className="font-semibold underline hover:text-blue-900">log in</a> to comment on announcements.
                            </p>
                        </div>
                    )}

                    {/* Comments List */}
                    {loadingComments ? (
                        <div className="text-center py-4">Loading comments...</div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                            No comments yet. Be the first to comment!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    formatDate={formatDate}
                                    editingComment={editingComment}
                                    setEditingComment={setEditingComment}
                                    onEdit={handleEditComment}
                                    onDelete={handleDeleteComment}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const CommentItem = ({ comment, formatDate, editingComment, setEditingComment, onEdit, onDelete }) => {
    const { user, isAuthenticated } = useAuth();
    const [editText, setEditText] = useState(comment.comment_text);

    const isEditing = editingComment === comment.id;
    const isOwnComment = isAuthenticated && user && comment.user_id === user.id;

    const handleEdit = () => {
        onEdit(comment.id, editText);
    };

    const handleDelete = () => {
        onDelete(comment.id);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <span className="font-semibold text-gray-900">{comment.user_name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                        {formatDate(comment.created_at)}
                    </span>
                    {comment.updated_at !== comment.created_at && (
                        <span className="text-xs text-gray-400 ml-2">(edited)</span>
                    )}
                </div>
                {isOwnComment && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setEditingComment(comment.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            title="Edit comment"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-red-600 hover:text-red-800 text-sm"
                            title="Delete comment"
                        >
                            🗑️
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <div>
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg mb-2"
                        rows="3"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleEdit}
                            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => {
                                setEditingComment(null);
                                setEditText(comment.comment_text);
                            }}
                            className="px-4 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-gray-700">{comment.comment_text}</p>
            )}
        </div>
    );
};

export default Announcements;
