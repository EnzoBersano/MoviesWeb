const activityService = require('../service/activity.service');

class ActivityController {
    // Ver timeline de usuario
    async viewTimeline(req, res) {
        try {
            const { userId } = req.params;
            const limit = parseInt(req.query.limit) || 20;

            const activities = await activityService.getUserTimeline(userId, limit);
            const stats = await activityService.getUserStats(userId);

            res.render('timeline', {
                userId,
                activities,
                stats,
                title: 'Timeline de Actividad'
            });
        } catch (error) {
            console.error('Error obteniendo timeline:', error);
            res.status(500).render('timeline', {
                userId: req.params.userId,
                activities: [],
                stats: { totalRatings: 0, totalReviews: 0, totalFavorites: 0, totalActivities: 0 },
                title: 'Timeline de Actividad',
                error: 'Error al cargar el timeline'
            });
        }
    }

    // Ver feed de actividades recientes
    async viewActivityFeed(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const activities = await activityService.getRecentActivities(limit);

            res.render('activity-feed', {
                activities,
                title: 'Actividad Reciente'
            });
        } catch (error) {
            console.error('Error obteniendo feed:', error);
            res.status(500).render('activity-feed', {
                activities: [],
                title: 'Actividad Reciente',
                error: 'Error al cargar el feed'
            });
        }
    }

    // API: Registrar calificación
    async rateMovie(req, res) {
        try {
            const { userId, movieId, movieTitle, rating } = req.body;

            if (!userId || !movieId || !movieTitle || !rating) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan datos requeridos'
                });
            }

            const ratingNum = parseInt(rating);
            if (ratingNum < 1 || ratingNum > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'La calificación debe estar entre 1 y 5'
                });
            }

            const activity = await activityService.logRating(userId, movieId, movieTitle, ratingNum);

            res.json({
                success: true,
                message: 'Calificación registrada',
                data: activity
            });
        } catch (error) {
            console.error('Error registrando calificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error registrando calificación'
            });
        }
    }

    // API: Registrar reseña
    async writeReview(req, res) {
        try {
            const { userId, movieId, movieTitle, reviewId } = req.body;

            if (!userId || !movieId || !movieTitle || !reviewId) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan datos requeridos'
                });
            }

            const activity = await activityService.logReview(userId, movieId, movieTitle, reviewId);

            res.json({
                success: true,
                message: 'Reseña registrada',
                data: activity
            });
        } catch (error) {
            console.error('Error registrando reseña:', error);
            res.status(500).json({
                success: false,
                message: 'Error registrando reseña'
            });
        }
    }

    // API: Registrar favorito
    async addFavorite(req, res) {
        try {
            const { userId, movieId, movieTitle } = req.body;

            if (!userId || !movieId || !movieTitle) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan datos requeridos'
                });
            }

            const activity = await activityService.logFavorite(userId, movieId, movieTitle);

            res.json({
                success: true,
                message: 'Favorito registrado',
                data: activity
            });
        } catch (error) {
            console.error('Error registrando favorito:', error);
            res.status(500).json({
                success: false,
                message: 'Error registrando favorito'
            });
        }
    }

    // API: Eliminar actividad
    async deleteActivity(req, res) {
        try {
            const { activityId } = req.params;

            if (!activityId || activityId.length !== 24) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de actividad inválido'
                });
            }

            const result = await activityService.deleteActivity(activityId);

            res.json({
                success: true,
                message: 'Actividad eliminada',
                data: result
            });
        } catch (error) {
            console.error('Error eliminando actividad:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error eliminando actividad'
            });
        }
    }

    // API: Obtener estadísticas de usuario
    async getUserStats(req, res) {
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de usuario requerido'
                });
            }

            const stats = await activityService.getUserStats(userId);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo estadísticas'
            });
        }
    }

    // API: Obtener timeline (JSON)
    async getTimelineAPI(req, res) {
        try {
            const { userId } = req.params;
            const limit = parseInt(req.query.limit) || 20;
            const skip = parseInt(req.query.skip) || 0;

            const activities = await activityService.getUserTimeline(userId, limit, skip);

            res.json({
                success: true,
                data: activities,
                count: activities.length
            });
        } catch (error) {
            console.error('Error obteniendo timeline:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo timeline'
            });
        }
    }

    // API: Obtener feed (JSON)
    async getFeedAPI(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const skip = parseInt(req.query.skip) || 0;

            const activities = await activityService.getRecentActivities(limit, skip);

            res.json({
                success: true,
                data: activities,
                count: activities.length
            });
        } catch (error) {
            console.error('Error obteniendo feed:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo feed'
            });
        }
    }

    // API: Eliminar todas las actividades de un usuario
    async deleteUserActivities(req, res) {
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de usuario requerido'
                });
            }

            const result = await activityService.deleteUserActivities(userId);

            res.json({
                success: true,
                message: 'Actividades del usuario eliminadas',
                deletedCount: result.deletedCount
            });
        } catch (error) {
            console.error('Error eliminando actividades:', error);
            res.status(500).json({
                success: false,
                message: 'Error eliminando actividades'
            });
        }
    }
}

module.exports = new ActivityController();