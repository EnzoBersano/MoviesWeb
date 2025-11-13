const express = require('express');
const router = express.Router();

const searchController = require('../controllers/search.controller');
const movieController = require('../controllers/movie.controller');
const personController = require('../controllers/person.controller');
const userController = require('../controllers/user.controller');
const activityController = require('../controllers/activity.controller');
const reviewController = require('../controllers/review.controller');

// ============================================
// RUTA PRINCIPAL
// ============================================
router.get('/', (req, res) => {
    res.render('index');
});

// ============================================
// RUTAS DE BÚSQUEDA
// ============================================
router.get('/buscar', searchController.search.bind(searchController));

// ============================================
// RUTAS DE PELÍCULAS
// ============================================
router.get('/pelicula/:id', movieController.getMovieDetails.bind(movieController));
router.get('/keyword/:id/movies', movieController.getMoviesByKeyword.bind(movieController));

// ============================================
// RUTAS DE PERSONAS (ACTORES Y DIRECTORES)
// ============================================
router.get('/actor/:id', personController.getActorDetails.bind(personController));
router.get('/director/:id', personController.getDirectorDetails.bind(personController));

// ============================================
// RUTAS DE USUARIOS
// ============================================
router.get('/users', userController.listUsers.bind(userController));
router.get('/users/create', userController.showCreateForm.bind(userController));
router.post('/users/create', userController.createUser.bind(userController));
router.get('/users/:id', userController.viewUserProfile.bind(userController));
router.get('/users/:id/edit', userController.showEditForm.bind(userController));
router.post('/users/:id/edit', userController.updateUser.bind(userController));
router.post('/users/:id/delete', userController.deleteUser.bind(userController));
router.post('/users/:userId/movies/add', userController.addMovieToUser.bind(userController));
router.post('/users/:userId/movies/:movieId/remove', userController.removeMovieFromUser.bind(userController));

// ============================================
// RUTAS DE ACTIVIDAD - VISTAS HTML
// ============================================
router.get('/activity/timeline/:userId', activityController.viewTimeline.bind(activityController));
router.get('/activity/feed', activityController.viewActivityFeed.bind(activityController));

// ============================================
// RUTAS DE ACTIVIDAD - API (JSON)
// ============================================
router.post('/activity/rate', activityController.rateMovie.bind(activityController));
router.post('/activity/review', activityController.writeReview.bind(activityController));
router.post('/activity/favorite', activityController.addFavorite.bind(activityController));
router.delete('/activity/:activityId', activityController.deleteActivity.bind(activityController));
router.get('/activity/stats/:userId', activityController.getUserStats.bind(activityController));
router.get('/activity/api/timeline/:userId', activityController.getTimelineAPI.bind(activityController));
router.get('/activity/api/feed', activityController.getFeedAPI.bind(activityController));
router.delete('/activity/user/:userId', activityController.deleteUserActivities.bind(activityController));

// ============================================
// RUTAS DE RESEÑAS
// ============================================
router.post('/reviews/create', reviewController.createReview.bind(reviewController));
router.get('/reviews/movie/:movieId', reviewController.getMovieReviews.bind(reviewController));
router.get('/reviews/user/:userId', reviewController.getUserReviews.bind(reviewController));
router.get('/reviews/:reviewId', reviewController.getReviewById.bind(reviewController));
router.get('/reviews/user/:userId/movie/:movieId', reviewController.getUserMovieReview.bind(reviewController));
router.put('/reviews/:reviewId', reviewController.updateReview.bind(reviewController));
router.delete('/reviews/:reviewId', reviewController.deleteReview.bind(reviewController));

module.exports = router;