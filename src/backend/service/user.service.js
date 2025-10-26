const userRepository = require('../repositories/userRepository');

class UserService {
    async getAllUsers() {
        try {
            return await userRepository.getAllUsers();
        } catch (error) {
            throw new Error(`Error en servicio de usuarios: ${error.message}`);
        }
    }

    async getUserById(userId) {
        try {
            const user = await userRepository.getUserById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return user;
        } catch (error) {
            throw new Error(`Error obteniendo usuario: ${error.message}`);
        }
    }

    async createUser(userData) {
        try {
            // Validar datos
            if (!userData.username || !userData.name || !userData.email) {
                throw new Error('Datos incompletos');
            }

            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                throw new Error('Email inválido');
            }

            return await userRepository.createUser(userData);
        } catch (error) {
            throw new Error(`Error creando usuario: ${error.message}`);
        }
    }

    async updateUser(userId, userData) {
        try {
            // Validar que el usuario existe
            await this.getUserById(userId);

            // Validar datos
            if (!userData.username || !userData.name || !userData.email) {
                throw new Error('Datos incompletos');
            }

            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                throw new Error('Email inválido');
            }

            return await userRepository.updateUser(userId, userData);
        } catch (error) {
            throw new Error(`Error actualizando usuario: ${error.message}`);
        }
    }

    async deleteUser(userId) {
        try {
            const user = await userRepository.deleteUser(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return user;
        } catch (error) {
            throw new Error(`Error eliminando usuario: ${error.message}`);
        }
    }

    async getUserWithMovies(userId) {
        try {
            const user = await userRepository.getUserById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            const movies = await userRepository.getUserMovies(userId);

            return {
                user,
                movies
            };
        } catch (error) {
            throw new Error(`Error obteniendo datos del usuario: ${error.message}`);
        }
    }

    async addMovieToUser(userId, movieId, rating, opinion) {
        try {
            // Validar rating
            if (rating !== null && (rating < 0 || rating > 10)) {
                throw new Error('Rating debe estar entre 0 y 10');
            }

            return await userRepository.addMovieToUser(userId, movieId, rating, opinion);
        } catch (error) {
            throw new Error(`Error agregando película: ${error.message}`);
        }
    }

    async removeMovieFromUser(userId, movieId) {
        try {
            const result = await userRepository.removeMovieFromUser(userId, movieId);
            if (!result) {
                throw new Error('No se encontró la relación usuario-película');
            }
            return result;
        } catch (error) {
            throw new Error(`Error eliminando película: ${error.message}`);
        }
    }

    async getUserMovieRating(userId, movieId) {
        try {
            return await userRepository.getUserMovieRating(userId, movieId);
        } catch (error) {
            throw new Error(`Error obteniendo rating: ${error.message}`);
        }
    }
}

module.exports = new UserService();