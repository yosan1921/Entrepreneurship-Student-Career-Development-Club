# 🚀 Render.com Deployment Guide - MongoDB Atlas

## ✅ What's Been Fixed

Your backend has been migrated from MySQL to MongoDB Atlas to fix the `ECONNREFUSED` errors on Render.com. The following components are now MongoDB-ready:

### Migrated Files:
- ✅ `backend/db.js` - MongoDB connection
- ✅ `backend/server.js` - Server initialization
- ✅ `backend/package.json` - Dependencies updated
- ✅ `backend/.env` - MongoDB connection string
- ✅ `backend/routes/members.js` - Members API
- ✅ `backend/routes/events.js` - Events API
- ✅ `backend/routes/leadership.js` - Leadership API
- ✅ `backend/routes/auth.js` - Authentication API
- ✅ `backend/middleware/auth.js` - Auth middleware

## 📋 Pre-Deployment Checklist

### 1. MongoDB Atlas Setup

Your connection string is already configured:
```
mongodb+srv://yo2_n:Y%26sAn%40%26g%2B@cluster0.fpahdmc.mongodb.net/abcd?appName=Cluster0
```

**Important MongoDB Atlas Settings:**

1. **Network Access** (CRITICAL for Render):
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - This is required because Render uses dynamic IPs

2. **Database User**:
   - Username: `yo2_n`
   - Password: `Y&sAn@&g+` (URL-encoded in connection string)
   - Ensure user has "Read and write to any database" permissions

3. **Database Name**:
   - Database: `abcd`

### 2. Local Testing (Optional but Recommended)

Before deploying, test locally:

```bash
cd backend

# Install dependencies
npm install

# Run setup script to create admin user and indexes
node setup-mongodb.js

# Start server
npm start
```

Expected output:
```
🔄 Connecting to MongoDB Atlas...
✅ Connected to MongoDB Atlas successfully!
📊 Database: abcd
🚀 Server running on port 3001
📊 Using MongoDB Atlas
```

Test the health endpoint:
```bash
curl http://localhost:3001/api/health
```

Should return:
```json
{
  "message": "ESCDC Backend API is running!",
  "database": "MongoDB Atlas",
  "timestamp": "2025-01-29T..."
}
```

## 🚀 Deployment to Render.com

### Step 1: Push Code to GitHub

```bash
# From your project root
git add .
git commit -m "Migrate from MySQL to MongoDB Atlas"
git push origin main
```

### Step 2: Configure Environment Variables on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your backend service
3. Click "Environment" in the left sidebar
4. Add/Update these variables:

```
MONGODB_URI=mongodb+srv://yo2_n:Y%26sAn%40%26g%2B@cluster0.fpahdmc.mongodb.net/abcd?appName=Cluster0
DB_NAME=abcd
PORT=3001
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRES_IN=7d
```

**Important Notes:**
- The `%26` in the connection string is the URL-encoded `&` character
- The `%40` is the URL-encoded `@` character
- The `%2B` is the URL-encoded `+` character
- Do NOT decode these - keep them as-is

5. **Delete old MySQL variables** (if they exist):
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`

6. Click "Save Changes"

### Step 3: Deploy

Render will automatically detect the changes and start deploying. You can also manually trigger a deploy:

1. Go to your service dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

### Step 4: Monitor Deployment

Watch the logs during deployment:

1. Click on "Logs" tab
2. Look for these success messages:

```
🔄 Connecting to MongoDB Atlas...
✅ Connected to MongoDB Atlas successfully!
📊 Database: abcd
✅ Database initialized successfully
🚀 Server running on port 3001
📊 Using MongoDB Atlas
```

**If you see errors:**
- `MongoServerError: bad auth` → Check username/password in connection string
- `MongooseServerSelectionError` → Check MongoDB Atlas Network Access (allow 0.0.0.0/0)
- `ECONNREFUSED` → This should be gone! If you still see it, double-check the MONGODB_URI

### Step 5: Initialize Database

After successful deployment, initialize your database:

1. **Option A: Using Render Shell**
   ```bash
   # In Render dashboard, go to Shell tab
   node setup-mongodb.js
   ```

2. **Option B: Using API endpoint**
   - Create a temporary setup endpoint (see below)

### Step 6: Verify Deployment

Test your deployed API:

```bash
# Replace YOUR_APP_URL with your Render URL
curl https://YOUR_APP_URL.onrender.com/api/health
```

Expected response:
```json
{
  "message": "ESCDC Backend API is running!",
  "database": "MongoDB Atlas",
  "timestamp": "2025-01-29T..."
}
```

Test database connection:
```bash
curl https://YOUR_APP_URL.onrender.com/api/test-db
```

## 🔧 Post-Deployment Setup

### Create Admin User

You need to create an admin user to access the system. You have two options:

**Option 1: Using Render Shell**
```bash
# In Render dashboard → Shell tab
node setup-mongodb.js
```

**Option 2: Using MongoDB Compass**
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Navigate to `abcd` database → `admin_users` collection
4. Insert this document:

```json
{
  "username": "admin",
  "email": "admin@escdc.com",
  "password": "$2a$10$YourHashedPasswordHere",
  "firstName": "Admin",
  "lastName": "User",
  "role": "super_admin",
  "status": "active",
  "createdAt": {"$date": "2025-01-29T00:00:00.000Z"},
  "lastLogin": null
}
```

To generate a hashed password, run this locally:
```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('your_password', 10);
console.log(hash);
```

**Option 3: Create a temporary setup endpoint** (Remove after use!)

Add this to `backend/server.js` temporarily:

```javascript
// TEMPORARY - Remove after creating admin user
app.post('/api/setup-admin', async (req, res) => {
    try {
        const { getDB } = require('./db');
        const bcrypt = require('bcryptjs');
        const db = getDB();
        const usersCollection = db.collection('admin_users');
        
        const existingAdmin = await usersCollection.findOne({ username: 'admin' });
        if (existingAdmin) {
            return res.json({ message: 'Admin already exists' });
        }
        
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await usersCollection.insertOne({
            username: 'admin',
            email: 'admin@escdc.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'super_admin',
            status: 'active',
            createdAt: new Date(),
            lastLogin: null
        });
        
        res.json({ 
            success: true, 
            message: 'Admin created. Username: admin, Password: admin123. CHANGE THIS IMMEDIATELY!' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

Then call it once:
```bash
curl -X POST https://YOUR_APP_URL.onrender.com/api/setup-admin
```

**⚠️ IMPORTANT: Remove this endpoint after creating the admin user!**

## 🔍 Troubleshooting

### Issue: "MongoServerError: bad auth"
**Solution:**
- Verify username and password in MongoDB Atlas
- Check that password special characters are URL-encoded
- Ensure database user has correct permissions

### Issue: "MongooseServerSelectionError: connection timed out"
**Solution:**
- Go to MongoDB Atlas → Network Access
- Ensure 0.0.0.0/0 is in the IP whitelist
- Wait 2-3 minutes for changes to propagate

### Issue: "Database not initialized"
**Solution:**
- The database connection might not be ready
- Check Render logs for connection errors
- Ensure MONGODB_URI is set correctly

### Issue: Routes returning 500 errors
**Solution:**
- Some routes may still use MySQL syntax
- Check the route file in the logs
- Refer to MONGODB_MIGRATION_GUIDE.md for migration patterns

## 📊 Monitoring

### Check Application Health
```bash
curl https://YOUR_APP_URL.onrender.com/api/health
```

### Check Database Connection
```bash
curl https://YOUR_APP_URL.onrender.com/api/test-db
```

### View Logs
- Render Dashboard → Your Service → Logs tab
- Look for MongoDB connection messages
- Monitor for any errors

## 🎯 Next Steps

1. ✅ Deploy to Render
2. ✅ Verify MongoDB connection
3. ✅ Create admin user
4. ✅ Test login functionality
5. ✅ Migrate remaining routes (see MONGODB_MIGRATION_GUIDE.md)
6. ✅ Test all API endpoints
7. ✅ Update frontend API URLs if needed

## 📝 Important Notes

- **Render Free Tier**: Your app will spin down after 15 minutes of inactivity. First request after spin-down will be slow.
- **MongoDB Atlas Free Tier**: M0 cluster with 512MB storage. Sufficient for development.
- **Backups**: Set up MongoDB Atlas backups in production.
- **Security**: Change default admin password immediately after first login.

## 🆘 Need Help?

If you encounter issues:
1. Check Render logs for specific error messages
2. Verify MongoDB Atlas network access settings
3. Test connection string locally first
4. Ensure all environment variables are set correctly

## ✅ Success Indicators

Your deployment is successful when:
- ✅ Render logs show "Connected to MongoDB Atlas successfully!"
- ✅ Health endpoint returns "MongoDB Atlas"
- ✅ No ECONNREFUSED errors in logs
- ✅ You can login with admin credentials
- ✅ API endpoints respond correctly

---

**Deployment Date:** January 29, 2025
**MongoDB Version:** 7.0.0
**Node.js Version:** 18+ recommended
