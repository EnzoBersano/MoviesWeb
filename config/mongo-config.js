// config/mongo-config.js
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'moviesweb';

let client = null;
let db = null;

async function connectMongo() {
    try {
        if (client && db) {
            return db;
        }

        client = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db(DB_NAME);

        return db;
    } catch (error) {
        throw error;
    }
}

function getDb() {
    if (!db) {
        throw new Error('Base de datos no inicializada. Llama a connectMongo() primero.');
    }
    return db;
}

async function closeMongo() {
    if (client) {
        await client.close();
        client = null;
        db = null;
    }
}

module.exports = {
    connectMongo,
    getDb,
    closeMongo
};