const authService = require('../service/auth.service');

class AuthController {
    async register(req, res) {
        try {
            const { username, email, password, name } = req.body;

            // Validaciones básicas
            if (!username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username, email y password son requeridos'
                });
            }

            const result = await authService.registerUser({
                username,
                email,
                password,
                name
            });

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: result
            });
        } catch (error) {
            console.error('Error en registro:', error);

            if (error.message.includes('ya existe')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al registrar usuario'
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validaciones básicas
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y password son requeridos'
                });
            }

            const result = await authService.loginUser(email, password);

            res.status(200).json({
                success: true,
                message: 'Login exitoso',
                data: result
            });
        } catch (error) {
            console.error('Error en login:', error);

            if (error.message.includes('Credenciales inválidas')) {
                return res.status(401).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al iniciar sesión'
            });
        }
    }

    async verifyToken(req, res) {
        try {
            // Este endpoint usa el middleware de autenticación
            // Si llega aquí, el token es válido
            res.status(200).json({
                success: true,
                message: 'Token válido',
                data: {
                    user: req.user
                }
            });
        } catch (error) {
            console.error('Error verificando token:', error);
            res.status(500).json({
                success: false,
                message: 'Error al verificar token'
            });
        }
    }

    async refreshToken(req, res) {
        try {
            const userId = req.user.userId;
            const result = await authService.refreshUserToken(userId);

            res.status(200).json({
                success: true,
                message: 'Token renovado exitosamente',
                data: result
            });
        } catch (error) {
            console.error('Error renovando token:', error);
            res.status(500).json({
                success: false,
                message: 'Error al renovar token'
            });
        }
    }
}

module.exports = new AuthController();