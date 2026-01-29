# MongoDB Atlas Migration Guide

## ✅ What Has Been Done

The following components and routes have been fully migrated from MySQL to MongoDB:

### Core Infrastructure
1. **backend/db.js** - MongoDB connection handler
2. **backend/server.js** - Updated to use MongoDB for all routes
3. **backend/.env** - MongoDB Atlas connection string integration
4. **backend/package.json** - Removed mysql2 dependency

### Migrated Routes
- **auth.js** - Login, password reset, and profile management
- **admin.js** - Dashboard stats and admin user management
- **members.js** - Member registration and listing
- **events.js** - Event management and upcoming events
- **news.js** - News/blog post system
- **contact.js** - Contact form submissions and inquiries
- **leadership.js** - Leadership team management
- **gallery.js** & **gallery-test.js** - Photo gallery and uploads
- **resources.js** - Document and resource management
- **announcements.js** - Main announcement system
- **announcement-comments.js** - Comment management
- **announcement-likes.js** - Like/Reaction system
- **reports.js** - Administrative reports and document tracking
- **system-settings.js** - Platform-wide configuration
- **categories.js** - Resource categorization and organizational structure

## 🚀 Deployment Steps for Render.com

## 🔧 MongoDB Collection Structure

Your MongoDB collections will have these structures:

### members
```javascript
{
  _id: ObjectId,
  full_name: String,
  email: String,
  department: String,
  phone: String,
  student_id: String,
  year: Number,
  interests: String,
  status: String, // 'active' or 'inactive'
  joined_at: Date,
  created_at: Date,
  updated_at: Date
}
```

### events
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  datetime: Date,
  location: String,
  organizer: String,
  maxParticipants: Number,
  status: String, // 'upcoming', 'ongoing', 'completed', 'cancelled'
  createdAt: Date,
  updatedAt: Date
}
```

### leadership
```javascript
{
  _id: ObjectId,
  name: String,
  position: String,
  email: String,
  phone: String,
  bio: String,
  display_order: Number,
  status: String, // 'active' or 'inactive'
  photo: String, // path to image
  sector: String, // 'Leadership Team'
  created_at: Date,
  updated_at: Date
}
```

## 🔄 Migration Pattern for Other Routes

To migrate other routes, follow this pattern:

### Before (MySQL):
```javascript
const db = require('../db');

router.get('/', (req, res) => {
    const query = 'SELECT * FROM table_name';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: results });
    });
});
```

### After (MongoDB):
```javascript
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const collection = db.collection('table_name');
        const results = await collection.find({}).toArray();
        
        // Convert _id to id for compatibility
        const formatted = results.map(item => ({
            ...item,
            id: item._id,
            _id: undefined
        }));
        
        res.json({ data: formatted });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

## 🛠️ Common MongoDB Operations

### Find All
```javascript
const results = await collection.find({}).toArray();
```

### Find One
```javascript
const result = await collection.findOne({ _id: new ObjectId(id) });
```

### Insert
```javascript
const result = await collection.insertOne(document);
const insertedId = result.insertedId;
```

### Update
```javascript
const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
);
```

### Delete
```javascript
const result = await collection.deleteOne({ _id: new ObjectId(id) });
```

### Search with Regex
```javascript
const results = await collection.find({
    $or: [
        { field1: { $regex: searchTerm, $options: 'i' } },
        { field2: { $regex: searchTerm, $options: 'i' } }
    ]
}).toArray();
```

## 🔍 Troubleshooting

### Connection Issues
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0` for Render's dynamic IPs
- Check connection string is properly URL-encoded
- Verify database user has read/write permissions

### Data Migration
- Use MongoDB Compass or mongoimport to migrate existing data
- Export MySQL data as JSON
- Import to MongoDB Atlas

### Performance
- Create indexes for frequently queried fields
- Use projection to limit returned fields
- Implement pagination for large datasets

## 📞 Support

If you encounter issues:
1. Check Render logs for error messages
2. Verify MongoDB Atlas connection string
3. Test connection locally first
4. Check MongoDB Atlas network access settings
