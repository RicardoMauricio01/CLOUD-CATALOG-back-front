/**
 * Middleware: Autenticación y Control de Accesos
 * Valida JWT y verifica roles permitidos
 */

const jwt = require('jsonwebtoken');

// Middleware para verificar token JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, usuario, email, rol }
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado' });
    }
}

// Middleware factory para verificar roles permitidos
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({
                error: 'Acceso denegado',
                message: `Se requiere uno de estos roles: ${roles.join(', ')}`
            });
        }

        next();
    };
}

module.exports = { authenticateToken, requireRole };
