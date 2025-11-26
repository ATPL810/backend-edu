const { MongoClient } = require('mongodb');
// initialize db and client variables
let db;
let client;

// connects to the MongoDB database using the connection string from environment variables
const connectToDatabase = async () => {
    try {
        // from the .env file
        const MONGODB_URI = process.env.MONGODB_URI 
        
        //creates a new MongoClient instance
        client = new MongoClient(MONGODB_URI);
        await client.connect();

        // database name is "Booking_courses"
        db = client.db("Booking_courses");
        console.log('Successfully connected to MongoDB');
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

const getDatabase = () => {
    if (!db) {
        throw new Error('Database not connected. Call connectToDatabase first.');
    }
    return db;
};
// closes the database connection
const closeDatabase = async () => {
    if (client) {
        await client.close();
    }
};

// To make the functions available for import in other files to access the database
module.exports = {
    connectToDatabase,
    getDatabase,
    closeDatabase
};