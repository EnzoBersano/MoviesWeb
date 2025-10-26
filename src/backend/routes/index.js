const express = require('express');
const router = express.Router();
const activityService = require('../service/activity.service');
const pool = require('./../../../config/database');

const searchController = require('../controllers/search.controller');
const movieController = require('../controllers/movie.controller');
const personController = require('../controllers/person.controller');
const userController = require('../controllers/user.controller');

// Ruta principal
router.get('/', (req, res) => {
    res.render('index');
});

// Rutas de búsqueda
router.get('/buscar', searchController.search.bind(searchController));

// Rutas de películas
router.get('/pelicula/:id', movieController.getMovieDetails.bind(movieController));
router.get('/keyword/:id/movies', movieController.getMoviesByKeyword.bind(movieController));

// Rutas de personas
router.get('/actor/:id', personController.getActorDetails.bind(personController));
router.get('/director/:id', personController.getDirectorDetails.bind(personController));

// Rutas de usuarios
router.get('/users', userController.listUsers.bind(userController));
router.get('/users/create', userController.showCreateForm.bind(userController));
router.post('/users/create', userController.createUser.bind(userController));
router.get('/users/:id', userController.viewUserProfile.bind(userController));
router.get('/users/:id/edit', userController.showEditForm.bind(userController));
router.post('/users/:id/edit', userController.updateUser.bind(userController));
router.post('/users/:id/delete', userController.deleteUser.bind(userController));
router.post('/users/:userId/movies/add', userController.addMovieToUser.bind(userController));
router.post('/users/:userId/movies/:movieId/remove', userController.removeMovieFromUser.bind(userController));

// Rutas de actividad - Vistas HTML
router.get('/activity/timeline/:userId', async (req, res) => {
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
        res.status(500).send('Error obteniendo timeline de actividad');
    }
});

router.get('/activity/feed', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const activities = await activityService.getRecentActivities(limit);

        res.render('activity-feed', {
            activities,
            title: 'Actividad Reciente'
        });
    } catch (error) {
        res.status(500).send('Error obteniendo feed de actividad');
    }
});

// Rutas de actividad - API
router.post('/activity/rate', async (req, res) => {
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

        await activityService.logRating(userId, movieId, movieTitle, ratingNum);

        res.json({
            success: true,
            message: 'Calificación registrada'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error registrando calificación'
        });
    }
});

router.post('/activity/review', async (req, res) => {
    try {
        const { userId, movieId, movieTitle, reviewId } = req.body;

        if (!userId || !movieId || !movieTitle || !reviewId) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos'
            });
        }

        await activityService.logReview(userId, movieId, movieTitle, reviewId);

        res.json({
            success: true,
            message: 'Reseña registrada'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error registrando reseña'
        });
    }
});

router.post('/activity/favorite', async (req, res) => {
    try {
        const { userId, movieId, movieTitle } = req.body;

        if (!userId || !movieId || !movieTitle) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos'
            });
        }

        await activityService.logFavorite(userId, movieId, movieTitle);

        res.json({
            success: true,
            message: 'Favorito registrado'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error registrando favorito'
        });
    }
});

router.delete('/activity/:activityId', async (req, res) => {
    try {
        const { activityId } = req.params;

        if (!activityId || activityId.length !== 24) {
            return res.status(400).json({
                success: false,
                message: 'ID de actividad inválido'
            });
        }

        const result = await activityService.deleteActivity(activityId);

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Actividad no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Actividad eliminada'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error eliminando actividad'
        });
    }
});

router.get('/activity/stats/:userId', async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas'
        });
    }
});

router.get('/activity/api/timeline/:userId', async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error obteniendo timeline'
        });
    }
});

router.get('/activity/api/feed', async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error obteniendo feed'
        });
    }
});

router.delete('/activity/user/:userId', async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error eliminando actividades'
        });
    }
});

// Rutas de reseñas
router.post('/reviews/create', async (req, res) => {
    try {
        const { userId, movieId, reviewText } = req.body;

        if (!userId || !movieId || !reviewText) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos'
            });
        }

        const query = `
            INSERT INTO reviews (user_id, movie_id, review_text, created_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING review_id
        `;

        const result = await pool.query(query, [userId, movieId, reviewText]);
        const reviewId = result.rows[0].review_id;

        res.json({
            success: true,
            reviewId: reviewId,
            message: 'Reseña creada exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear la reseña'
        });
    }
});

router.get('/reviews/movie/:movieId', async (req, res) => {
    try {
        const { movieId } = req.params;

        const query = `
            SELECT r.*, u.user_username, u.user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.movie_id = $1
            ORDER BY r.created_at DESC
        `;

        const result = await pool.query(query, [movieId]);

        res.json({
            success: true,
            reviews: result.rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener reseñas'
        });
    }
});

router.get('/reviews/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const query = `
            SELECT r.*, m.movie_title
            FROM reviews r
            JOIN movies m ON r.movie_id = m.movie_id
            WHERE r.user_id = $1
            ORDER BY r.created_at DESC
        `;

        const result = await pool.query(query, [userId]);

        res.json({
            success: true,
            reviews: result.rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener reseñas'
        });
    }
});

router.delete('/reviews/:reviewId', async (req, res) => {
    try {
        const { reviewId } = req.params;

        const query = 'DELETE FROM reviews WHERE review_id = $1';
        await pool.query(query, [reviewId]);

        res.json({
            success: true,
            message: 'Reseña eliminada'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la reseña'
        });
    }
});

module.exports = router;