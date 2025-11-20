const authRepository = require('../repository/auth.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_cambiar_en_produccion';
const JWT_EXPIRES_IN = '24h';

class AuthService {
    async registerUser(userData) {
        try {
            // Verificar si el usuario ya existe
            const existingUser = await authRepository.findUserByEmail(userData.email);
            if (existingUser) {
                throw new Error('El email ya existe');
            }

            const existingUsername = await authRepository.findUserByUsername(userData.username);
            if (existingUsername) {
                throw new Error('El username ya existe');
            }

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Crear el usuario
            const newUser = await authRepository.createUser({
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                name: userData.name
            });

            // Generar token
            const token = this.generateToken({
                userId: newUser.user_id,
                username: newUser.user_username,
                email: newUser.user_email
            });

            return {
                token,
                user: {
                    userId: newUser.user_id,
                    username: newUser.user_username,
                    email: newUser.user_email,
                    name: newUser.user_name
                }
            };
        } catch (error) {
            throw new Error(`Error registrando usuario: ${error.message}`);
        }
    }

    async loginUser(email, password) {
        try {
            // Buscar usuario por email
            const user = await authRepository.findUserByEmail(email);

            if (!user) {
                throw new Error('Credenciales inválidas');
            }

            // Verificar contraseña
            const isPasswordValid = await bcrypt.compare(password, user.user_password);

            if (!isPasswordValid) {
                throw new Error('Credenciales inválidas');
            }

            // Generar token
            const token = this.generateToken({
                userId: user.user_id,
                username: user.user_username,
                email: user.user_email
            });

            return {
                token,
                user: {
                    userId: user.user_id,
                    username: user.user_username,
                    email: user.user_email,
                    name: user.user_name
                }
            };
        } catch (error) {
            throw new Error(`Error en login: ${error.message}`);
        }
    }

    async refreshUserToken(userId) {
        try {
            const user = await authRepository.findUserById(userId);

            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            const token = this.generateToken({
                userId: user.user_id,
                username: user.user_username,
                email: user.user_email
            });

            return {
                token,
                user: {
                    userId: user.user_id,
                    username: user.user_username,
                    email: user.user_email,
                    name: user.user_name
                }
            };
        } catch (error) {
            throw new Error(`Error renovando token: ${error.message}`);
        }
    }

    generateToken(payload) {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw new Error('Token inválido o expirado');
        }
    }
}

module.exports = new AuthService();