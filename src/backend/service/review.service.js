const reviewRepository = require('../repository/review.repository');

class ReviewService {
    // Crear reseña
    async createReview(userId, movieId, reviewText) {
        try {
            // Validar datos requeridos
            if (!userId || !movieId || !reviewText) {
                throw new Error('Faltan datos requeridos');
            }

            // Validar que el texto de la reseña no esté vacío
            if (reviewText.trim().length === 0) {
                throw new Error('La reseña no puede estar vacía');
            }

            // Validar longitud mínima y máxima
            if (reviewText.trim().length < 10) {
                throw new Error('La reseña debe tener al menos 10 caracteres');
            }

            if (reviewText.length > 5000) {
                throw new Error('La reseña no puede exceder los 5000 caracteres');
            }

            // Verificar si ya existe una reseña
            const existingReview = await reviewRepository.getUserReviewForMovie(userId, movieId);
            if (existingReview) {
                throw new Error('Ya existe una reseña de este usuario para esta película');
            }

            const review = await reviewRepository.createReview(userId, movieId, reviewText);
            return review;
        } catch (error) {
            throw new Error(`Error creando reseña: ${error.message}`);
        }
    }

    // Obtener reseñas de una película
    async getReviewsByMovie(movieId) {
        try {
            if (!movieId) {
                throw new Error('ID de película requerido');
            }

            const reviews = await reviewRepository.getReviewsByMovie(movieId);
            return reviews;
        } catch (error) {
            throw new Error(`Error obteniendo reseñas: ${error.message}`);
        }
    }

    // Obtener reseñas de un usuario
    async getReviewsByUser(userId) {
        try {
            if (!userId) {
                throw new Error('ID de usuario requerido');
            }

            const reviews = await reviewRepository.getReviewsByUser(userId);
            return reviews;
        } catch (error) {
            throw new Error(`Error obteniendo reseñas: ${error.message}`);
        }
    }

    // Obtener reseña por ID
    async getReviewById(reviewId) {
        try {
            if (!reviewId) {
                throw new Error('ID de reseña requerido');
            }

            const review = await reviewRepository.getReviewById(reviewId);
            if (!review) {
                throw new Error('Reseña no encontrada');
            }

            return review;
        } catch (error) {
            throw new Error(`Error obteniendo reseña: ${error.message}`);
        }
    }

    // Actualizar reseña
    async updateReview(reviewId, reviewText) {
        try {
            if (!reviewId || !reviewText) {
                throw new Error('Faltan datos requeridos');
            }

            // Validar que el texto no esté vacío
            if (reviewText.trim().length === 0) {
                throw new Error('La reseña no puede estar vacía');
            }

            // Validar longitud
            if (reviewText.trim().length < 10) {
                throw new Error('La reseña debe tener al menos 10 caracteres');
            }

            if (reviewText.length > 5000) {
                throw new Error('La reseña no puede exceder los 5000 caracteres');
            }

            const review = await reviewRepository.updateReview(reviewId, reviewText);
            if (!review) {
                throw new Error('Reseña no encontrada');
            }

            return review;
        } catch (error) {
            throw new Error(`Error actualizando reseña: ${error.message}`);
        }
    }

    // Eliminar reseña
    async deleteReview(reviewId) {
        try {
            if (!reviewId) {
                throw new Error('ID de reseña requerido');
            }

            const review = await reviewRepository.deleteReview(reviewId);
            if (!review) {
                throw new Error('Reseña no encontrada');
            }

            return review;
        } catch (error) {
            throw new Error(`Error eliminando reseña: ${error.message}`);
        }
    }

    // Obtener reseña de usuario para una película específica
    async getUserReviewForMovie(userId, movieId) {
        try {
            if (!userId || !movieId) {
                throw new Error('ID de usuario y película requeridos');
            }

            const review = await reviewRepository.getUserReviewForMovie(userId, movieId);
            return review;
        } catch (error) {
            throw new Error(`Error obteniendo reseña: ${error.message}`);
        }
    }
}

module.exports = new ReviewService();