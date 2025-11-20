const jwt = require('jsonwebtoken');
const userService = require('../service/user.service');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

const authMiddleware = {
    requireAuth: (req, res, next) => {
        const token = req.cookies.token;

        if (!token) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(401).json({
                    success: false,
                    message: 'No autenticado'
                });
            }
            return res.redirect('/login?returnTo=' + encodeURIComponent(req.originalUrl));
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            console.error('Error verificando token:', error);
            res.clearCookie("token");
            res.clearCookie("user_id");

            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido'
                });
            }
            res.redirect('/login');
        }
    },

    injectUser: async (req, res, next) => {
        const token = req.cookies.token;

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);

                const user = await userService.getUserById(decoded.userId);
                if (user) {
                    res.locals.currentUser = {
                        user_id: user.user_id,
                        user_username: user.user_username,
                        user_name: user.user_name,
                        user_email: user.user_email
                    };
                } else {
                    res.locals.currentUser = null;
                    res.clearCookie("token");
                    res.clearCookie("user_id");
                }
            } catch (error) {
                res.locals.currentUser = null;
                res.clearCookie("token");
                res.clearCookie("user_id");
            }
        } else {
            res.locals.currentUser = null;
        }
        next();
    },

    requireOwnership: (req, res, next) => {
        const requestedUserId = parseInt(req.params.userId || req.params.id);
        const currentUserId = req.user.userId;

        if (currentUserId === requestedUserId) {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para acceder a este recurso'
            });
        }
    }
};

module.exports = authMiddleware;