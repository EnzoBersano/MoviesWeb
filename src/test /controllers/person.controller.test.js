// __tests__/controllers/person.controller.test.js
jest.mock('../../service/person.service', () => ({
    getActorDetails: jest.fn(),
    getDirectorDetails: jest.fn(),
}));

const personService = require('../../service/person.service');
const PersonController = require('../../controllers/person.controller'); // ajustá la ruta

const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.render = jest.fn();
    res.send = jest.fn();
    return res;
};

describe('PersonController', () => {
    beforeEach(() => jest.clearAllMocks());

    test('getActorDetails → renderiza actor con películas', async () => {
        const req = { params: { id: '3' } };
        const res = mockRes();
        personService.getActorDetails.mockResolvedValue({
            actorName: 'Keanu Reeves',
            movies: [{ id: 10, title: 'Matrix' }],
        });

        await PersonController.getActorDetails(req, res);

        expect(personService.getActorDetails).toHaveBeenCalledWith('3');
        expect(res.render).toHaveBeenCalledWith('actor', {
            actorName: 'Keanu Reeves',
            movies: [{ id: 10, title: 'Matrix' }],
        });
    });

    test('getActorDetails → 404 si no existe', async () => {
        const req = { params: { id: '999' } };
        const res = mockRes();
        personService.getActorDetails.mockResolvedValue(null);

        await PersonController.getActorDetails(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Actor no encontrado.');
    });

    test('getActorDetails → 500 on error', async () => {
        const req = { params: { id: '3' } };
        const res = mockRes();
        personService.getActorDetails.mockRejectedValue(new Error('x'));

        await PersonController.getActorDetails(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error al cargar las películas del actor.');
    });

    test('getDirectorDetails → renderiza director con películas', async () => {
        const req = { params: { id: '4' } };
        const res = mockRes();
        personService.getDirectorDetails.mockResolvedValue({
            directorName: 'Christopher Nolan',
            movies: [{ id: 20, title: 'Inception' }],
        });

        await PersonController.getDirectorDetails(req, res);

        expect(personService.getDirectorDetails).toHaveBeenCalledWith('4');
        expect(res.render).toHaveBeenCalledWith('director', {
            directorName: 'Christopher Nolan',
            movies: [{ id: 20, title: 'Inception' }],
        });
    });

    test('getDirectorDetails → 404 si no existe', async () => {
        const req = { params: { id: '404' } };
        const res = mockRes();
        personService.getDirectorDetails.mockResolvedValue(null);

        await PersonController.getDirectorDetails(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Director no encontrado.');
    });

    test('getDirectorDetails → 500 on error', async () => {
        const req = { params: { id: '4' } };
        const res = mockRes();
        personService.getDirectorDetails.mockRejectedValue(new Error('x'));

        await PersonController.getDirectorDetails(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error al cargar las películas del director.');
    });
});
