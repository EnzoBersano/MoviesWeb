const searchService = require('../service/search.service');

class SearchController {
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
}

module.exports = new SearchController();