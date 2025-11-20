const pool = require('../../../config/db');

class UserRepository {
    async getAllUsers() {
        const query = 'SELECT * FROM movies.users ORDER BY user_name';

        try {
            const result = await pool.query(query);
            console.log('Usuarios encontrados en BD:', result.rows.length); // Debug
            return result.rows;
        } catch (error) {
            console.error('Error en getAllUsers:', error);
            throw new Error(`Error obteniendo usuarios: ${error.message}`);
        }
    }

    async getUserById(userId) {
        const query = 'SELECT * FROM movies.users WHERE user_id = $1';

        try {
            const result = await pool.query(query, [userId]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error obteniendo usuario: ${error.message}`);
        }
    }

    async getUserByUsername(username) {
        const query = 'SELECT * FROM movies.users WHERE user_username = $1';

        try {
            const result = await pool.query(query, [username]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error obteniendo usuario por username: ${error.message}`);
        }
    }

    async createUser(userData) {
        const query = `
            INSERT INTO movies.users (user_username, user_name, user_email)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [userData.username, userData.name, userData.email];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error creando usuario: ${error.message}`);
        }
    }

    async updateUser(userId, userData) {
        const query = `
            UPDATE movies.users
            SET user_username = $1, user_name = $2, user_email = $3
            WHERE user_id = $4
            RETURNING *
        `;
        const values = [userData.username, userData.name, userData.email, userId];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error actualizando usuario: ${error.message}`);
        }
    }

    async deleteUser(userId) {
        const query = 'DELETE FROM movies.users WHERE user_id = $1 RETURNING *';

        try {
            const result = await pool.query(query, [userId]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error eliminando usuario: ${error.message}`);
        }
    }

    async getUserMovies(userId) {
        const query = `
            SELECT
                mu.*,
                m.title,
                m.release_date,
                m.overview,
                m.vote_average
            FROM movies.movie_user mu
                     INNER JOIN movies.movie m ON mu.movie_id = m.movie_id
            WHERE mu.user_id = $1
            ORDER BY mu.created_at DESC
        `;

        try {
            const result = await pool.query(query, [userId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error obteniendo películas del usuario: ${error.message}`);
        }
    }

    async addMovieToUser(userId, movieId, rating, opinion) {
        const query = `
            INSERT INTO movies.movie_user (user_id, movie_id, rating, opinion)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, movie_id)
                DO UPDATE SET
                              rating = EXCLUDED.rating,
                              opinion = EXCLUDED.opinion,
                              updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        const values = [userId, movieId, rating, opinion];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error agregando película al usuario: ${error.message}`);
        }
    }

    async removeMovieFromUser(userId, movieId) {
        const query = 'DELETE FROM movies.movie_user WHERE user_id = $1 AND movie_id = $2 RETURNING *';

        try {
            const result = await pool.query(query, [userId, movieId]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error eliminando película del usuario: ${error.message}`);
        }
    }

    async getUserMovieRating(userId, movieId) {
        const query = `
            SELECT * FROM movies.movie_user
            WHERE user_id = $1 AND movie_id = $2
        `;

        try {
            const result = await pool.query(query, [userId, movieId]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error obteniendo rating del usuario: ${error.message}`);
        }
    }
}

module.exports = new UserRepository();