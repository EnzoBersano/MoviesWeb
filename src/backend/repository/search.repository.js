const pool = require('../../../config/db');

class SearchRepository {
    async searchMovies(searchTerm) {
        const query = 'SELECT * FROM movie WHERE title ILIKE $1';
        const values = [`%${searchTerm}%`];

        try {
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error buscando películas: ${error.message}`);
        }
    }

    async searchActors(searchTerm) {
        const query = `
            SELECT DISTINCT person.person_id, person.person_name
            FROM person
            INNER JOIN movie_cast ON person.person_id = movie_cast.person_id
            WHERE person.person_name ILIKE $1
        `;
        const values = [`%${searchTerm}%`];

        try {
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error buscando actores: ${error.message}`);
        }
    }

    async searchDirectors(searchTerm) {
        const query = `
            SELECT DISTINCT person.person_id, person.person_name
            FROM person
            INNER JOIN movie_crew ON person.person_id = movie_crew.person_id
            WHERE movie_crew.job = 'Director' AND person.person_name ILIKE $1
        `;
        const values = [`%${searchTerm}%`];

        try {
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error buscando directores: ${error.message}`);
        }
    }

    async searchKeywords(searchTerm) {
        const query = `
            SELECT DISTINCT keyword.keyword_id, keyword.keyword_name
            FROM keyword
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