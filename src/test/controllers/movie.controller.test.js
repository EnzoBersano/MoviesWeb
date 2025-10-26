// __tests__/controllers/movie.controller.test.js
jest.mock('../../service/movie.service', () => ({
    getMovieDetails: jest.fn(),
    getMoviesByKeyword: jest.fn(),
}));

const movieService = require('../../service/movie.service');
const MovieController = require('../../controllers/movie.controller'); // ajustá la ruta si difiere

const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.render = jest.fn();
    res.send = jest.fn();
    res.redirect = jest.fn();
    return res;
};

describe('MovieController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getMovieDetails → renderiza vista con datos cuando existe', async () => {
        const req = { params: { id: '10' } };
        const res = mockRes();
        movieService.getMovieDetails.mockResolvedValue({ id: 10, title: 'Matrix' });

        await MovieController.getMovieDetails(req, res);

        expect(movieService.getMovieDetails).toHaveBeenCalledWith('10');
        expect(res.render).toHaveBeenCalledWith('pelicula', { movie: { id: 10, title: 'Matrix' } });
    });

    test('getMovieDetails → 404 cuando no existe', async () => {
        const req = { params: { id: '99' } };
        const res = mockRes();
        movieService.getMovieDetails.mockResolvedValue(null);

        await MovieController.getMovieDetails(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Película no encontrada.');
    });

    test('getMovieDetails → 500 on error', async () => {
        const req = { params: { id: '10' } };
        const res = mockRes();
        movieService.getMovieDetails.mockRejectedValue(new Error('boom'));

        await MovieController.getMovieDetails(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error al cargar los datos de la película.');
    });

    test('getMoviesByKeyword → renderiza resultados', async () => {
        const req = { params: { id: '7' }, query: { name: 'action' } };
        const res = mockRes();
        movieService.getMoviesByKeyword.mockResolvedValue([{ id: 1, title: 'Die Hard' }]);

        await MovieController.getMoviesByKeyword(req, res);

        expect(movieService.getMoviesByKeyword).toHaveBeenCalledWith('7');
        expect(res.render).toHaveBeenCalledWith('resultados_keyword', {
            movies: [{ id: 1, title: 'Die Hard' }],
            keywordName: 'action',
            keywordId: '7',
        });
    });

    test('getMoviesByKeyword → 500 on error', async () => {
        const req = { params: { id: '7' }, query: { name: 'action' } };
        const res = mockRes();
        movieService.getMoviesByKeyword.mockRejectedValue(new Error('db error'));

        await MovieController.getMoviesByKeyword(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error al cargar películas por keyword.');
    });
});
