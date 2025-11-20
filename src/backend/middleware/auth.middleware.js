const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Asegurar que la variable existe
if (!JWT_SECRET) {
    throw new Error("Falta configurar JWT_SECRET en el archivo .env");
}

const authMiddleware = (req, res, next) => {
    try {
        // Obtener el header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        // Extraer token
        const token = authHeader.split(' ')[1];

        // Verificar token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Datos esenciales del usuario
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email
        };

        // Payload completo por si querés usar más info
        req.jwtPayload = decoded;

        next();
    } catch (error) {
        console.error('Error en autenticación:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error interno de autenticación'
        });
    }
};

module.exports = authMiddleware;
