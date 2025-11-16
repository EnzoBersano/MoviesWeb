// src/backend/config/tmdb.js - NUEVA CLASE
// Configuración para integración con API de TMDB
require('dotenv').config();

class TMDBConfig {
    constructor() {
        this.apiKey = process.env.TMDB_API_KEY;
        this.baseUrl = 'https://api.themoviedb.org/3';
        this.imageBaseUrl = 'https://image.tmdb.org/t/p';
        this.posterSizes = {
            small: 'w185',
            medium: 'w342',
            large: 'w500',
            original: 'original'
        };
    }

    // Obtener URL completa de poster
    getPosterUrl(posterPath, size = 'medium') {
        if (!posterPath) return '/assets/no-image.png';
        return `${this.imageBaseUrl}/${this.posterSizes[size]}${posterPath}`;
    }

    // Obtener URL de perfil de persona
    getProfileUrl(profilePath, size = 'medium') {
        if (!profilePath) return '/assets/no-profile.png';
        return `${this.imageBaseUrl}/${this.posterSizes[size]}${profilePath}`;
    }
}

module.exports = new TMDBConfig();