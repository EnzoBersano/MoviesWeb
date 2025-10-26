const express = require('express');
const router = express.Router();

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

module.exports = router;