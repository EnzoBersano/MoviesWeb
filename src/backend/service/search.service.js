const searchRepository = require('../repository/search.repository');

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
                movies,
                actors,
                directors,
                keywords,
                searchTerm
            };
        } catch (error) {
            throw new Error(`Error en búsqueda: ${error.message}`);
        }
    }
}

module.exports = new SearchService();