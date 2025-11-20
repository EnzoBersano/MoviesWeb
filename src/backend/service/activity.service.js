const activityRepository = require('../repository/activity.repository');

class ActivityService {

    static async logRating(userId, movieId, movieTitle, rating) {
        try {
            const activityData = {
                userId: userId.toString(),
                type: 'RATED_MOVIE',
                timestamp: new Date(),
                details: {
                    movieId: parseInt(movieId),
                    movieTitle,
                    rating: parseInt(rating)
                }
            };

            const activity = await activityRepository.create(activityData);
            console.log(`Usuario ${userId} califico "${movieTitle}" con ${rating} estrellas`);
            return activity;
        } catch (error) {
            console.error('Error al registrar calificacion:', error);
            throw error;
        }
    }

    static async logReview(userId, movieId, movieTitle, reviewId, reviewText) {
        try {
            const activityData = {
                userId: userId.toString(),
                type: 'WROTE_REVIEW',
                timestamp: new Date(),
                details: {
                    movieId: parseInt(movieId),
                    movieTitle,
                    reviewId: reviewId.toString(),
                    reviewText: reviewText ? reviewText.substring(0, 200) : ''
                }
            };

            const activity = await activityRepository.create(activityData);
            console.log(`Usuario ${userId} escribio reseña para "${movieTitle}"`);
            return activity;
        } catch (error) {
            console.error('Error al registrar reseña:', error);
            throw error;
        }
    }

    static async logFavorite(userId, movieId, movieTitle) {
        try {
            const activityData = {
                userId: userId.toString(),
                type: 'ADDED_TO_FAVORITES',
                timestamp: new Date(),
                details: {
                    movieId: parseInt(movieId),
                    movieTitle
                }
            };

            const activity = await activityRepository.create(activityData);
            console.log(`Usuario ${userId} añadio "${movieTitle}" a favoritos`);
            return activity;
        } catch (error) {
            console.error('Error al registrar favorito:', error);
            throw error;
        }
    }

    static async getUserTimeline(userId, limit = 20) {
        try {
            const activities = await activityRepository.findByUserId(userId, {
                limit: limit,
                sort: { timestamp: -1 }
            });
            return activities;
        } catch (error) {
            console.error('Error al obtener timeline:', error);
            throw error;
        }
    }

    static async getUserStats(userId) {
        try {
            const aggregationResults = await activityRepository.getUserStats(userId);

            const statsObj = {
                totalRatings: 0,
                totalReviews: 0,
                totalFavorites: 0,
                totalActivities: 0
            };

            aggregationResults.forEach(stat => {
                if (stat._id === 'RATED_MOVIE') statsObj.totalRatings = stat.count;
                if (stat._id === 'WROTE_REVIEW') statsObj.totalReviews = stat.count;
                if (stat._id === 'ADDED_TO_FAVORITES') statsObj.totalFavorites = stat.count;
                statsObj.totalActivities += stat.count;
            });

            return statsObj;
        } catch (error) {
            console.error('Error al obtener estadisticas:', error);
            throw error;
        }
    }

    static async deleteActivity(activityId) {
        try {
            const result = await activityRepository.deleteById(activityId);
            return result;
        } catch (error) {
            console.error('Error al eliminar actividad:', error);
            throw error;
        }
    }

    static async deleteUserActivities(userId) {
        try {
            const result = await activityRepository.deleteByUserId(userId);
            return result;
        } catch (error) {
            console.error('Error al eliminar actividades del usuario:', error);
            throw error;
        }
    }

    static async getActivityById(activityId) {
        try {
            const activity = await activityRepository.findById(activityId);
            return activity;
        } catch (error) {
            console.error('Error al obtener actividad:', error);
            throw error;
        }
    }

    static async getActivitiesByType(userId, type, limit = 20) {
        try {
            const activities = await activityRepository.findByType(userId, type, {
                limit: limit,
                sort: { timestamp: -1 }
            });
            return activities;
        } catch (error) {
            console.error('Error al obtener actividades por tipo:', error);
            throw error;
        }
    }

    static async countUserActivities(userId) {
        try {
            const count = await activityRepository.countByUserId(userId);
            return count;
        } catch (error) {
            console.error('Error al contar actividades:', error);
            throw error;
        }
    }
    static async getRecentActivities(limit = 50, skip = 0) {
        try {
            const activities = await activityRepository.findAll({
                limit: limit,
                skip: skip,
                sort: { timestamp: -1 }
            });
            return activities;
        } catch (error) {
            console.error('Error al obtener actividades recientes:', error);
            throw error;
        }
    }

}

module.exports = ActivityService;