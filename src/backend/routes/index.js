const express = require('express');
const router = express.Router();

const searchController = require('../controllers/search.controller');
const movieController = require('../controllers/movie.controller');
const personController = require('../controllers/person.controller');

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

module.exports = router;