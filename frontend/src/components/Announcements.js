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
            urgent: { color: 'bg-rose-50 border-rose-100 text-rose-600', icon: '🚨', label: 'Urgent' },
            high: { color: 'bg-amber-50 border-amber-100 text-amber-600', icon: '⚠️', label: 'High Priority' },
            normal: { color: 'bg-indigo-50 border-indigo-100 text-indigo-600', icon: 'ℹ️', label: 'Normal' },
            low: { color: 'bg-slate-100 border-slate-200 text-slate-500', icon: '📌', label: 'Low Priority' }
        };
        return badges[priority] || badges.normal;
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-sans text-sm font-semibold uppercase tracking-wider">Loading announcements...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden py-20 sm:py-28">
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                    <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-500 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full px-4 py-2 mb-6 shadow-premium">
                            <span className="text-xl">📢</span>
                            <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">Updates</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight uppercase tracking-tight">
                            Latest <span className="text-gradient">Announcements</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-sans font-medium">
                            Stay updated with news, workshop reports, and important updates from ESCDC administrators.
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
            </section>

            {/* Announcements List */}
            <section className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
                {announcements.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl p-8 max-w-md mx-auto shadow-premium">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 opacity-60">
                            📢
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Announcements</h3>
                        <p className="text-slate-500 font-sans text-sm max-w-xs mx-auto leading-relaxed">
                            There are no announcements posted at the moment. Please check back later.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
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
            const response = await announcementLikesAPI.checkLiked(announcement.id, likeUserEmail);
            if (response.data.success) {
                setIsLiked(response.data.liked);
            }
        } catch (error) {
            console.error('Error checking like status:', error);
        }
    };

    const handleLikeToggle = async () => {
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
            const response = await announcementsAPI.getComments(announcement.id);
            if (response.data.success) {
                setComments(response.data.data || []);
            }
        } catch (error) {
            // Fallback to comments endpoint check
            try {
                const response = await announcementCommentsAPI.getByAnnouncement(announcement.id);
                if (response.data.success) {
                    setComments(response.data.data || []);
                }
            } catch (err) {
                console.error('Error fetching comments:', err);
            }
        } finally {
            setLoadingComments(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (isAuthenticated) {
            if (!commentForm.comment_text.trim()) {
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
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-premium overflow-hidden transition-all duration-300 hover:shadow-lg">
            {/* Announcement Header */}
            <div className="p-8 sm:p-10 font-sans">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${priorityBadge.color}`}>
                            {priorityBadge.icon} {priorityBadge.label}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            📅 {formatDate(announcement.publishDate)}
                        </span>
                    </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug mb-4">
                    {announcement.title}
                </h2>

                <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed mb-6 font-sans font-medium whitespace-pre-line">
                    {announcement.content}
                </div>

                {/* Like Form Option for Guests */}
                {!isAuthenticated && showLikeForm && !likeUserEmail && (
                    <form onSubmit={handleLikeFormSubmit} className="mb-6 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Please submit your details to like:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={likeUserName}
                                onChange={(e) => setLikeUserName(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-xs text-slate-900 shadow-sm"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Your Email"
                                value={likeUserEmail}
                                onChange={(e) => setLikeUserEmail(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-xs text-slate-900 shadow-sm"
                                required
                            />
                        </div>
                        <div className="flex gap-2.5 mt-4">
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider"
                            >
                                Confirm &amp; Like
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowLikeForm(false)}
                                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* Info Actions Strip */}
                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLikeToggle}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all hover:scale-102 ${isLiked
                                ? 'bg-indigo-50 border-indigo-150 text-[#4F46E5]'
                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                            }`}
                            title={isAuthenticated ? 'Click to like/unlike' : 'Click to like (guest)'}
                        >
                            <span>👍</span>
                            <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
                        </button>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Posted by {announcement.createdByName || 'Admin'}
                        </span>
                    </div>

                    <button
                        onClick={onToggle}
                        className="text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-500 flex items-center gap-1.5"
                    >
                        <span>💬 {isExpanded ? 'Hide' : 'Show'} Comments</span>
                        <span className="px-2 py-0.5 bg-indigo-50 rounded-md text-[9px] text-[#4F46E5] font-bold">
                            {comments.length}
                        </span>
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-8 sm:p-10 font-sans text-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Comments</h3>

                    {/* New Comment Input */}
                    {isAuthenticated ? (
                        <form onSubmit={handleSubmitComment} className="mb-8 bg-white border border-slate-100 p-6 rounded-2xl shadow-premium">
                            <div className="mb-4">
                                <p className="text-xs font-sans text-slate-400 font-semibold uppercase tracking-wider">
                                    Commenting as <span className="text-slate-800 font-bold">{user?.username || user?.email}</span>
                                </p>
                            </div>
                            <textarea
                                placeholder="Share your thoughts on this announcement..."
                                value={commentForm.comment_text}
                                onChange={(e) => setCommentForm({ ...commentForm, comment_text: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 resize-none"
                                rows="3"
                                required
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-4 px-6 py-3 bg-slate-950 text-white rounded-xl font-bold hover:bg-slate-900 transition-all text-xs uppercase tracking-wider disabled:opacity-50"
                            >
                                {submitting ? 'Posting...' : 'Post Comment'}
                            </button>
                        </form>
                    ) : (
                        <div className="mb-8 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 text-center">
                            <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider leading-relaxed">
                                Please <a href="/login" className="font-bold text-indigo-600 underline hover:text-indigo-500">log in</a> to comment on announcements.
                            </p>
                        </div>
                    )}

                    {/* Comments List */}
                    {loadingComments ? (
                        <div className="text-center py-6 text-slate-400 font-sans text-xs font-semibold uppercase tracking-wider">Loading comments...</div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 font-sans text-xs font-semibold uppercase tracking-wider">
                            No comments yet. Be the first to comment!
                        </div>
                    ) : (
                        <div className="space-y-6">
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
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium font-sans text-sm">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">{comment.user_name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {formatDate(comment.created_at)}
                    </span>
                    {comment.updated_at !== comment.created_at && (
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">(edited)</span>
                    )}
                </div>
                {isOwnComment && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setEditingComment(comment.id)}
                            className="text-slate-400 hover:text-indigo-600 text-xs font-bold uppercase"
                            title="Edit comment"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-slate-400 hover:text-rose-600 text-xs font-bold uppercase"
                            title="Delete comment"
                        >
                            🗑️
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4 mt-3">
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 resize-none text-sm"
                        rows="3"
                    />
                    <div className="flex gap-2.5">
                        <button
                            onClick={handleEdit}
                            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-bold text-xs uppercase tracking-wider"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => {
                                setEditingComment(null);
                                setEditText(comment.comment_text);
                            }}
                            className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 border border-slate-200 font-bold text-xs uppercase tracking-wider"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-slate-600 text-sm leading-relaxed font-sans font-medium">{comment.comment_text}</p>
            )}
        </div>
    );
};

export default Announcements;
