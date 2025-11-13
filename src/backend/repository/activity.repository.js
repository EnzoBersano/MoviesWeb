const { getDb } = require('../../../config/mongodb');
const { ObjectId } = require('mongodb');

class ActivityRepository {
    constructor() {
        this.collectionName = 'user_activity';
    }

    async getCollection() {
        const db = await getDb();
        return db.collection(this.collectionName);
    }

    // Crear actividad de calificación
    async createRatingActivity(userId, movieId, movieTitle, rating) {
        const collection = await this.getCollection();

        const activity = {
            userId: userId,
            type: 'RATED_MOVIE',
            timestamp: new Date(),
            details: {
                movieId: parseInt(movieId),
                movieTitle: movieTitle,
                rating: parseInt(rating)
            }
        };

        const result = await collection.insertOne(activity);
        return { _id: result.insertedId, ...activity };
    }

    // Crear actividad de reseña
    async createReviewActivity(userId, movieId, movieTitle, reviewId) {
        const collection = await this.getCollection();

        const activity = {
            userId: userId,
            type: 'WROTE_REVIEW',
            timestamp: new Date(),
            details: {
                movieId: parseInt(movieId),
                movieTitle: movieTitle,
                reviewId: reviewId
            }
        };

        const result = await collection.insertOne(activity);
        return { _id: result.insertedId, ...activity };
    }

    // Crear actividad de favorito
    async createFavoriteActivity(userId, movieId, movieTitle) {
        const collection = await this.getCollection();

        const activity = {
            userId: userId,
            type: 'ADDED_TO_FAVORITES',
            timestamp: new Date(),
            details: {
                movieId: parseInt(movieId),
                movieTitle: movieTitle
            }
        };

        const result = await collection.insertOne(activity);
        return { _id: result.insertedId, ...activity };
    }

    // Obtener timeline de usuario
    async getUserTimeline(userId, limit = 20, skip = 0) {
        const collection = await this.getCollection();

        const activities = await collection
            .find({ userId: userId })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        return activities;
    }

    // Obtener estadísticas de usuario
    async getUserStats(userId) {
        const collection = await this.getCollection();

        const pipeline = [
            { $match: { userId: userId } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ];

        const results = await collection.aggregate(pipeline).toArray();

        const stats = {
            totalRatings: 0,
            totalReviews: 0,
            totalFavorites: 0,
            totalActivities: 0
        };

        results.forEach(item => {
            if (item._id === 'RATED_MOVIE') {
                stats.totalRatings = item.count;
            } else if (item._id === 'WROTE_REVIEW') {
                stats.totalReviews = item.count;
            } else if (item._id === 'ADDED_TO_FAVORITES') {
                stats.totalFavorites = item.count;
            }
            stats.totalActivities += item.count;
        });

        return stats;
    }

    // Obtener actividades recientes (feed global)
    async getRecentActivities(limit = 50, skip = 0) {
        const collection = await this.getCollection();

        const activities = await collection
            .find({})
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        return activities;
    }

    // Eliminar una actividad por ID
    async deleteActivity(activityId) {
        const collection = await this.getCollection();

        const result = await collection.deleteOne({
            _id: new ObjectId(activityId)
        });

        return result;
    }

    // Eliminar todas las actividades de un usuario
    async deleteUserActivities(userId) {
        const collection = await this.getCollection();

        const result = await collection.deleteMany({
            userId: userId
        });

        return result;
    }

    // Obtener actividades por tipo
    async getActivitiesByType(userId, type, limit = 20) {
        const collection = await this.getCollection();

        const activities = await collection
            .find({
                userId: userId,
                type: type
            })
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();

        return activities;
    }

    // Contar actividades de un usuario
    async countUserActivities(userId) {
        const collection = await this.getCollection();

        const count = await collection.countDocuments({
            userId: userId
        });

        return count;
    }
}

module.exports = new ActivityRepository();