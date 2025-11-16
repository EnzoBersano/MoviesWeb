// src/backend/service/genre.service.js - NUEVA CLASE
// Lógica de negocio para géneros
const genreRepository = require('../repository/genre.repository');
const tmdbConfig = require('../config/tmdb');

class GenreService {
    // Obtener todos los géneros con películas populares
    async getGenresWithPopularMovies() {
        try {
            const genres = await genreRepository.getAllGenres();
            const genresWithMovies = await Promise.all(
                genres.map(async (genre) => {
                    const movies = await genreRepository.getPopularMoviesByGenre(genre.genre_id, 10);
                    return {
                        ...genre,
                        movies: movies.map(movie => ({
                            ...movie,
                            poster_url: tmdbConfig.getPosterUrl(movie.poster_path, 'medium')
                        }))
                    };
                })
            );
            return genresWithMovies.filter(g => g.movies.length > 0);
        } catch (error) {
            throw new Error(`Error en servicio de géneros: ${error.message}`);
        }
    }

    // Obtener películas por género con paginación
    async getMoviesByGenre(genreId, page = 1) {
        try {
            const limit = 50;
            const [movies, total, genres] = await Promise.all([
                genreRepository.getMoviesByGenre(genreId, page, limit),
                genreRepository.countMoviesByGenre(genreId),
                genreRepository.getAllGenres()
            ]);

            const genre = genres.find(g => g.genre_id == genreId);
            const totalPages = Math.ceil(total / limit);

            return {
                genre: genre || { genre_name: 'Desconocido' },
                movies: movies.map(movie => ({
                    ...movie,
                    poster_url: tmdbConfig.getPosterUrl(movie.poster_path, 'medium')
                })),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalMovies: total,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            };
        } catch (error) {
            throw new Error(`Error obteniendo películas por género: ${error.message}`);
        }
    }
}

module.exports = new GenreService();