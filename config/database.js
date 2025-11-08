const { MongoClient } = require('mongodb');

let db;
let client;

const connectToDatabase = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/musiclessons?retryWrites=true&w=majority';
        
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db('musiclessons');
        console.log(' Connected to MongoDB Atlas');
        return db;
    } catch (error) {
        console.error(' MongoDB connection error:', error);
        throw error;
    }
};

const getDatabase = () => {
    if (!db) {
        throw new Error('Database not connected. Call connectToDatabase first.');
    }
    return db;
};

const closeDatabase = async () => {
    if (client) {
        await client.close();
    }
};

module.exports = {
    connectToDatabase,
    getDatabase,
    closeDatabase
};