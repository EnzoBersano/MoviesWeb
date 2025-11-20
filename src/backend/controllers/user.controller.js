const userService = require('../service/user.service');

class UserController {
    // Listar todos los usuarios
    async listUsers(req, res) {
        try {
            const usersDB = await userService.getAllUsers();
            const users = usersDB.map(u => ({
                id: u.user_id,
                username: u.user_username,
                name: u.user_name,
                email: u.user_email
            }));
            res.render('users/list', { users });
        } catch (error) {
            console.error('Error listando usuarios:', error);
            res.status(500).send('Error al cargar usuarios.');
        }
    }

    // Mostrar formulario de creación
    async showCreateForm(req, res) {
        res.render('users/create');
    }

    // Crear usuario
    async createUser(req, res) {
        try {
            const userData = {
                username: req.body.username,
                name: req.body.name,
                email: req.body.email
            };

            await userService.createUser(userData);
            res.redirect('/users');
        } catch (error) {
            console.error('Error creando usuario:', error);
            res.render('users/create', {
                error: error.message,
                formData: req.body
            });
        }
    }

    // Mostrar formulario de edición
    async showEditForm(req, res) {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return res.status(400).send('ID de usuario inválido');
            }

            const user = await userService.getUserById(userId);
            res.render('users/edit', { user });
        } catch (error) {
            console.error('Error cargando usuario:', error);
            res.status(404).send('Usuario no encontrado.');
        }
    }

    // Actualizar usuario
    async updateUser(req, res) {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return res.status(400).send('ID de usuario inválido');
            }

            const userData = {
                username: req.body.username,
                name: req.body.name,
                email: req.body.email
            };

            await userService.updateUser(userId, userData);
            res.redirect('/users');
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            const user = await userService.getUserById(parseInt(req.params.id));
            res.render('users/edit', {
                user,
                error: error.message
            });
        }
    }

    // Eliminar usuario
    async deleteUser(req, res) {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return res.status(400).send('ID de usuario inválido');
            }

            await userService.deleteUser(userId);
            res.redirect('/users');
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            res.status(500).send('Error al eliminar usuario.');
        }
    }

    // Ver perfil de usuario con sus películas
    async viewUserProfile(req, res) {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return res.status(400).send('ID de usuario inválido');
            }

            const data = await userService.getUserWithMovies(userId);
            res.render('users/profile', data);
        } catch (error) {
            console.error('Error cargando perfil:', error);
            res.status(404).send('Usuario no encontrado.');
        }
    }

    // Agregar película a usuario
    async addMovieToUser(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const movieId = parseInt(req.body.movieId);

            if (isNaN(userId) || isNaN(movieId)) {
                return res.status(400).send('IDs inválidos');
            }

            const rating = req.body.rating ? parseFloat(req.body.rating) : null;
            const opinion = req.body.opinion || null;

            await userService.addMovieToUser(userId, movieId, rating, opinion);
            res.redirect(`/users/${userId}`);
        } catch (error) {
            console.error('Error agregando película:', error);
            res.status(500).send('Error al agregar película.');
        }
    }

    // Eliminar película de usuario
    async removeMovieFromUser(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const movieId = parseInt(req.params.movieId);

            if (isNaN(userId) || isNaN(movieId)) {
                return res.status(400).send('IDs inválidos');
            }

            await userService.removeMovieFromUser(userId, movieId);
            res.redirect(`/users/${userId}`);
        } catch (error) {
            console.error('Error eliminando película:', error);
            res.status(500).send('Error al eliminar película.');
        }
    }
    async viewUserMovies(req, res) {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return res.status(400).send('ID de usuario inválido');
            }

            console.log('=== CARGANDO PELÍCULAS DEL USUARIO ===');
            console.log('ID del usuario:', userId);

            const data = await userService.getUserWithMovies(userId);

            res.render('users/movies', data);
        } catch (error) {
            console.error('Error cargando películas del usuario:', error);
            res.status(404).send('Usuario no encontrado: ' + error.message);
        }
    }
}

module.exports = new UserController();