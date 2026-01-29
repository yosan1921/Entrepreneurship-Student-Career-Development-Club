const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

async function seed() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const usersCol = db.collection('admin_users');

        const adminPassword = await bcrypt.hash('admin123', 10);

        const users = [
            {
                username: 'superadmin',
                email: 'superadmin@example.com',
                password: adminPassword,
                firstName: 'Super',
                lastName: 'Admin',
                role: 'super_admin',
                status: 'active',
                createdAt: new Date()
            },
            {
                username: 'admin',
                email: 'admin@example.com',
                password: adminPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                status: 'active',
                createdAt: new Date()
            },
            {
                username: 'editor',
                email: 'editor@example.com',
                password: adminPassword,
                firstName: 'Editor',
                lastName: 'User',
                role: 'editor',
                status: 'active',
                createdAt: new Date()
            }
        ];

        console.log('Seeding admin users...');
        for (let user of users) {
            const existing = await usersCol.findOne({ username: user.username });
            if (!existing) {
                await usersCol.insertOne(user);
                console.log(`Created user: ${user.username}`);
            } else {
                console.log(`User already exists: ${user.username}`);
            }
        }
        console.log('Done!');
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

seed();
