// __tests__/controllers/search.controller.test.js
jest.mock('../../service/search.service', () => ({
    searchAll: jest.fn(),
}));

const searchService = require('../../service/search.service');
const SearchController = require('../../controllers/search.controller'); // ajustá la ruta

const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.render = jest.fn();
    res.send = jest.fn();
    return res;
};

describe('SearchController', () => {
    beforeEach(() => jest.clearAllMocks());

    test('search → término vacío renderiza resultado vacío', async () => {
        const req = { query: { q: '   ' } };
        const res = mockRes();

        await SearchController.search(req, res);

        expect(res.render).toHaveBeenCalledWith('resultado', {
            movies: [],
            actors: [],
            directors: [],
            keywords: [],
            searchTerm: '',
        });
        expect(searchService.searchAll).not.toHaveBeenCalled();
    });

    test('search → renderiza resultados cuando hay término', async () => {
        const req = { query: { q: 'ring' } };
        const res = mockRes();
        const fakeResults = {
            movies: [{ id: 1, title: 'The Lord of the Rings' }],
            actors: [{ id: 2, name: 'Ian McKellen' }],
            directors: [{ id: 3, name: 'Peter Jackson' }],
            keywords: [{ id: 4, name: 'fantasy' }],
            searchTerm: 'ring',
        };
        searchService.searchAll.mockResolvedValue(fakeResults);

        await SearchController.search(req, res);

        expect(searchService.searchAll).toHaveBeenCalledWith('ring');
        expect(res.render).toHaveBeenCalledWith('resultado', fakeResults);
    });

    test('search → 500 on error', async () => {
        const req = { query: { q: 'ring' } };
        const res = mockRes();
        searchService.searchAll.mockRejectedValue(new Error('db down'));

        await SearchController.search(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error en la búsqueda.');
    });
});
