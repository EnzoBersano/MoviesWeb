// test/services/user.service.test.js
jest.mock('../../src/backend/repository/user.repository', () => ({
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    getUserMovies: jest.fn(),
    addMovieToUser: jest.fn(),
    removeMovieFromUser: jest.fn(),
    getUserMovieRating: jest.fn(),
}));

const repo = require('../../src/backend/repository/user.repository');
const UserService = require('../../src/backend/service/user.service');

describe('UserService', () => {
    beforeEach(() => jest.clearAllMocks());

    test('getAllUsers → ok', async () => {
        repo.getAllUsers.mockResolvedValue([{ user_id: 1 }]);
        const out = await UserService.getAllUsers();
        expect(out).toEqual([{ user_id: 1 }]);
    });

    test('getAllUsers → error envuelto', async () => {
        repo.getAllUsers.mockRejectedValue(new Error('boom'));
        await expect(UserService.getAllUsers()).rejects
            .toThrow('Error en servicio de usuarios: boom');
    });

    test('getUserById → retorna usuario', async () => {
        repo.getUserById.mockResolvedValue({ user_id: 5 });
        const u = await UserService.getUserById('5');
        expect(repo.getUserById).toHaveBeenCalledWith('5');
        expect(u).toEqual({ user_id: 5 });
    });

    test('getUserById → not found lanza error envuelto', async () => {
        repo.getUserById.mockResolvedValue(null);
        await expect(UserService.getUserById('9')).rejects
            .toThrow('Error obteniendo usuario: Usuario no encontrado');
    });

    test('createUser → valida campos e email y delega', async () => {
        repo.createUser.mockResolvedValue({ user_id: 1 });
        const data = { username: 'bauti', name: 'Bauti', email: 'a@a.com' };
        const out = await UserService.createUser(data);
        expect(repo.createUser).toHaveBeenCalledWith(data);
        expect(out).toEqual({ user_id: 1 });
    });

    test('createUser → datos incompletos', async () => {
        await expect(UserService.createUser({ username: 'x', name: 'y' })).rejects
            .toThrow('Error creando usuario: Datos incompletos');
    });

    test('createUser → email inválido', async () => {
        await expect(UserService.createUser({ username: 'x', name: 'y', email: 'bad' })).rejects
            .toThrow('Error creando usuario: Email inválido');
    });

    test('createUser → error repo envuelto', async () => {
        repo.createUser.mockRejectedValue(new Error('dup key'));
        await expect(UserService.createUser({ username: 'x', name: 'y', email: 'x@y.com' })).rejects
            .toThrow('Error creando usuario: dup key');
    });

    test('updateUser → ok (usuario existe y datos válidos)', async () => {
        // getUserById interno debe devolver usuario existente
        repo.getUserById.mockResolvedValue({ user_id: 7 });
        repo.updateUser.mockResolvedValue({ user_id: 7, name: 'Nuevo' });

        const out = await UserService.updateUser('7', { username: 'u', name: 'Nuevo', email: 'u@u.com' });

        expect(repo.getUserById).toHaveBeenCalledWith('7');
        expect(repo.updateUser).toHaveBeenCalledWith('7', { username: 'u', name: 'Nuevo', email: 'u@u.com' });
        expect(out).toEqual({ user_id: 7, name: 'Nuevo' });
    });

    test('updateUser → email inválido', async () => {
        repo.getUserById.mockResolvedValue({ user_id: 7 });
        await expect(UserService.updateUser('7', { username: 'u', name: 'n', email: 'bad' })).rejects
            .toThrow('Error actualizando usuario: Email inválido');
    });

    test('updateUser → usuario no existe (propaga mensaje envuelto)', async () => {
        // getUserById del service llama a repo.getUserById, que devuelve null → el service getUserById lanza:
        // "Error obteniendo usuario: Usuario no encontrado"
        repo.getUserById.mockResolvedValueOnce(null);
        await expect(UserService.updateUser('999', { username: 'u', name: 'n', email: 'u@u.com' })).rejects
            .toThrow('Error actualizando usuario: Error obteniendo usuario: Usuario no encontrado');
    });

    test('deleteUser → ok', async () => {
        repo.deleteUser.mockResolvedValue({ user_id: 3 });
        const out = await UserService.deleteUser('3');
        expect(repo.deleteUser).toHaveBeenCalledWith('3');
        expect(out).toEqual({ user_id: 3 });
    });

    test('deleteUser → not found', async () => {
        repo.deleteUser.mockResolvedValue(null);
        await expect(UserService.deleteUser('3')).rejects
            .toThrow('Error eliminando usuario: Usuario no encontrado');
    });

    test('getUserWithMovies → ok', async () => {
        repo.getUserById.mockResolvedValue({ user_id: 2, username: 'u' });
        repo.getUserMovies.mockResolvedValue([{ movie_id: 1 }]);

        const out = await UserService.getUserWithMovies('2');
        expect(out).toEqual({
            user: { user_id: 2, username: 'u' },
            movies: [{ movie_id: 1 }],
        });
    });

    test('getUserWithMovies → user not found', async () => {
        repo.getUserById.mockResolvedValue(null);
        await expect(UserService.getUserWithMovies('2')).rejects
            .toThrow('Error obteniendo datos del usuario: Usuario no encontrado');
    });

    test('addMovieToUser → valida rating', async () => {
        await expect(UserService.addMovieToUser('1', '10', 11, 'x')).rejects
            .toThrow('Error agregando película: Rating debe estar entre 0 y 10');
        await expect(UserService.addMovieToUser('1', '10', -1, 'x')).rejects
            .toThrow('Error agregando película: Rating debe estar entre 0 y 10');
    });

    test('addMovieToUser → ok (rating null permitido)', async () => {
        repo.addMovieToUser.mockResolvedValue({ ok: true });
        const out = await UserService.addMovieToUser('1', '10', null, 'nice');
        expect(repo.addMovieToUser).toHaveBeenCalledWith('1', '10', null, 'nice');
        expect(out).toEqual({ ok: true });
    });

    test('removeMovieFromUser → ok', async () => {
        repo.removeMovieFromUser.mockResolvedValue({ ok: 1 });
        const out = await UserService.removeMovieFromUser('1', '10');
        expect(repo.removeMovieFromUser).toHaveBeenCalledWith('1', '10');
        expect(out).toEqual({ ok: 1 });
    });

    test('removeMovieFromUser → relación no encontrada', async () => {
        repo.removeMovieFromUser.mockResolvedValue(null);
        await expect(UserService.removeMovieFromUser('1', '10')).rejects
            .toThrow('Error eliminando película: No se encontró la relación usuario-película');
    });

    test('getUserMovieRating → ok y error envuelto', async () => {
        repo.getUserMovieRating.mockResolvedValue(7.5);
        await expect(UserService.getUserMovieRating('1', '10')).resolves.toBe(7.5);

        repo.getUserMovieRating.mockRejectedValue(new Error('x'));
        await expect(UserService.getUserMovieRating('1', '10')).rejects
            .toThrow('Error obteniendo rating: x');
    });
});
