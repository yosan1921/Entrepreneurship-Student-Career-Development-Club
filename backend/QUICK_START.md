# 🚀 Quick Start - MongoDB Migration

## What Changed?

Your backend now uses **MongoDB Atlas** instead of MySQL. This fixes the `ECONNREFUSED` error on Render.com.

## Immediate Actions Required

### 1. MongoDB Atlas Network Access (CRITICAL!)

```
1. Go to: https://cloud.mongodb.com/
2. Select your cluster
3. Click "Network Access" (left sidebar)
4. Click "Add IP Address"
5. Select "Allow Access from Anywhere"
6. Confirm with 0.0.0.0/0
```

**Why?** Render.com uses dynamic IPs, so we need to allow all IPs.

### 2. Deploy to Render

```bash
# Push your code
git add .
git commit -m "Migrate to MongoDB Atlas"
git push origin main
```

### 3. Set Environment Variables on Render

Go to Render Dashboard → Your Service → Environment:

```
MONGODB_URI=mongodb+srv://yo2_n:Y%26sAn%40%26g%2B@cluster0.fpahdmc.mongodb.net/abcd?appName=Cluster0
DB_NAME=abcd
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
```

**Delete these old variables:**
- DB_HOST
- DB_PORT  
- DB_USER
- DB_PASSWORD

### 4. Wait for Deployment

Watch Render logs for:
```
✅ Connected to MongoDB Atlas successfully!
🚀 Server running on port 3001
```

### 5. Create Admin User

**Option A - Using Render Shell:**
```bash
node setup-mongodb.js
```

**Option B - Using this temporary endpoint:**

Add to `server.js` (REMOVE AFTER USE):
```javascript
app.post('/api/setup-admin', async (req, res) => {
    const { getDB } = require('./db');
    const bcrypt = require('bcryptjs');
    const db = getDB();
    const usersCollection = db.collection('admin_users');
    
    const existingAdmin = await usersCollection.findOne({ username: 'admin' });
    if (existingAdmin) return res.json({ message: 'Admin exists' });
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await usersCollection.insertOne({
        username: 'admin',
        email: 'admin@escdc.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'super_admin',
        status: 'active',
        createdAt: new Date()
    });
    
    res.json({ success: true, message: 'Admin created! Login: admin/admin123' });
});
```

Then call it:
```bash
curl -X POST https://your-app.onrender.com/api/setup-admin
```

### 6. Test Your Deployment

```bash
# Health check
curl https://your-app.onrender.com/api/health

# Should return:
# { "message": "ESCDC Backend API is running!", "database": "MongoDB Atlas" }
```

## ✅ Success Checklist

- [ ] MongoDB Atlas allows 0.0.0.0/0 IP access
- [ ] Code pushed to GitHub
- [ ] Environment variables set on Render
- [ ] Deployment successful (no ECONNREFUSED errors)
- [ ] Admin user created
- [ ] Can login to admin panel

## 🔧 If Something Goes Wrong

### Error: "MongoServerError: bad auth"
→ Check MongoDB Atlas username/password

### Error: "Connection timed out"  
→ Check MongoDB Atlas Network Access (allow 0.0.0.0/0)

### Error: "ECONNREFUSED"
→ This should be gone! Check MONGODB_URI is set correctly

### Error: "Database not initialized"
→ Wait a few seconds, MongoDB connection might be establishing

## 📚 More Information

- Full deployment guide: `DEPLOYMENT_GUIDE.md`
- Migration patterns: `MONGODB_MIGRATION_GUIDE.md`
- Setup script: `setup-mongodb.js`

## 🎯 What's Migrated

✅ Database connection (db.js)
✅ Server initialization (server.js)
✅ Members API
✅ Events API
✅ Leadership API
✅ Authentication API
✅ Auth middleware

## ⚠️ What Still Needs Migration

The following routes still use MySQL and need to be migrated:
- Contact
- News
- Gallery
- Resources
- Announcements
- Reports
- System Settings
- Admin dashboard

These will work once you migrate them using the patterns in `MONGODB_MIGRATION_GUIDE.md`.

## 🆘 Emergency Rollback

If you need to rollback to MySQL:
```bash
git revert HEAD
git push origin main
```

Then restore old environment variables on Render.

---

**Need help?** Check the full guides or contact support.
