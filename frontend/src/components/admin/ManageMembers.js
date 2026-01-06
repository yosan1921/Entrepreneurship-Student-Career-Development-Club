import React, { useState, useEffect } from 'react';
import { membersAPI } from '../../services/api';

const ManageMembers = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('joined_at');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await membersAPI.getAll();
            if (response.data.success) {
                setMembers(response.data.members);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(member =>
        member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.department && member.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const sortedMembers = [...filteredMembers].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'joined_at') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const exportToCSV = () => {
        const csvContent = [
            ['Name', 'Email', 'Department', 'Registration Date', 'Status'],
            ...sortedMembers.map(member => [
                member.full_name,
                member.email,
                member.department || '',
                formatDate(member.joined_at),
                member.status
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `escdc-members-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="loading">Loading members...</div>;
    }

    return (
        <div className="manage-members">
            <div className="section-header">
                <h3>Manage Members</h3>
                <div className="header-actions">
                    <button className="btn btn-export" onClick={exportToCSV}>
                        📊 Export CSV
                    </button>
                    <button className="btn btn-refresh" onClick={fetchMembers}>
                        🔄 Refresh
                    </button>
                </div>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search members by name, email, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="sort-controls">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="joined_at">Registration Date</option>
                        <option value="full_name">Name</option>
                        <option value="email">Email</option>
                        <option value="department">Department</option>
                    </select>

                    <button
                        className={`sort-order-btn ${sortOrder}`}
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            <div className="members-stats">
                <div className="stat-item">
                    <span className="stat-label">Total Members:</span>
                    <span className="stat-value">{members.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Filtered Results:</span>
                    <span className="stat-value">{sortedMembers.length}</span>
                </div>
            </div>

            <div className="members-table-container">
                <table className="members-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Registration Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedMembers.map(member => (
                            <tr key={member.id}>
                                <td className="member-name">
                                    <div className="name-cell">
                                        <div className="avatar">{member.full_name.charAt(0).toUpperCase()}</div>
                                        <span>{member.full_name}</span>
                                    </div>
                                </td>
                                <td className="member-email">
                                    <a href={`mailto:${member.email}`}>{member.email}</a>
                                </td>
                                <td className="member-department">
                                    {member.department || 'Not specified'}
                                </td>
                                <td className="member-date">
                                    {formatDate(member.joined_at)}
                                </td>
                                <td className="member-status">
                                    <span className={`status-badge status-${member.status}`}>
                                        {member.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {sortedMembers.length === 0 && (
                    <div className="no-results">
                        {searchTerm ? 'No members found matching your search.' : 'No members found.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageMembers;