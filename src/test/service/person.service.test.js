// test/services/person.service.test.js
jest.mock('../../src/backend/repository/person.repository', () => ({
    getActorMovies: jest.fn(),
    getDirectorMovies: jest.fn(),
}));

const repo = require('../../src/backend/repository/person.repository');
const PersonService = require('../../src/backend/service/person.service');

describe('PersonService', () => {
    beforeEach(() => jest.clearAllMocks());

    test('getActorDetails → null cuando no hay películas', async () => {
        repo.getActorMovies.mockResolvedValue([]);
        const out = await PersonService.getActorDetails('3');
        expect(repo.getActorMovies).toHaveBeenCalledWith('3');
        expect(out).toBeNull();
    });

    test('getActorDetails → retorna nombre y movies', async () => {
        const movies = [{ actor_name: 'Keanu Reeves', id: 1 }];
        repo.getActorMovies.mockResolvedValue(movies);
        const out = await PersonService.getActorDetails('3');
        expect(out).toEqual({ actorName: 'Keanu Reeves', movies });
    });

    test('getActorDetails → error envuelto', async () => {
        repo.getActorMovies.mockRejectedValue(new Error('x'));
        await expect(PersonService.getActorDetails('3'))
            .rejects.toThrow('Error obteniendo detalles del actor: x');
    });

    test('getDirectorDetails → null cuando no hay películas', async () => {
        repo.getDirectorMovies.mockResolvedValue([]);
        const out = await PersonService.getDirectorDetails('4');
        expect(out).toBeNull();
    });

    test('getDirectorDetails → retorna nombre y movies', async () => {
        const movies = [{ director_name: 'Christopher Nolan', id: 20 }];
        repo.getDirectorMovies.mockResolvedValue(movies);
        const out = await PersonService.getDirectorDetails('4');
        expect(out).toEqual({ directorName: 'Christopher Nolan', movies });
    });

    test('getDirectorDetails → error envuelto', async () => {
        repo.getDirectorMovies.mockRejectedValue(new Error('y'));
        await expect(PersonService.getDirectorDetails('4'))
            .rejects.toThrow('Error obteniendo detalles del director: y');
    });
});
