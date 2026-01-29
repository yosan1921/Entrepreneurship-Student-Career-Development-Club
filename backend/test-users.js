const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abcd';
const DB_NAME = process.env.DB_NAME || 'abcd';

async function test() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const users = await db.collection('admin_users').find({}).toArray();
        console.log('--- ADMIN USERS ---');
        users.forEach(user => {
            console.log(`ID: ${user._id}, Username: ${user.username}, Role: ${user.role}, Status: ${user.status}`);
        });
        console.log('-------------------');
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

test();
