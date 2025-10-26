// __tests__/controllers/user.controller.test.js
jest.mock('../../service/user.service', () => ({
    getAllUsers: jest.fn(),
    createUser: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    getUserWithMovies: jest.fn(),
    addMovieToUser: jest.fn(),
    removeMovieFromUser: jest.fn(),
}));

const userService = require('../../service/user.service');
const UserController = require('../../controllers/user.controller'); // ajustá la ruta

const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.render = jest.fn();
    res.send = jest.fn();
    res.redirect = jest.fn();
    return res;
};

describe('UserController', () => {
    beforeEach(() => jest.clearAllMocks());

    test('listUsers → renderiza lista', async () => {
        const req = {};
        const res = mockRes();
        userService.getAllUsers.mockResolvedValue([{ user_id: 1, username: 'bauti' }]);

        await UserController.listUsers(req, res);

        expect(userService.getAllUsers).toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith('users/list', { users: [{ user_id: 1, username: 'bauti' }] });
    });

    test('listUsers → 500 on error', async () => {
        const req = {};
        const res = mockRes();
        userService.getAllUsers.mockRejectedValue(new Error('x'));

        await UserController.listUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error al cargar usuarios.');
    });

    test('showCreateForm → renderiza formulario', async () => {
        const req = {};
        const res = mockRes();

        await UserController.showCreateForm(req, res);

        expect(res.render).toHaveBeenCalledWith('users/create');
    });

    test('createUser → redirige al listar al crear OK', async () => {
        const req = { body: { username: 'a', name: 'A', email: 'a@a.com' } };
        const res = mockRes();

        await UserController.createUser(req, res);

        expect(userService.createUser).toHaveBeenCalledWith({ username: 'a', name: 'A', email: 'a@a.com' });
        expect(res.redirect).toHaveBeenCalledWith('/users');
    });

    test('createUser → re-render con error', async () => {
        const req = { body: { username: 'a', name: 'A', email: 'bad' } };
        const res = mockRes();
        userService.createUser.mockRejectedValue(new Error('email inválido'));

        await UserController.createUser(req, res);

        expect(res.render).toHaveBeenCalledWith('users/create', {
            error: 'email inválido',
            formData: req.body,
        });
    });

    test('showEditForm → renderiza edit con usuario', async () => {
        const req = { params: { id: '5' } };
        const res = mockRes();
        userService.getUserById.mockResolvedValue({ user_id: 5, username: 'x' });

        await UserController.showEditForm(req, res);

        expect(userService.getUserById).toHaveBeenCalledWith('5');
        expect(res.render).toHaveBeenCalledWith('users/edit', { user: { user_id: 5, username: 'x' } });
    });

    test('showEditForm → 404 on error', async () => {
        const req = { params: { id: '5' } };
        const res = mockRes();
        userService.getUserById.mockRejectedValue(new Error('not found'));

        await UserController.showEditForm(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Usuario no encontrado.');
    });

    test('updateUser → redirige a /users', async () => {
        const req = {
            params: { id: '5' },
            body: { username: 'b', name: 'B', email: 'b@b.com' },
        };
        const res = mockRes();

        await UserController.updateUser(req, res);

        expect(userService.updateUser).toHaveBeenCalledWith('5', { username: 'b', name: 'B', email: 'b@b.com' });
        expect(res.redirect).toHaveBeenCalledWith('/users');
    });

    test('updateUser → re-render edit con error y usuario', async () => {
        const req = {
            params: { id: '5' },
            body: { username: 'b', name: 'B', email: 'bad' },
        };
        const res = mockRes();
        userService.updateUser.mockRejectedValue(new Error('email inválido'));
        userService.getUserById.mockResolvedValue({ user_id: 5, username: 'b' });

        await UserController.updateUser(req, res);

        expect(res.render).toHaveBeenCalledWith('users/edit', {
            user: { user_id: 5, username: 'b' },
            error: 'email inválido',
        });
    });

    test('deleteUser → redirige después de borrar', async () => {
        const req = { params: { id: '7' } };
        const res = mockRes();

        await UserController.deleteUser(req, res);

        expect(userService.deleteUser).toHaveBeenCalledWith('7');
        expect(res.redirect).toHaveBeenCalledWith('/users');
    });

    test('deleteUser → 500 on error', async () => {
        const req = { params: { id: '7' } };
        const res = mockRes();
        userService.deleteUser.mockRejectedValue(new Error('fk error'));

        await UserController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error al eliminar usuario.');
    });

    test('viewUserProfile → renderiza profile', async () => {
        const req = { params: { id: '9' } };
        const res = mockRes();
        userService.getUserWithMovies.mockResolvedValue({
            user: { user_id: 9, username: 'c' },
            movies: [{ movie_id: 1, title: 'Inception' }],
        });

        await UserController.viewUserProfile(req, res);

        expect(userService.getUserWithMovies).toHaveBeenCalledWith('9');
        expect(res.render).toHaveBeenCalledWith('users/profile', {
            user: { user_id: 9, username: 'c' },
            movies: [{ movie_id: 1, title: 'Inception' }],
        });
    });

    test('viewUserProfile → 404 on error', async () => {
        const req = { params: { id: '9' } };
        const res = mockRes();
        userService.getUserWithMovies.mockRejectedValue(new Error('not found'));

        await UserController.viewUserProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Usuario no encontrado.');
    });

    test('addMovieToUser → redirige al perfil', async () => {
        const req = {
            params: { userId: '2' },
            body: { movieId: '11', rating: '4.5', opinion: 'Muy buena' },
        };
        const res = mockRes();

        await UserController.addMovieToUser(req, res);

        expect(userService.addMovieToUser).toHaveBeenCalledWith('2', '11', 4.5, 'Muy buena');
        expect(res.redirect).toHaveBeenCalledWith('/users/2');
    });

    test('addMovieToUser → 500 on error', async () => {
        const req = {
            params: { userId: '2' },
            body: { movieId: '11', rating: '5' },
        };
        const res = mockRes();
        userService.addMovieToUser.mockRejectedValue(new Error('x'));

        await UserController.addMovieToUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error al agregar película.');
    });

    test('removeMovieFromUser → redirige al perfil', async () => {
        const req = { params: { userId: '2', movieId: '11' } };
        const res = mockRes();

        await UserController.removeMovieFromUser(req, res);

        expect(userService.removeMovieFromUser).toHaveBeenCalledWith('2', '11');
        expect(res.redirect).toHaveBeenCalledWith('/users/2');
    });

    test('removeMovieFromUser → 500 on error', async () => {
        const req = { params: { userId: '2', movieId: '11' } };
        const res = mockRes();
        userService.removeMovieFromUser.mockRejectedValue(new Error('x'));

        await UserController.removeMovieFromUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error al eliminar película.');
    });
});
