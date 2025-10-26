// database/mongo-setup.js
// Script para configurar MongoDB e índices
// Ejecutar con: node database/mongo-setup.js

const { connectMongo, closeMongo } = require('./mongo-config');

async function setupMongoDB() {
    try {
        const db = await connectMongo();

        const collection = db.collection('user_activity');

        await collection.createIndex({ userId: 1, timestamp: -1 });
        await collection.createIndex({ type: 1 });
        await collection.createIndex({ timestamp: -1 });
        await collection.createIndex({ 'details.movieId': 1 });

        const indexes = await collection.indexes();

        await closeMongo();
    } catch (error) {
        await closeMongo();
        throw error;
    }
}

setupMongoDB();