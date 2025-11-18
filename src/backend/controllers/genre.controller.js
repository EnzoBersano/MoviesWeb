// src/backend/controllers/genre.controller.js - NUEVA CLASE
// Controlador para manejar requests de géneros
const genreService = require('../service/genre.service');

class GenreController {
    // Vista de películas por género con paginación
    async getGenrePage(req, res) {
        try {
            const genreId = req.params.id;
            const page = parseInt(req.query.page) || 1;

            const data = await genreService.getMoviesByGenre(genreId, page);

            res.render('genre', data);
        } catch (error) {
            console.error('Error en género:', error);
            res.status(500).send('Error al cargar películas del género.');
        }
    }
}

module.exports = new GenreController();