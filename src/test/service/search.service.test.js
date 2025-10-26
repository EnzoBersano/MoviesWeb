// test/services/search.service.test.js
jest.mock('../../src/backend/repository/search.repository', () => ({
    searchMovies: jest.fn(),
    searchActors: jest.fn(),
    searchDirectors: jest.fn(),
    searchKeywords: jest.fn(),
}));

const repo = require('../../src/backend/repository/search.repository');
const SearchService = require('../../src/backend/service/search.service');

describe('SearchService', () => {
    beforeEach(() => jest.clearAllMocks());

    test('searchAll → combina resultados', async () => {
        repo.searchMovies.mockResolvedValue([{ id: 1 }]);
        repo.searchActors.mockResolvedValue([{ id: 2 }]);
        repo.searchDirectors.mockResolvedValue([{ id: 3 }]);
        repo.searchKeywords.mockResolvedValue([{ id: 4 }]);

        const out = await SearchService.searchAll('ring');

        expect(repo.searchMovies).toHaveBeenCalledWith('ring');
        expect(repo.searchActors).toHaveBeenCalledWith('ring');
        expect(repo.searchDirectors).toHaveBeenCalledWith('ring');
        expect(repo.searchKeywords).toHaveBeenCalledWith('ring');

        expect(out).toEqual({
            movies: [{ id: 1 }],
            actors: [{ id: 2 }],
            directors: [{ id: 3 }],
            keywords: [{ id: 4 }],
            searchTerm: 'ring',
        });
    });

    test('searchAll → error envuelto', async () => {
        repo.searchMovies.mockRejectedValue(new Error('db'));
        await expect(SearchService.searchAll('x'))
            .rejects.toThrow('Error en búsqueda: db');
    });
});
