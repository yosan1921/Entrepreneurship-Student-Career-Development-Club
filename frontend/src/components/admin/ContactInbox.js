import React, { useState, useEffect } from 'react';
import { contactAPI } from '../../services/api';

const ContactInbox = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await contactAPI.getAll();
            if (response.data.success) {
                setContacts(response.data.contacts);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewMessage = async (contact) => {
        setSelectedMessage(selectedMessage?.id === contact.id ? null : contact);

        // If message is 'new', automatically mark it as 'read' when expanding
        if (contact.status === 'new' && selectedMessage?.id !== contact.id) {
            try {
                await contactAPI.updateStatus(contact.id, 'read');
                setContacts(contacts.map(c =>
                    c.id === contact.id ? { ...c, status: 'read' } : c
                ));
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }
    };

    const handleMarkAsRead = async (contactId, event) => {
        event.stopPropagation();
        try {
            setActionLoading(true);
            await contactAPI.updateStatus(contactId, 'read');
            setContacts(contacts.map(c =>
                c.id === contactId ? { ...c, status: 'read' } : c
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
            alert('Error marking message as read');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (contactId, event) => {
        event.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
            return;
        }

        try {
            setActionLoading(true);
            await contactAPI.delete(contactId);
            setContacts(contacts.filter(c => c.id !== contactId));
            if (selectedMessage?.id === contactId) setSelectedMessage(null);
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Error deleting message');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReplyClick = (contact, event) => {
        event.stopPropagation();
        // Set message but don't toggle expansion if clicking reply
        if (selectedMessage?.id !== contact.id) {
            setSelectedMessage(contact);
        }
        setReplyText('');
        setShowReplyModal(true);
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) {
            alert('Please enter a reply message');
            return;
        }

        try {
            setActionLoading(true);
            await contactAPI.reply(selectedMessage.id, replyText);
            setContacts(contacts.map(c =>
                c.id === selectedMessage.id ? { ...c, status: 'replied', reply: replyText } : c
            ));
            setShowReplyModal(false);
            setReplyText('');
            // Keep message expanded to show the new reply state
            alert('Reply sent successfully');
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Error sending reply');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredContacts = contacts.filter(contact => {
        if (filter === 'all') return true;
        return contact.status === filter;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700 ring-blue-600/20';
            case 'read': return 'bg-gray-100 text-gray-600 ring-gray-500/10';
            case 'replied': return 'bg-green-100 text-green-700 ring-green-600/20';
            default: return 'bg-gray-100 text-gray-600 ring-gray-500/10';
        }
    };

    if (loading && contacts.length === 0) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Messages Inbox</h1>
                    <p className="text-gray-500 mt-1">Manage inquiries and support requests</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100">
                {[
                    { id: 'all', label: 'All Messages' },
                    { id: 'new', label: 'Unread' },
                    { id: 'read', label: 'Read' },
                    { id: 'replied', label: 'Replied' }
                ].map(f => {
                    const count = f.id === 'all' ? contacts.length : contacts.filter(c => c.status === f.id).length;
                    return (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${filter === f.id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {f.label}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${filter === f.id ? 'bg-blue-500/30 text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Messages List */}
            <div className="space-y-4">
                {filteredContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No messages found</h3>
                        <p className="text-gray-500 text-sm mt-1">
                            {filter === 'all' ? 'Your inbox is empty.' : `No ${filter} messages.`}
                        </p>
                    </div>
                ) : (
                    filteredContacts.map(contact => {
                        const isExpanded = selectedMessage?.id === contact.id;
                        const isNew = contact.status === 'new';

                        return (
                            <div
                                key={contact.id}
                                onClick={() => handleViewMessage(contact)}
                                className={`bg-white rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${isExpanded
                                        ? 'shadow-lg border-blue-200 ring-1 ring-blue-100'
                                        : 'shadow-sm border-gray-200 hover:shadow-md hover:border-blue-200'
                                    }`}
                            >
                                {/* Message Summary Row */}
                                <div className={`p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center ${isNew ? 'bg-blue-50/30' : ''}`}>
                                    {/* Avatar */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isNew ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {getInitials(contact.name)}
                                    </div>

                                    {/* Content Info */}
                                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
                                        <div className="md:col-span-3">
                                            <h4 className={`text-gray-900 truncate ${isNew ? 'font-bold' : 'font-medium'}`}>
                                                {contact.name}
                                            </h4>
                                            <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                                        </div>

                                        <div className="md:col-span-6">
                                            <p className={`text-gray-900 truncate mb-0.5 ${isNew ? 'font-bold' : 'font-medium'}`}>
                                                {contact.subject}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {contact.message}
                                            </p>
                                        </div>

                                        <div className="md:col-span-3 flex items-center justify-end gap-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusStyle(contact.status)}`}>
                                                {contact.status}
                                            </span>
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {formatDate(contact.submittedAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Hover Actions (Desktop) */}
                                    <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* Actions appear in expanded/modal view mostly, but could add quick actions here */}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 sm:px-14">
                                        <div className="pt-4 border-t border-gray-100 space-y-6">
                                            {/* Full Message */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                    {contact.message}
                                                </p>
                                            </div>

                                            {/* Reply History */}
                                            {contact.reply && (
                                                <div className="pl-4 border-l-4 border-green-200">
                                                    <p className="text-xs font-semibold text-green-700 mb-1">Your Reply</p>
                                                    <p className="text-gray-700 italic">
                                                        {contact.reply}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Action Bar */}
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={(e) => handleReplyClick(contact, e)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                                        {contact.status === 'replied' ? 'Send Another Reply' : 'Reply'}
                                                    </button>
                                                    {contact.status !== 'read' && contact.status !== 'replied' && (
                                                        <button
                                                            onClick={(e) => handleMarkAsRead(contact.id, e)}
                                                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                                                        >
                                                            Mark as Read
                                                        </button>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={(e) => handleDelete(contact.id, e)}
                                                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Reply Modal */}
            {showReplyModal && selectedMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Reply Message</h3>
                                <p className="text-sm text-gray-500">To: {selectedMessage.name} &lt;{selectedMessage.email}&gt;</p>
                            </div>
                            <button
                                onClick={() => setShowReplyModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 border border-gray-200">
                                <p className="font-semibold text-gray-900 mb-1">Original Message:</p>
                                <p className="italic line-clamp-3">"{selectedMessage.message}"</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Reply</label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your response..."
                                    rows="6"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-800"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <button
                                onClick={() => setShowReplyModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendReply}
                                disabled={actionLoading || !replyText.trim()}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                        Send Reply
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactInbox;