// src/backend/repository/search.repository.js - ACTUALIZAR CLASE EXISTENTE
// Agregar paginación a búsquedas
const pool = require('../../../config/db');

class SearchRepository {
    // Búsqueda de películas con paginación
    async searchMovies(searchTerm, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        const query = `
            SELECT movie_id, title, poster_path, vote_average, release_date  
            FROM movies.movie 
            WHERE title ILIKE $1 AND poster_path IS NOT NULL
            ORDER BY popularity DESC
            LIMIT $2 OFFSET $3
        `;
        const values = [`%${searchTerm}%`, limit, offset];

        try {
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error buscando películas: ${error.message}`);
        }
    }

    // Contar películas en búsqueda
    async countMovies(searchTerm) {
        const query = `
            SELECT COUNT(*) as total
            FROM movies.movie
            WHERE title ILIKE $1 AND poster_path IS NOT NULL
        `;
        try {
            const result = await pool.query(query, [`%${searchTerm}%`]);
            return parseInt(result.rows[0].total);
        } catch (error) {
            throw new Error(`Error contando películas: ${error.message}`);
        }
    }

    // Búsqueda de actores con paginación
    async searchActors(searchTerm, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        const query = `
            SELECT DISTINCT person.person_id, person.person_name
            FROM movies.person
            INNER JOIN movies.movie_cast ON person.person_id = movie_cast.person_id
            WHERE person.person_name ILIKE $1
            ORDER BY person.person_name
            LIMIT $2 OFFSET $3
        `;
        const values = [`%${searchTerm}%`, limit, offset];

        try {
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error buscando actores: ${error.message}`);
        }
    }

    // Contar actores
    async countActors(searchTerm) {
        const query = `
            SELECT COUNT(DISTINCT person.person_id) as total
            FROM movies.person
                     INNER JOIN movies.movie_cast ON person.person_id = movie_cast.person_id
            WHERE person.person_name ILIKE $1
        `;
        try {
            const result = await pool.query(query, [`%${searchTerm}%`]);
            return parseInt(result.rows[0].total);
        } catch (error) {
            throw new Error(`Error contando actores: ${error.message}`);
        }
    }

    // Búsqueda de directores con paginación
    async searchDirectors(searchTerm, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        const query = `
            SELECT DISTINCT person.person_id, person.person_name
            FROM movies.person
            INNER JOIN movies.movie_crew ON person.person_id = movie_crew.person_id
            WHERE movie_crew.job = 'Director' AND person.person_name ILIKE $1
            ORDER BY person.person_name
            LIMIT $2 OFFSET $3
        `;
        const values = [`%${searchTerm}%`, limit, offset];

        try {
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error buscando directores: ${error.message}`);
        }
    }

    // Contar directores
    async countDirectors(searchTerm) {
        const query = `
            SELECT COUNT(DISTINCT person.person_id) as total
            FROM movies.person
            INNER JOIN movies.movie_crew ON person.person_id = movie_crew.person_id
            WHERE movie_crew.job = 'Director' AND person.person_name ILIKE $1
        `;
        try {
            const result = await pool.query(query, [`%${searchTerm}%`]);
            return parseInt(result.rows[0].total);
        } catch (error) {
            throw new Error(`Error contando directores: ${error.message}`);
        }
    }

    async searchKeywords(searchTerm) {
        const query = `
            SELECT DISTINCT keyword.keyword_id, keyword.keyword_name
            FROM movies.keyword
            WHERE keyword.keyword_name ILIKE $1
        `;
        const values = [`%${searchTerm}%`];

        try {
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error buscando keywords: ${error.message}`);
        }
    }
}

module.exports = new SearchRepository();