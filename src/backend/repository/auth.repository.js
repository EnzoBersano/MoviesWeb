const pool = require('../../../config/db');

class AuthRepository {
    async createUser(userData) {
        const query = `
            INSERT INTO movies.users (user_username, user_email, user_password, user_name, created_at)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            RETURNING user_id, user_username, user_email, user_name, created_at
        `;

        try {
            const result = await pool.query(query, [
                userData.username,
                userData.email,
                userData.password,
                userData.name || null
            ]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error creando usuario: ${error.message}`);
        }
    }

    async findUserByEmail(email) {
        const query = `
            SELECT user_id, user_username, user_email, user_password, user_name, created_at
            FROM movies.users
            WHERE user_email = $1
        `;

        try {
            const result = await pool.query(query, [email]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error buscando usuario por email: ${error.message}`);
        }
    }

    async findUserByUsername(username) {
        const query = `
            SELECT user_id, user_username, user_email, user_name, created_at
            FROM movies.users
            WHERE user_username = $1
        `;

        try {
            const result = await pool.query(query, [username]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error buscando usuario por username: ${error.message}`);
        }
    }

    async findUserById(userId) {
        const query = `
            SELECT user_id, user_username, user_email, user_name, created_at
            FROM movies.users
            WHERE user_id = $1
        `;

        try {
            const result = await pool.query(query, [userId]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error buscando usuario por ID: ${error.message}`);
        }
    }

    async updateUserPassword(userId, hashedPassword) {
        const query = `
            UPDATE movies.users
            SET user_password = $1, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $2
            RETURNING user_id, user_username, user_email
        `;

        try {
            const result = await pool.query(query, [hashedPassword, userId]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error actualizando contraseña: ${error.message}`);
        }
    }
}

module.exports = new AuthRepository();