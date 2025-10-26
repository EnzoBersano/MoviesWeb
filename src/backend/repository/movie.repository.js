const pool = require('../../config/db');

class MovieRepository {
    async getMovieById(movieId) {
        const query = `
            SELECT
                movie.*,
                actor.person_name as actor_name,
                actor.person_id as actor_id,
                crew_member.person_name as crew_member_name,
                crew_member.person_id as crew_member_id,
                movie_cast.character_name,
                movie_cast.cast_order,
                department.department_name,
                movie_crew.job
            FROM movie
            LEFT JOIN movie_cast ON movie.movie_id = movie_cast.movie_id
            LEFT JOIN person as actor ON movie_cast.person_id = actor.person_id
            LEFT JOIN movie_crew ON movie.movie_id = movie_crew.movie_id
            LEFT JOIN department ON movie_crew.department_id = department.department_id
            LEFT JOIN person as crew_member ON crew_member.person_id = movie_crew.person_id
            WHERE movie.movie_id = $1
        `;

        try {
            const result = await pool.query(query, [movieId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error obteniendo película: ${error.message}`);
        }
    }

    async getMovieGenres(movieId) {
        const query = `
            SELECT genre.genre_id, genre.genre_name
            FROM genre
            INNER JOIN movie_genres ON genre.genre_id = movie_genres.genre_id
            WHERE movie_genres.movie_id = $1
        `;

        try {
            const result = await pool.query(query, [movieId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error obteniendo géneros: ${error.message}`);
        }
    }

    async getMovieCountries(movieId) {
        const query = `
            SELECT country.country_id, country.country_name
            FROM country
            INNER JOIN production_country ON country.country_id = production_country.country_id
            WHERE production_country.movie_id = $1
        `;

        try {
            const result = await pool.query(query, [movieId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error obteniendo países: ${error.message}`);
        }
    }

    async getMovieCompanies(movieId) {
        const query = `
            SELECT production_company.company_id, production_company.company_name
            FROM production_company
            INNER JOIN movie_company ON production_company.company_id = movie_company.company_id
            WHERE movie_company.movie_id = $1
        `;

        try {
            const result = await pool.query(query, [movieId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error obteniendo compañías: ${error.message}`);
        }
    }

    async getMovieKeywords(movieId) {
        const query = `
            SELECT keyword.keyword_id, keyword.keyword_name
            FROM keyword
            INNER JOIN movie_keywords ON keyword.keyword_id = movie_keywords.keyword_id
            WHERE movie_keywords.movie_id = $1
        `;

        try {
            const result = await pool.query(query, [movieId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error obteniendo keywords: ${error.message}`);
        }
    }

    async getMoviesByKeyword(keywordId) {
        const query = `
            SELECT DISTINCT movie.*
            FROM movie
            INNER JOIN movie_keywords ON movie.movie_id = movie_keywords.movie_id
            WHERE movie_keywords.keyword_id = $1
        `;

        try {
            const result = await pool.query(query, [keywordId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error obteniendo películas por keyword: ${error.message}`);
        }
    }
}

module.exports = new MovieRepository();