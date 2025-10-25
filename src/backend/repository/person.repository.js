const pool = require('../../config/database');

class PersonRepository {
    async getActorMovies(actorId) {
        const query = `
            SELECT DISTINCT
                person.person_name as actor_name,
                movie.*
            FROM movie
            INNER JOIN movie_cast ON movie.movie_id = movie_cast.movie_id
            INNER JOIN person ON person.person_id = movie_cast.person_id
            WHERE movie_cast.person_id = $1
            ORDER BY movie.release_date DESC
        `;

        try {
            const result = await pool.query(query, [actorId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error obteniendo películas del actor: ${error.message}`);
        }
    }

    async getDirectorMovies(directorId) {
        const query = `
            SELECT DISTINCT
                person.person_name as director_name,
                movie.*
            FROM movie
            INNER JOIN movie_crew ON movie.movie_id = movie_crew.movie_id
            INNER JOIN person ON person.person_id = movie_crew.person_id
            WHERE movie_crew.job = 'Director' AND movie_crew.person_id = $1
            ORDER BY movie.release_date DESC
        `;

        try {
            const result = await pool.query(query, [directorId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error obteniendo películas del director: ${error.message}`);
        }
    }

    async getPersonById(personId) {
        const query = `
            SELECT person_id, person_name
            FROM person
            WHERE person_id = $1
        `;

        try {
            const result = await pool.query(query, [personId]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error obteniendo persona: ${error.message}`);
        }
    }
}

module.exports = new PersonRepository();