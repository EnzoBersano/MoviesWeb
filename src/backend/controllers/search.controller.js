// src/backend/controllers/search.controller.js - ACTUALIZAR CLASE EXISTENTE
// Agregar búsquedas con paginación
const searchService = require('../service/search.service');

class SearchController {
    // Búsqueda general (sin paginación)
    async search(req, res) {
        try {
            const searchTerm = req.query.q;

            if (!searchTerm || searchTerm.trim() === '') {
                return res.render('resultado', {
                    movies: [],
                    actors: [],
                    directors: [],
                    keywords: [],
                    searchTerm: ''
                });
            }

            const results = await searchService.searchAll(searchTerm);
            res.render('resultado', results);
        } catch (error) {
            console.error('Error en búsqueda:', error);
            res.status(500).send('Error en la búsqueda.');
        }
    }

    // Búsqueda de películas con paginación
    async searchMovies(req, res) {
        try {
            const searchTerm = req.query.q;
            const page = parseInt(req.query.page) || 1;

            if (!searchTerm || searchTerm.trim() === '') {
                return res.redirect('/');
            }

            const data = await searchService.searchMoviesWithPagination(searchTerm, page);
            res.render('search-movies', data);
        } catch (error) {
            console.error('Error en búsqueda de películas:', error);
            res.status(500).send('Error en la búsqueda.');
        }
    }

    // Búsqueda de actores con paginación
    async searchActors(req, res) {
        try {
            const searchTerm = req.query.q;
            const page = parseInt(req.query.page) || 1;

            if (!searchTerm || searchTerm.trim() === '') {
                return res.redirect('/');
            }

            const data = await searchService.searchActorsWithPagination(searchTerm, page);
            res.render('search-actors', data);
        } catch (error) {
            console.error('Error en búsqueda de actores:', error);
            res.status(500).send('Error en la búsqueda.');
        }
    }

    // Búsqueda de directores con paginación
    async searchDirectors(req, res) {
        try {
            const searchTerm = req.query.q;
            const page = parseInt(req.query.page) || 1;

            if (!searchTerm || searchTerm.trim() === '') {
                return res.redirect('/');
            }

            const data = await searchService.searchDirectorsWithPagination(searchTerm, page);
            res.render('search-directors', data);
        } catch (error) {
            console.error('Error en búsqueda de directores:', error);
            res.status(500).send('Error en la búsqueda.');
        }
    }
}

module.exports = new SearchController();