const express = require('express');
const router = express.Router();

const searchController = require('../controllers/search.controller');
const movieController = require('../controllers/movie.controller');
const personController = require('../controllers/person.controller');
const userController = require('../controllers/user.controller');
const activityController = require('../controllers/activity.controller');
const reviewController = require('../controllers/review.controller');
const genreController = require('../controllers/genre.controller');
const authController = require('../controllers/auth.controller');

const authMiddleware = require('../middleware/auth.middleware');
const genreService = require('../service/genre.service');

// ============================================
// RUTA PRINCIPAL (PÚBLICA)
// ============================================
router.get('/', async (req, res) => {
    try {
        const genresWithMovies = await genreService.getGenresWithPopularMovies();
        res.render('index', { genres: genresWithMovies });
    } catch (error) {
        console.error('Error cargando página principal:', error);
        res.render('index', { genres: [] });
    }
});

// ============================================
// RUTAS PÚBLICAS
// ============================================
router.post('/register', authController.register);
router.post('/login', authController.login);

// ============================================
// RUTAS DE BÚSQUEDA (PÚBLICAS)
// ============================================
router.get('/buscar', searchController.search.bind(searchController));
router.get('/search/movies', searchController.searchMovies.bind(searchController));
router.get('/search/actors', searchController.searchActors.bind(searchController));
router.get('/search/directors', searchController.searchDirectors.bind(searchController));

// ============================================
// RUTAS DE GÉNEROS (PÚBLICAS)
// ============================================
router.get('/genre/:id', genreController.getGenrePage.bind(genreController));

// ============================================
// RUTAS DE PELÍCULAS (PÚBLICAS)
// ============================================
router.get('/pelicula/:id', movieController.getMovieDetails.bind(movieController));
router.get('/keyword/:id/movies', movieController.getMoviesByKeyword.bind(movieController));

// ============================================
// RUTAS DE PERSONAS (PÚBLICAS)
// ============================================
router.get('/actor/:id', personController.getActorDetails.bind(personController));
router.get('/director/:id', personController.getDirectorDetails.bind(personController));

// ============================================
// RUTAS PROTEGIDAS EXCLUSIVAMENTE
// ============================================

// --- Auth ---
router.get('/verify', authMiddleware, authController.verifyToken);
router.post('/refresh', authMiddleware, authController.refreshToken);

// --- Usuarios ---
router.get('/users', authMiddleware, userController.listUsers.bind(userController));
router.get('/users/create', userController.showCreateForm.bind(userController)); // pública
router.post('/users/create', userController.createUser.bind(userController));    // pública
router.get('/users/:id', authMiddleware, userController.viewUserProfile.bind(userController));
router.get('/users/:id/edit', authMiddleware, userController.showEditForm.bind(userController));
router.post('/users/:id/edit', authMiddleware, userController.updateUser.bind(userController));
router.post('/users/:id/delete', authMiddleware, userController.deleteUser.bind(userController));
router.post('/users/:userId/movies/add', authMiddleware, userController.addMovieToUser.bind(userController));
router.post('/users/:userId/movies/:movieId/remove', authMiddleware, userController.removeMovieFromUser.bind(userController));

// --- Actividad (HTML) ---
router.get('/activity/timeline/:userId', authMiddleware, activityController.viewTimeline.bind(activityController));
router.get('/activity/feed', authMiddleware, activityController.viewActivityFeed.bind(activityController));
router.get('/profile/:userId', authMiddleware, activityController.viewTimeline.bind(activityController));

// --- Actividad (API) ---
router.post('/activity/rate', authMiddleware, activityController.rateMovie.bind(activityController));
router.post('/activity/review', authMiddleware, activityController.writeReview.bind(activityController));
router.post('/activity/favorite', authMiddleware, activityController.addFavorite.bind(activityController));
router.delete('/activity/:activityId', authMiddleware, activityController.deleteActivity.bind(activityController));
router.get('/activity/stats/:userId', authMiddleware, activityController.getUserStats.bind(activityController));
router.get('/activity/api/timeline/:userId', authMiddleware, activityController.getTimelineAPI.bind(activityController));
router.get('/activity/api/feed', authMiddleware, activityController.getFeedAPI.bind(activityController));
router.delete('/activity/user/:userId', authMiddleware, activityController.deleteUserActivities.bind(activityController));

// --- Reviews ---
router.post('/reviews/create', authMiddleware, reviewController.createReview.bind(reviewController));
router.put('/reviews/:reviewId', authMiddleware, reviewController.updateReview.bind(reviewController));
router.delete('/reviews/:reviewId', authMiddleware, reviewController.deleteReview.bind(reviewController));

// --- Reviews públicas: lectura ---
router.get('/reviews/movie/:movieId', reviewController.getMovieReviews.bind(reviewController));
router.get('/reviews/user/:userId', reviewController.getUserReviews.bind(reviewController));
router.get('/reviews/:reviewId', reviewController.getReviewById.bind(reviewController));
router.get('/reviews/user/:userId/movie/:movieId', reviewController.getUserMovieReview.bind(reviewController));

module.exports = router;