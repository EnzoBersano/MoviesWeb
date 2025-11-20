const reviewService = require('../service/review.service');

class ReviewController {
    // Crear reseña
    async createReview(req, res) {
        try {
            const { movieId, reviewText } = req.body;
            const userId = req.user.userId; // Tomamos el userId del token

            const review = await reviewService.createReview(userId, movieId, reviewText);

            res.json({
                success: true,
                reviewId: review.review_id,
                message: 'Reseña creada exitosamente',
                data: review
            });
        } catch (error) {
            console.error('Error creando reseña:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error al crear la reseña'
            });
        }
    }

    // Obtener reseñas de una película
    async getMovieReviews(req, res) {
        try {
            const { movieId } = req.params;

            const reviews = await reviewService.getReviewsByMovie(movieId);

            res.json({
                success: true,
                reviews: reviews,
                count: reviews.length
            });
        } catch (error) {
            console.error('Error obteniendo reseñas de película:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener reseñas'
            });
        }
    }

    // Obtener reseñas de un usuario
    async getUserReviews(req, res) {
        try {
            const { userId } = req.params;

            const reviews = await reviewService.getReviewsByUser(userId);

            res.json({
                success: true,
                reviews: reviews,
                count: reviews.length
            });
        } catch (error) {
            console.error('Error obteniendo reseñas de usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener reseñas'
            });
        }
    }

    // Obtener reseña por ID
    async getReviewById(req, res) {
        try {
            const { reviewId } = req.params;

            const review = await reviewService.getReviewById(reviewId);

            res.json({
                success: true,
                review: review
            });
        } catch (error) {
            console.error('Error obteniendo reseña:', error);
            res.status(404).json({
                success: false,
                message: error.message || 'Reseña no encontrada'
            });
        }
    }

    // Actualizar reseña
    async updateReview(req, res) {
        try {
            const { reviewId } = req.params;
            const { reviewText } = req.body;
            const currentUserId = req.user.userId;

            // Verificar que el usuario es dueño de la reseña
            const existingReview = await reviewService.getReviewById(reviewId);
            if (!existingReview) {
                return res.status(404).json({ success: false, message: 'Reseña no encontrada' });
            }
            if (existingReview.user_id !== currentUserId) {
                return res.status(403).json({ success: false, message: 'No tienes permisos para editar esta reseña' });
            }

            const review = await reviewService.updateReview(reviewId, reviewText);
            res.json({
                success: true,
                message: 'Reseña actualizada exitosamente',
                data: review
            });
        } catch (error) {
            console.error('Error actualizando reseña:', error);
            res.status(500).json({ success: false, message: error.message || 'Error al actualizar la reseña' });
        }
    }


    // Eliminar reseña
    async deleteReview(req, res) {
        try {
            const { reviewId } = req.params;
            const currentUserId = req.user.userId;

            const existingReview = await reviewService.getReviewById(reviewId);
            if (!existingReview) {
                return res.status(404).json({ success: false, message: 'Reseña no encontrada' });
            }
            if (existingReview.user_id !== currentUserId) {
                return res.status(403).json({ success: false, message: 'No tienes permisos para eliminar esta reseña' });
            }

            await reviewService.deleteReview(reviewId);
            res.json({ success: true, message: 'Reseña eliminada exitosamente' });
        } catch (error) {
            console.error('Error eliminando reseña:', error);
            res.status(500).json({ success: false, message: error.message || 'Error al eliminar la reseña' });
        }
    }


    // Obtener reseña de usuario para película específica
    async getUserMovieReview(req, res) {
        try {
            const { userId, movieId } = req.params;

            const review = await reviewService.getUserReviewForMovie(userId, movieId);

            if (!review) {
                return res.json({
                    success: true,
                    review: null,
                    message: 'El usuario no ha escrito una reseña para esta película'
                });
            }

            res.json({
                success: true,
                review: review
            });
        } catch (error) {
            console.error('Error obteniendo reseña:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener reseña'
            });
        }
    }
}

module.exports = new ReviewController();