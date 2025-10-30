// src/backend/services/activityService.js
const UserActivity = require('../models/UserActivity');

class ActivityService {

    static async logRating(userId, movieId, movieTitle, rating) {
        try {
            const activity = new UserActivity({
                userId,
                type: 'RATED_MOVIE',
                timestamp: new Date(),
                details: { movieId, movieTitle, rating }
            });

            await activity.save();
            console.log(`📊 Usuario ${userId} calificó "${movieTitle}" con ${rating}⭐`);
            return activity;
        } catch (error) {
            console.error('Error al registrar calificación:', error);
            throw error;
        }
    }

    static async logReview(userId, movieId, movieTitle, reviewId, reviewText) {
        try {
            const activity = new UserActivity({
                userId,
                type: 'WROTE_REVIEW',
                timestamp: new Date(),
                details: {
                    movieId,
                    movieTitle,
                    reviewId,
                    reviewText: reviewText.substring(0, 200)
                }
            });

            await activity.save();
            console.log(`✍️ Usuario ${userId} escribió reseña para "${movieTitle}"`);
            return activity;
        } catch (error) {
            console.error('Error al registrar reseña:', error);
            throw error;
        }
    }

    static async logFavorite(userId, movieId, movieTitle) {
        try {
            const activity = new UserActivity({
                userId,
                type: 'ADDED_TO_FAVORITES',
                timestamp: new Date(),
                details: { movieId, movieTitle }
            });

            await activity.save();
            console.log(`⭐ Usuario ${userId} añadió "${movieTitle}" a favoritos`);
            return activity;
        } catch (error) {
            console.error('Error al registrar favorito:', error);
            throw error;
        }
    }

    static async getUserTimeline(userId, limit = 20) {
        try {
            const activities = await UserActivity
                .find({ userId })
                .sort({ timestamp: -1 })
                .limit(limit);

            return activities;
        } catch (error) {
            console.error('Error al obtener timeline:', error);
            throw error;
        }
    }

    static async getUserStats(userId) {
        try {
            const stats = await UserActivity.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const statsObj = {
                totalRatings: 0,
                totalReviews: 0,
                totalFavorites: 0
            };

            stats.forEach(stat => {
                if (stat._id === 'RATED_MOVIE') statsObj.totalRatings = stat.count;
                if (stat._id === 'WROTE_REVIEW') statsObj.totalReviews = stat.count;
                if (stat._id === 'ADDED_TO_FAVORITES') statsObj.totalFavorites = stat.count;
            });

            return statsObj;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    }
}

module.exports = ActivityService;