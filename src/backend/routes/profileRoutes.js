// src/backend/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const ActivityService = require('../services/activityService');

// Página de perfil con timeline
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const [timeline, stats] = await Promise.all([
            ActivityService.getUserTimeline(userId, 50),
            ActivityService.getUserStats(userId)
        ]);

        res.render('profile', {
            userId,
            timeline,
            stats,
            error: null
        });
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        res.render('profile', {
            userId: req.params.userId,
            timeline: [],
            stats: { totalRatings: 0, totalReviews: 0, totalFavorites: 0 },
            error: 'Error al cargar el perfil'
        });
    }
});

// API: Registrar calificación
router.post('/api/rate', async (req, res) => {
    try {
        const { userId, movieId, movieTitle, rating } = req.body;

        if (!userId || !movieId || !movieTitle || !rating) {
            return res.status(400).json({
                success: false,
                error: 'Faltan parámetros requeridos'
            });
        }

        const activity = await ActivityService.logRating(userId, movieId, movieTitle, rating);

        res.json({ success: true, activity });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API: Registrar reseña
router.post('/api/review', async (req, res) => {
    try {
        const { userId, movieId, movieTitle, reviewText } = req.body;

        if (!userId || !movieId || !movieTitle || !reviewText) {
            return res.status(400).json({
                success: false,
                error: 'Faltan parámetros requeridos'
            });
        }

        const reviewId = `review_${Date.now()}`;
        const activity = await ActivityService.logReview(userId, movieId, movieTitle, reviewId, reviewText);

        res.json({ success: true, activity });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API: Registrar favorito
router.post('/api/favorite', async (req, res) => {
    try {
        const { userId, movieId, movieTitle } = req.body;

        if (!userId || !movieId || !movieTitle) {
            return res.status(400).json({
                success: false,
                error: 'Faltan parámetros requeridos'
            });
        }

        const activity = await ActivityService.logFavorite(userId, movieId, movieTitle);

        res.json({ success: true, activity });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;