/**
 * MongoDB Setup Script
 * Run this once to initialize your MongoDB database with default data
 * 
 * Usage: node setup-mongodb.js
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abcd';
const DB_NAME = process.env.DB_NAME || 'abcd';

async function setupDatabase() {
    let client;

    try {
        console.log('🔄 Connecting to MongoDB...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(DB_NAME);

        // Create admin user if not exists
        console.log('\n📋 Setting up admin user...');
        const usersCollection = db.collection('admin_users');

        const existingAdmin = await usersCollection.findOne({ username: 'admin' });

        if (!existingAdmin) {
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

            console.log('✅ Default admin user created');
            console.log('   Username: admin');
            console.log('   Password: admin123');
            console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        // Create indexes
        console.log('\n📋 Creating indexes...');

        // Members indexes
        await db.collection('members').createIndex({ email: 1 }, { unique: true });
        await db.collection('members').createIndex({ status: 1 });
        await db.collection('members').createIndex({ joined_at: -1 });
        console.log('✅ Members indexes created');

        // Events indexes
        await db.collection('events').createIndex({ datetime: -1 });
        await db.collection('events').createIndex({ status: 1 });
        await db.collection('events').createIndex({ category: 1 });
        console.log('✅ Events indexes created');

        // Leadership indexes
        await db.collection('leadership').createIndex({ display_order: 1 });
        await db.collection('leadership').createIndex({ status: 1 });
        console.log('✅ Leadership indexes created');

        // Admin users indexes
        await db.collection('admin_users').createIndex({ username: 1 }, { unique: true });
        await db.collection('admin_users').createIndex({ email: 1 }, { unique: true });
        await db.collection('admin_users').createIndex({ status: 1 });
        console.log('✅ Admin users indexes created');

        // Insert sample data (optional)
        console.log('\n📋 Checking for sample data...');

        const membersCount = await db.collection('members').countDocuments();
        if (membersCount === 0) {
            console.log('ℹ️  No members found. You can add sample data manually.');
        } else {
            console.log(`ℹ️  Found ${membersCount} members`);
        }

        const eventsCount = await db.collection('events').countDocuments();
        if (eventsCount === 0) {
            console.log('ℹ️  No events found. You can add sample data manually.');
        } else {
            console.log(`ℹ️  Found ${eventsCount} events`);
        }

        console.log('\n✅ Database setup completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Start your server: npm start');
        console.log('2. Login with username: admin, password: admin123');
        console.log('3. Change the admin password immediately');
        console.log('4. Start adding your data through the API');

    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run setup
setupDatabase();
