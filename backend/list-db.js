const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

async function test() {
    console.log('URI:', MONGODB_URI);
    console.log('DB:', DB_NAME);
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collections = await db.listCollections().toArray();
        console.log('--- COLLECTIONS ---');
        for (let col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`${col.name}: ${count} documents`);
        }
        console.log('-------------------');
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

test();
