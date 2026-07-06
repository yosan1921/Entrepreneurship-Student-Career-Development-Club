# 🚨 URGENT FIX - Login Loop & System Settings

## The Problem

You have **TWO critical bugs** causing infinite loops:

### 1. Login Loop (401 infinite cycle)
- When you try to login → auth is failing somewhere → returns 401
- The API interceptor catches 401 → fires `auth-401` event → clears tokens
- `AuthContext` listens to this event → calls `checkAuthStatus()` again
- `checkAuthStatus()` calls `/api/auth/profile` → gets 401 again → **INFINITE LOOP**

### 2. System Settings Loop
- `Footer` component calls `/api/system-settings/public` on every page
- Backend route tries to query empty `system_settings` collection
- Returns 500 error → retries → returns 500 → **INFINITE LOOP**

## The Quick Fix

### Stop the backend server right now:
Press `Ctrl+C` in your backend terminal

### Then run this:

```bash
cd backend
node -e "
const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://yo2_n:Y%26sAn%40%26g%2B@cluster0.fpahdmc.mongodb.net/abcd?appName=Cluster0';
const client = new MongoClient(uri);

async function fix() {
  await client.connect();
  const db = client.db('abcd');
  
  // Insert default system settings to stop the crash
  await db.collection('system_settings').insertMany([
    { setting_key: 'club_name', setting_value: 'ESCDC', setting_type: 'text', category: 'club_info', is_public: true, created_at: new Date() },
    { setting_key: 'facebook_url', setting_value: '', setting_type: 'text', category: 'club_info', is_public: true, created_at: new Date() },
    { setting_key: 'instagram_url', setting_value: '', setting_type: 'text', category: 'club_info', is_public: true, created_at: new Date() },
    { setting_key: 'linkedin_url', setting_value: '', setting_type: 'text', category: 'club_info', is_public: true, created_at: new Date() },
    { setting_key: 'twitter_url', setting_value: '', setting_type: 'text', category: 'club_info', is_public: true, created_at: new Date() }
  ]);
  
  console.log('✅ System settings added');
  await client.close();
}

fix().catch(console.error);
"
```

### Now restart both servers:

**Terminal 1 (backend):**
```bash
npm start
```

**Terminal 2 (frontend):**
```bash
npm start
```

### Try Login Again

Username: `admin`  
Password: `admin123`

## If It Still Loops

The 401 loop means your admin user password or the JWT secret is wrong. Let me know and I'll create a script to reset it.
