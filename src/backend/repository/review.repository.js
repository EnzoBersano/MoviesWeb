const pool = require('../../../config/db');

class ReviewRepository {
    // Crear reseña
    async createReview(userId, movieId, reviewText) {
        const query = `
            INSERT INTO reviews (user_id, movie_id, review_text, created_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING review_id, user_id, movie_id, review_text, created_at
        `;

        try {
            const result = await pool.query(query, [userId, movieId, reviewText]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error creando reseña: ${error.message}`);
        }
    }

    // Obtener reseñas de una película
    async getReviewsByMovie(movieId) {
        const query = `
            SELECT r.*, u.user_username, u.user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.movie_id = $1
            ORDER BY r.created_at DESC
        `;

        try {
            const result = await pool.query(query, [movieId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error obteniendo reseñas de película: ${error.message}`);
        }
    }

    // Obtener reseñas de un usuario
    async getReviewsByUser(userId) {
        const query = `
            SELECT r.*, m.title as movie_title
            FROM reviews r
            JOIN movie m ON r.movie_id = m.movie_id
            WHERE r.user_id = $1
            ORDER BY r.created_at DESC
        `;

        try {
            const result = await pool.query(query, [userId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error obteniendo reseñas de usuario: ${error.message}`);
        }
    }

    // Obtener reseña por ID
    async getReviewById(reviewId) {
        const query = `
            SELECT r.*, u.user_username, u.user_name, m.title as movie_title
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            JOIN movie m ON r.movie_id = m.movie_id
            WHERE r.review_id = $1
        `;

        try {
            const result = await pool.query(query, [reviewId]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error obteniendo reseña: ${error.message}`);
        }
    }

    // Actualizar reseña
    async updateReview(reviewId, reviewText) {
        const query = `
            UPDATE reviews
            SET review_text = $1, updated_at = NOW()
            WHERE review_id = $2
            RETURNING review_id, user_id, movie_id, review_text, created_at, updated_at
        `;

        try {
            const result = await pool.query(query, [reviewText, reviewId]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error actualizando reseña: ${error.message}`);
        }
    }

    // Eliminar reseña
    async deleteReview(reviewId) {
        const query = 'DELETE FROM reviews WHERE review_id = $1 RETURNING *';

        try {
            const result = await pool.query(query, [reviewId]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error eliminando reseña: ${error.message}`);
        }
    }

    // Verificar si un usuario ya tiene una reseña para una película
    async getUserReviewForMovie(userId, movieId) {
        const query = `
            SELECT * FROM reviews 
            WHERE user_id = $1 AND movie_id = $2
        `;

        try {
            const result = await pool.query(query, [userId, movieId]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error verificando reseña: ${error.message}`);
        }
    }
}

module.exports = new ReviewRepository();