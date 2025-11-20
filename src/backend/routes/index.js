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
// MIDDLEWARE PARA INYECTAR USUARIO (OPCIONAL - NO BLOQUEA)
// ============================================
router.use(authMiddleware.injectUser);

// ============================================
// RUTA PRINCIPAL (PÚBLICA)
// ============================================
router.get('/', async (req, res) => {
    try {
        const genresWithMovies = await genreService.getGenresWithPopularMovies();
        res.render('index', {
            genres: genresWithMovies
        });
    } catch (error) {
        console.error('Error cargando página principal:', error);
        res.render('index', {
            genres: []
        });
    }
});

// ============================================
// AUTENTICACIÓN (RUTAS PÚBLICAS)
// ============================================
router.get('/login', (req, res) => {
    if (res.locals.currentUser) {
        return res.redirect('/');
    }
    res.render('login', {
        registered: req.query.registered === 'true',
        logout: req.query.logout === 'success'
    });
});

router.get('/register', (req, res) => {
    if (res.locals.currentUser) {
        return res.redirect('/');
    }
    res.render('register');
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// ============================================
// RUTAS PÚBLICAS
// ============================================

// Búsqueda
router.get('/buscar', searchController.search.bind(searchController));
router.get('/search/movies', searchController.searchMovies.bind(searchController));
router.get('/search/actors', searchController.searchActors.bind(searchController));
router.get('/search/directors', searchController.searchDirectors.bind(searchController));

// Géneros
router.get('/genre/:id', genreController.getGenrePage.bind(genreController));

// Películas
router.get('/pelicula/:id', movieController.getMovieDetails.bind(movieController));
router.get('/keyword/:id/movies', movieController.getMoviesByKeyword.bind(movieController));

// Personas
router.get('/actor/:id', personController.getActorDetails.bind(personController));
router.get('/director/:id', personController.getDirectorDetails.bind(personController));

// Reviews (solo lectura - públicas)
router.get('/reviews/movie/:movieId', reviewController.getMovieReviews.bind(reviewController));
router.get('/reviews/user/:userId', reviewController.getUserReviews.bind(reviewController));
router.get('/reviews/:reviewId', reviewController.getReviewById.bind(reviewController));
router.get('/reviews/user/:userId/movie/:movieId', reviewController.getUserMovieReview.bind(reviewController));

// Feed Global (PÚBLICO - actividad de todos)
router.get('/activity/feed', activityController.viewActivityFeed.bind(activityController));

// ============================================
// RUTAS DE USUARIOS - REORGANIZADAS
// ============================================

// Lista de usuarios (pública)
//router.get('/users', userController.listUsers.bind(userController));

// RUTAS ESPECÍFICAS DE USUARIO (deben ir ANTES de la ruta general /users/:id)
router.get('/users/create', authMiddleware.requireAuth, userController.showCreateForm.bind(userController));
router.post('/users/create', authMiddleware.requireAuth, userController.createUser.bind(userController));

// Rutas específicas con sufijos (deben ir PRIMERO)
router.get('/users/:id/profile', userController.viewUserProfile.bind(userController)); // PERFIL
router.get('/users/:id/edit', authMiddleware.requireAuth, userController.showEditForm.bind(userController)); // EDITAR
router.post('/users/:id/edit', authMiddleware.requireAuth, userController.updateUser.bind(userController)); // ACTUALIZAR
router.post('/users/:id/delete', authMiddleware.requireAuth, userController.deleteUser.bind(userController)); // ELIMINAR

// Películas de usuario
router.get('/users/:id/movies', userController.viewUserMovies.bind(userController)); // PELÍCULAS DEL USUARIO
router.post('/users/:userId/movies/add', authMiddleware.requireAuth, userController.addMovieToUser.bind(userController));
router.post('/users/:userId/movies/:movieId/remove', authMiddleware.requireAuth, userController.removeMovieFromUser.bind(userController));

// Ruta general de usuario (DEBE IR AL FINAL)
router.get('/users/:id', userController.viewUserProfile.bind(userController));

// ============================================
// RUTAS PROTEGIDAS
// ============================================

// Timeline personal (protegido)
router.get('/activity/timeline/:userId', authMiddleware.requireAuth, activityController.viewTimeline.bind(activityController));
router.get('/profile/:userId', authMiddleware.requireAuth, activityController.viewTimeline.bind(activityController));

// Actividades (API - protegidas)
router.post('/activity/rate', authMiddleware.requireAuth, activityController.rateMovie.bind(activityController));
router.post('/activity/review', authMiddleware.requireAuth, activityController.writeReview.bind(activityController));
router.post('/activity/favorite', authMiddleware.requireAuth, activityController.addFavorite.bind(activityController));
router.delete('/activity/:activityId', authMiddleware.requireAuth, activityController.deleteActivity.bind(activityController));
router.get('/activity/stats/:userId', authMiddleware.requireAuth, activityController.getUserStats.bind(activityController));
router.get('/activity/api/timeline/:userId', authMiddleware.requireAuth, activityController.getTimelineAPI.bind(activityController));
router.get('/activity/api/feed', authMiddleware.requireAuth, activityController.getFeedAPI.bind(activityController));
router.delete('/activity/user/:userId', authMiddleware.requireAuth, activityController.deleteUserActivities.bind(activityController));

// Reviews (escritura - protegidas)
router.post('/reviews/create', authMiddleware.requireAuth, reviewController.createReview.bind(reviewController));
router.put('/reviews/:reviewId', authMiddleware.requireAuth, reviewController.updateReview.bind(reviewController));
router.delete('/reviews/:reviewId', authMiddleware.requireAuth, reviewController.deleteReview.bind(reviewController));

// ============================================
// RUTAS DE API/AUTH (protegidas)
// ============================================
router.get('/verify', authMiddleware.requireAuth, authController.verifyToken);
router.post('/refresh', authMiddleware.requireAuth, authController.refreshToken);

module.exports = router;