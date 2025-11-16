// src/backend/service/search.service.js - ACTUALIZAR CLASE EXISTENTE
// Agregar paginación a búsquedas
const searchRepository = require('../repository/search.repository');
const tmdbConfig = require('../config/tmdb');

class SearchService {
    async searchAll(searchTerm) {
        try {
            const [movies, actors, directors, keywords] = await Promise.all([
                searchRepository.searchMovies(searchTerm),
                searchRepository.searchActors(searchTerm),
                searchRepository.searchDirectors(searchTerm),
                searchRepository.searchKeywords(searchTerm)
            ]);

            return {
                movies: movies.map(m => ({
                    ...m,
                    poster_url: tmdbConfig.getPosterUrl(m.poster_path, 'medium')
                })),
                actors,
                directors,
                keywords,
                searchTerm
            };
        } catch (error) {
            throw new Error(`Error en búsqueda: ${error.message}`);
        }
    }

    // Búsqueda con paginación para películas
    async searchMoviesWithPagination(searchTerm, page = 1) {
        try {
            const limit = 50;
            const [movies, total] = await Promise.all([
                searchRepository.searchMovies(searchTerm, page, limit),
                searchRepository.countMovies(searchTerm)
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
                movies: movies.map(m => ({
                    ...m,
                    poster_url: tmdbConfig.getPosterUrl(m.poster_path, 'medium')
                })),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalMovies: total,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                searchTerm
            };
        } catch (error) {
            throw new Error(`Error en búsqueda de películas: ${error.message}`);
        }
    }

    // Búsqueda con paginación para actores
    async searchActorsWithPagination(searchTerm, page = 1) {
        try {
            const limit = 50;
            const [actors, total] = await Promise.all([
                searchRepository.searchActors(searchTerm, page, limit),
                searchRepository.countActors(searchTerm)
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
                actors,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: total,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                searchTerm
            };
        } catch (error) {
            throw new Error(`Error en búsqueda de actores: ${error.message}`);
        }
    }

    // Búsqueda con paginación para directores
    async searchDirectorsWithPagination(searchTerm, page = 1) {
        try {
            const limit = 50;
            const [directors, total] = await Promise.all([
                searchRepository.searchDirectors(searchTerm, page, limit),
                searchRepository.countDirectors(searchTerm)
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
                directors,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: total,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                searchTerm
            };
        } catch (error) {
            throw new Error(`Error en búsqueda de directores: ${error.message}`);
        }
    }
}

module.exports = new SearchService();