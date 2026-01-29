const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abcd';
const DB_NAME = process.env.DB_NAME || 'abcd';

let client;
let db;

async function connectDB() {
    try {
        if (db) {
            return db;
        }

        console.log('🔄 Connecting to MongoDB Atlas...');

        client = new MongoClient(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        await client.connect();
        db = client.db(DB_NAME);

        console.log('✅ Connected to MongoDB Atlas successfully!');
        console.log('📊 Database:', DB_NAME);

        return db;
    } catch (err) {
        console.error('❌ Error connecting to MongoDB:', err.message);
        throw err;
    }
}

function getDB() {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB() first.');
    }
    return db;
}

async function closeDB() {
    if (client) {
        await client.close();
        console.log('🔌 MongoDB connection closed');
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    await closeDB();
    process.exit(0);
});

module.exports = { connectDB, getDB, closeDB };