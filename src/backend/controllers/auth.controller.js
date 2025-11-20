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

            return res.redirect('/login?registered=true');
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
            // Guardar token en cookie HttpOnly
            res.cookie("token", result.token, {
                httpOnly: true,
                secure: false,
                maxAge: 24 * 60 * 60 * 1000
            });

            res.cookie("user_id", result.user.user_id, {
                httpOnly: false, // Para que EJS pueda acceder
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: 'strict'
            });

            return res.redirect('/activity/feed');
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
    async logout(req, res) {
        try {
            // Limpiar ambas cookies
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            res.clearCookie("user_id", {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            // Redirigir al login con mensaje de éxito
            res.redirect('/login?logout=success');

        } catch (error) {
            console.error('Error en logout:', error);
            // Aún así redirigir al login en caso de error
            res.redirect('/login');
        }
    }

    async verifyToken(req, res) {
        try {

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
    async getCurrentUser(req, res) {
        try {
            // El middleware de auth ya debería haber inyectado req.user
            res.status(200).json({
                success: true,
                data: {
                    user: req.user
                }
            });
        } catch (error) {
            console.error('Error obteniendo usuario actual:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuario actual'
            });
        }
    }
}

module.exports = new AuthController();