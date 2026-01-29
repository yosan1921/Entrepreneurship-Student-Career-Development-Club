# MongoDB Atlas Migration Guide

## ✅ What Has Been Done

The following files have been migrated from MySQL to MongoDB:

1. **backend/db.js** - MongoDB connection handler
2. **backend/server.js** - Updated to use MongoDB
3. **backend/.env** - MongoDB Atlas connection string added
4. **backend/package.json** - Removed mysql2 dependency
5. **backend/routes/members.js** - Fully migrated to MongoDB
6. **backend/routes/events.js** - Fully migrated to MongoDB
7. **backend/routes/leadership.js** - Fully migrated to MongoDB

## 🚀 Deployment Steps for Render.com

### Step 1: Update Environment Variables on Render

1. Go to your Render.com dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add/Update these environment variables:

```
MONGODB_URI=mongodb+srv://yo2_n:Y%26sAn%40%26g%2B@cluster0.fpahdmc.mongodb.net/abcd?appName=Cluster0
DB_NAME=abcd
PORT=3001
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRES_IN=7d
```

5. Remove old MySQL variables:
   - DB_HOST
   - DB_PORT
   - DB_USER
   - DB_PASSWORD

### Step 2: Deploy to Render

1. Push your code to GitHub:
```bash
git add .
git commit -m "Migrate from MySQL to MongoDB Atlas"
git push origin main
```

2. Render will automatically detect the changes and redeploy

### Step 3: Verify Deployment

1. Check Render logs for successful MongoDB connection:
   - Look for: `✅ Connected to MongoDB Atlas successfully!`
   - Should NOT see: `Error: connect ECONNREFUSED`

2. Test the health endpoint:
```
https://your-app.onrender.com/api/health
```

Should return:
```json
{
  "message": "ESCDC Backend API is running!",
  "database": "MongoDB Atlas",
  "timestamp": "2025-01-29T..."
}
```

3. Test database connection:
```
https://your-app.onrender.com/api/test-db
```

## 📋 Remaining Routes to Migrate

The following routes still need MongoDB migration:

- backend/routes/auth.js
- backend/routes/admin.js
- backend/routes/contact.js
- backend/routes/news.js
- backend/routes/gallery.js
- backend/routes/gallery-test.js
- backend/routes/resources.js
- backend/routes/announcements.js
- backend/routes/announcement-comments.js
- backend/routes/announcement-likes.js
- backend/routes/reports.js
- backend/routes/system-settings.js
- backend/routes/categories.js

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
