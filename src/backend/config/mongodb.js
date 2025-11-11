// config/mongodb.js
const { MongoClient } = require('mongodb');

// URL de conexión a MongoDB
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = 'movieweb';

let db = null;

/**
 * Conecta a MongoDB
 */
async function connectMongoDB() {
    try {
        const client = new MongoClient(MONGO_URL);
        await client.connect();
        db = client.db(DB_NAME);
        console.log('✅ Conectado a MongoDB exitosamente');

        // Crear índices para optimizar consultas
        await createIndexes();

        return db;
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        throw error;
    }
}

/**
 * Crear índices en las colecciones
 */
async function createIndexes() {
    try {
        const collection = db.collection('user_activity');

        // Índice para buscar por userId y ordenar por timestamp
        await collection.createIndex({ userId: 1, timestamp: -1 });

        // Índice para buscar por tipo de actividad
        await collection.createIndex({ type: 1 });

        console.log('✅ Índices de MongoDB creados');
    } catch (error) {
        console.error('⚠️ Error creando índices:', error);
    }
}

/**
 * Obtiene la instancia de la base de datos
 */
function getDB() {
    if (!db) {
        throw new Error('Base de datos no conectada. Llama a connectMongoDB() primero.');
    }
    return db;
}

/**
 * Registra una actividad del usuario
 */
async function logUserActivity(userId, type, details) {
    try {
        const collection = db.collection('user_activity');

        const activity = {
            userId: userId,
            type: type,
            timestamp: new Date(),
            details: details
        };

        const result = await collection.insertOne(activity);
        console.log(`✅ Actividad registrada: ${type} para usuario ${userId}`);

        return result.insertedId;
    } catch (error) {
        console.error('❌ Error registrando actividad:', error);
        throw error;
    }
}

/**
 * Obtiene el timeline de un usuario
 */
async function getUserTimeline(userId, limit = 50) {
    try {
        const collection = db.collection('user_activity');

        const timeline = await collection
            .find({ userId: userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();

        return timeline;
    } catch (error) {
        console.error('❌ Error obteniendo timeline:', error);
        throw error;
    }
}

/**
 * Tipos de actividad
 */
const ACTIVITY_TYPES = {
    RATED_MOVIE: 'RATED_MOVIE',
    WROTE_REVIEW: 'WROTE_REVIEW',
    ADDED_TO_FAVORITES: 'ADDED_TO_FAVORITES'
};

module.exports = {
    connectMongoDB,
    getDB,
    logUserActivity,
    getUserTimeline,
    ACTIVITY_TYPES
};