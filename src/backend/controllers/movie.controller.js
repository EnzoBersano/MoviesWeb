const movieService = require('../service/movie.service');

class MovieController {
    async getMovieDetails(req, res) {
        try {
            const movieId = req.params.id;
            const movieData = await movieService.getMovieDetails(movieId);

            if (!movieData) {
                return res.status(404).send('Película no encontrada.');
            }

            res.render('pelicula', { movie: movieData });
        } catch (error) {
            console.error('Error obteniendo película:', error);
            res.status(500).send('Error al cargar los datos de la película.');
        }
    }

    async getMoviesByKeyword(req, res) {
        try {
            const keywordId = req.params.id;
            const keywordName = req.query.name || '';

            const movies = await movieService.getMoviesByKeyword(keywordId);

            res.render('resultados_keyword', {
                movies: movies,
                keywordName: keywordName,
                keywordId: keywordId
            });
        } catch (error) {
            console.error('Error obteniendo películas por keyword:', error);
            res.status(500).send('Error al cargar películas por keyword.');
        }
    }
}

module.exports = new MovieController();