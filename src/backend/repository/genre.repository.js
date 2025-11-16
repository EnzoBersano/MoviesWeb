// src/backend/repository/genre.repository.js - NUEVA CLASE
// Repositorio para operaciones de géneros y películas por género
const pool = require('../../../config/db');

class GenreRepository {
    // Obtener todos los géneros
    async getAllGenres() {
        const query = 'SELECT * FROM movies.genre ORDER BY genre_name';
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error obteniendo géneros: ${error.message}`);
        }
    }

    // Obtener películas populares por género (para página principal)
    async getPopularMoviesByGenre(genreId, limit = 10) {
        const query = `
            SELECT DISTINCT m.movie_id, m.title, m.poster_path, m.vote_average, m.release_date
            FROM movies.movie m
            INNER JOIN movies.movie_genres mg ON m.movie_id = mg.movie_id
            WHERE mg.genre_id = $1 AND m.poster_path IS NOT NULL
            ORDER BY m.popularity DESC, m.vote_average DESC
            LIMIT $2
        `;
        try {
            const result = await pool.query(query, [genreId, limit]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error obteniendo películas populares: ${error.message}`);
        }
    }

    // Obtener películas por género con paginación
    async getMoviesByGenre(genreId, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        const query = `
            SELECT DISTINCT m.movie_id, m.title, m.poster_path, m.vote_average, m.release_date
            FROM movies.movie m
            INNER JOIN movies.movie_genres mg ON m.movie_id = mg.movie_id
            WHERE mg.genre_id = $1 AND m.poster_path IS NOT NULL
            ORDER BY m.popularity DESC
            LIMIT $2 OFFSET $3
        `;
        try {
            const result = await pool.query(query, [genreId, limit, offset]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error obteniendo películas por género: ${error.message}`);
        }
    }

    // Contar total de películas por género
    async countMoviesByGenre(genreId) {
        const query = `
            SELECT COUNT(DISTINCT m.movie_id) as total
            FROM movies.movie m
            INNER JOIN movies.movie_genres mg ON m.movie_id = mg.movie_id
            WHERE mg.genre_id = $1 AND m.poster_path IS NOT NULL
        `;
        try {
            const result = await pool.query(query, [genreId]);
            return parseInt(result.rows[0].total);
        } catch (error) {
            throw new Error(`Error contando películas: ${error.message}`);
        }
    }
}

module.exports = new GenreRepository();