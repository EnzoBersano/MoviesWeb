// services/activityService.js
const { getDb } = require('./../../../config/mongo-config');

const COLLECTION_NAME = 'user_activity';

// Tipos de actividad
const ActivityTypes = {
    RATED_MOVIE: 'RATED_MOVIE',
    WROTE_REVIEW: 'WROTE_REVIEW',
    ADDED_TO_FAVORITES: 'ADDED_TO_FAVORITES'
};

/**
 * Registra una calificación de película
 */
async function logRating(userId, movieId, movieTitle, rating) {
    const db = getDb();
    const activity = {
        userId: userId.toString(),
        type: ActivityTypes.RATED_MOVIE,
        timestamp: new Date(),
        details: {
            movieId: parseInt(movieId),
            movieTitle,
            rating: parseInt(rating)
        }
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(activity);
    return result;
}

/**
 * Registra que se escribió una reseña
 */
async function logReview(userId, movieId, movieTitle, reviewId) {
    const db = getDb();
    const activity = {
        userId: userId.toString(),
        type: ActivityTypes.WROTE_REVIEW,
        timestamp: new Date(),
        details: {
            movieId: parseInt(movieId),
            movieTitle,
            reviewId: reviewId.toString()
        }
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(activity);
    return result;
}

/**
 * Registra que se añadió una película a favoritos
 */
async function logFavorite(userId, movieId, movieTitle) {
    const db = getDb();
    const activity = {
        userId: userId.toString(),
        type: ActivityTypes.ADDED_TO_FAVORITES,
        timestamp: new Date(),
        details: {
            movieId: parseInt(movieId),
            movieTitle
        }
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(activity);
    return result;
}

/**
 * Obtiene el timeline de actividad de un usuario
 */
async function getUserTimeline(userId, limit = 20) {
    const db = getDb();
    const activities = await db.collection(COLLECTION_NAME)
        .find({ userId: userId.toString() })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

    return activities;
}

/**
 * Obtiene todas las actividades recientes (feed público)
 */
async function getRecentActivities(limit = 50) {
    const db = getDb();
    const activities = await db.collection(COLLECTION_NAME)
        .find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

    return activities;
}

/**
 * Elimina una actividad específica
 */
async function deleteActivity(activityId) {
    const db = getDb();
    const { ObjectId } = require('mongodb');

    const result = await db.collection(COLLECTION_NAME).deleteOne({
        _id: new ObjectId(activityId)
    });

    return result;
}

/**
 * Elimina todas las actividades de un usuario
 */
async function deleteUserActivities(userId) {
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).deleteMany({
        userId: userId.toString()
    });

    return result;
}

/**
 * Obtiene estadísticas de actividad de un usuario
 */
async function getUserStats(userId) {
    const db = getDb();

    const stats = await db.collection(COLLECTION_NAME).aggregate([
        { $match: { userId: userId.toString() } },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 }
            }
        }
    ]).toArray();

    // Convertir a objeto más legible
    const statsObj = {
        totalActivities: 0,
        ratings: 0,
        reviews: 0,
        favorites: 0
    };

    stats.forEach(stat => {
        statsObj.totalActivities += stat.count;
        if (stat._id === ActivityTypes.RATED_MOVIE) statsObj.ratings = stat.count;
        if (stat._id === ActivityTypes.WROTE_REVIEW) statsObj.reviews = stat.count;
        if (stat._id === ActivityTypes.ADDED_TO_FAVORITES) statsObj.favorites = stat.count;
    });

    return statsObj;
}

module.exports = {
    ActivityTypes,
    logRating,
    logReview,
    logFavorite,
    getUserTimeline,
    getRecentActivities,
    deleteActivity,
    deleteUserActivities,
    getUserStats
};