const db = require('../db');

class Resource {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.category_id = data.category_id;
        this.file_path = data.file_path;
        this.file_url = data.file_url;
        this.file_name = data.file_name;
        this.file_size = data.file_size;
        this.file_type = data.file_type;
        this.mime_type = data.mime_type;
        this.status = data.status || 'active';
        this.featured = data.featured || false;
        this.pinned = data.pinned || false;
        this.view_count = data.view_count || 0;
        this.download_count = data.download_count || 0;
        this.tags = data.tags;
        this.metadata = data.metadata;
        this.created_by = data.created_by;
        this.updated_by = data.updated_by;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.archived_at = data.archived_at;
    }

    // Static methods for database operations
    static async findAll(filters = {}) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT r.*, rc.name as category_name, rc.icon as category_icon, rc.color as category_color,
                       CONCAT(au_created.firstName, ' ', au_created.lastName) as created_by_name,
                       CONCAT(au_updated.firstName, ' ', au_updated.lastName) as updated_by_name,
                       GROUP_CONCAT(rt.name ORDER BY rt.name SEPARATOR ', ') as tags
                FROM resources r
                LEFT JOIN resource_categories rc ON r.category_id = rc.id
                LEFT JOIN admin_users au_created ON r.created_by = au_created.id
                LEFT JOIN admin_users au_updated ON r.updated_by = au_updated.id
                LEFT JOIN resource_tag_relations rtr ON r.id = rtr.resource_id
                LEFT JOIN resource_tags rt ON rtr.tag_id = rt.id
                WHERE 1=1
            `;

            const params = [];

            if (filters.status) {
                query += ' AND r.status = ?';
                params.push(filters.status);
            }

            if (filters.category_id) {
                query += ' AND r.category_id = ?';
                params.push(filters.category_id);
            }

            if (filters.featured !== undefined) {
                query += ' AND r.featured = ?';
                params.push(filters.featured);
            }

            if (filters.pinned !== undefined) {
                query += ' AND r.pinned = ?';
                params.push(filters.pinned);
            }

            if (filters.search) {
                query += ' AND (r.title LIKE ? OR r.description LIKE ?)';
                params.push(`%${filters.search}%`, `%${filters.search}%`);
            }

            query += ' GROUP BY r.id ORDER BY r.pinned DESC, r.featured DESC, r.created_at DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                params.push(parseInt(filters.limit));

                if (filters.offset) {
                    query += ' OFFSET ?';
                    params.push(parseInt(filters.offset));
                }
            }

            db.query(query, params, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results.map(row => new Resource(row)));
                }
            });
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT r.*, rc.name as category_name, rc.icon as category_icon, rc.color as category_color,
                       CONCAT(au_created.firstName, ' ', au_created.lastName) as created_by_name,
                       CONCAT(au_updated.firstName, ' ', au_updated.lastName) as updated_by_name,
                       GROUP_CONCAT(rt.name ORDER BY rt.name SEPARATOR ', ') as tags
                FROM resources r
                LEFT JOIN resource_categories rc ON r.category_id = rc.id
                LEFT JOIN admin_users au_created ON r.created_by = au_created.id
                LEFT JOIN admin_users au_updated ON r.updated_by = au_updated.id
                LEFT JOIN resource_tag_relations rtr ON r.id = rtr.resource_id
                LEFT JOIN resource_tags rt ON rtr.tag_id = rt.id
                WHERE r.id = ?
                GROUP BY r.id
            `;

            db.query(query, [id], (err, results) => {
                if (err) {
                    reject(err);
                } else if (results.length === 0) {
                    resolve(null);
                } else {
                    resolve(new Resource(results[0]));
                }
            });
        });
    }

    static async create(data) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO resources (title, description, category_id, file_path, file_url, file_name, 
                                     file_size, file_type, mime_type, status, featured, pinned, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                data.title,
                data.description,
                data.category_id,
                data.file_path || null,
                data.file_url || null,
                data.file_name || null,
                data.file_size || null,
                data.file_type,
                data.mime_type || null,
                data.status || 'active',
                data.featured || false,
                data.pinned || false,
                data.created_by
            ];

            db.query(query, params, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: result.insertId, ...data });
                }
            });
        });
    }

    static async update(id, data) {
        return new Promise((resolve, reject) => {
            const fields = [];
            const params = [];

            if (data.title !== undefined) {
                fields.push('title = ?');
                params.push(data.title);
            }

            if (data.description !== undefined) {
                fields.push('description = ?');
                params.push(data.description);
            }

            if (data.category_id !== undefined) {
                fields.push('category_id = ?');
                params.push(data.category_id);
            }

            if (data.file_path !== undefined) {
                fields.push('file_path = ?');
                params.push(data.file_path);
            }

            if (data.file_url !== undefined) {
                fields.push('file_url = ?');
                params.push(data.file_url);
            }

            if (data.file_name !== undefined) {
                fields.push('file_name = ?');
                params.push(data.file_name);
            }

            if (data.file_size !== undefined) {
                fields.push('file_size = ?');
                params.push(data.file_size);
            }

            if (data.file_type !== undefined) {
                fields.push('file_type = ?');
                params.push(data.file_type);
            }

            if (data.mime_type !== undefined) {
                fields.push('mime_type = ?');
                params.push(data.mime_type);
            }

            if (data.status !== undefined) {
                fields.push('status = ?');
                params.push(data.status);
            }

            if (data.featured !== undefined) {
                fields.push('featured = ?');
                params.push(data.featured);
            }

            if (data.pinned !== undefined) {
                fields.push('pinned = ?');
                params.push(data.pinned);
            }

            if (data.updated_by !== undefined) {
                fields.push('updated_by = ?');
                params.push(data.updated_by);
            }

            if (fields.length === 0) {
                return resolve({ affectedRows: 0 });
            }

            const query = `UPDATE resources SET ${fields.join(', ')} WHERE id = ?`;
            params.push(id);

            db.query(query, params, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM resources WHERE id = ?';

            db.query(query, [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    static async incrementViewCount(id) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE resources SET view_count = view_count + 1 WHERE id = ?';

            db.query(query, [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    static async incrementDownloadCount(id) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE resources SET download_count = download_count + 1 WHERE id = ?';

            db.query(query, [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    static async getStats() {
        return new Promise((resolve, reject) => {
            const queries = {
                total: 'SELECT COUNT(*) as count FROM resources WHERE status = "active"',
                featured: 'SELECT COUNT(*) as count FROM resources WHERE status = "active" AND featured = 1',
                pinned: 'SELECT COUNT(*) as count FROM resources WHERE status = "active" AND pinned = 1',
                totalViews: 'SELECT SUM(view_count) as count FROM resources WHERE status = "active"',
                totalDownloads: 'SELECT SUM(download_count) as count FROM resources WHERE status = "active"',
                recentUploads: 'SELECT COUNT(*) as count FROM resources WHERE status = "active" AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
            };

            const stats = {};
            let completed = 0;
            const total = Object.keys(queries).length;

            Object.entries(queries).forEach(([key, query]) => {
                db.query(query, (err, result) => {
                    if (err) {
                        console.error(`Error in ${key} query:`, err);
                        stats[key] = 0;
                    } else {
                        stats[key] = result[0].count || 0;
                    }

                    completed++;
                    if (completed === total) {
                        resolve(stats);
                    }
                });
            });
        });
    }

    static async getPopular(limit = 10) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT r.id, r.title, r.download_count, r.view_count, rc.name as category_name
                FROM resources r
                LEFT JOIN resource_categories rc ON r.category_id = rc.id
                WHERE r.status = 'active'
                ORDER BY (r.download_count + r.view_count) DESC
                LIMIT ?
            `;

            db.query(query, [limit], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    // Instance methods
    async save() {
        if (this.id) {
            return Resource.update(this.id, this);
        } else {
            const result = await Resource.create(this);
            this.id = result.id;
            return result;
        }
    }

    async delete() {
        if (this.id) {
            return Resource.delete(this.id);
        }
        throw new Error('Cannot delete resource without ID');
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            category_id: this.category_id,
            file_path: this.file_path,
            file_url: this.file_url,
            file_name: this.file_name,
            file_size: this.file_size,
            file_type: this.file_type,
            mime_type: this.mime_type,
            status: this.status,
            featured: this.featured,
            pinned: this.pinned,
            view_count: this.view_count,
            download_count: this.download_count,
            tags: this.tags,
            metadata: this.metadata,
            created_by: this.created_by,
            updated_by: this.updated_by,
            created_at: this.created_at,
            updated_at: this.updated_at,
            archived_at: this.archived_at
        };
    }
}

module.exports = Resource;