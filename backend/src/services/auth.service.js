/**
 * Service: Auth
 * Lógica de negocio: bcrypt, JWT, generación de tokens
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AuthModel = require('../models/auth.model');

const SALT_ROUNDS = 10;

const AuthService = {
    // Registrar nuevo usuario
    async register({ nombre, usuario, email, password, rol }) {
        // Verificar si el usuario ya existe
        const existingUser = await AuthModel.findByUsername(usuario);
        if (existingUser) {
            throw new Error('El nombre de usuario ya está en uso');
        }

        // Verificar si el email ya existe
        const existingEmail = await AuthModel.findByEmail(email);
        if (existingEmail) {
            throw new Error('El email ya está registrado');
        }

        // Hash de la contraseña
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        // Crear usuario
        const newUser = await AuthModel.create({
            nombre,
            usuario,
            email,
            password_hash,
            rol: rol || 'cliente'
        });

        return newUser;
    },

    // Iniciar sesión
    async login({ usuario, password }) {
        // Buscar usuario
        const user = await AuthModel.findByUsername(usuario);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            throw new Error('Contraseña incorrecta');
        }

        // Generar JWT
        const token = jwt.sign(
            { id: user.id, usuario: user.usuario, email: user.email, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        return {
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                usuario: user.usuario,
                email: user.email,
                rol: user.rol
            }
        };
    },

    // Solicitar restablecimiento de contraseña
    async forgotPassword(email) {
        const user = await AuthModel.findByEmail(email);
        if (!user) {
            // Por seguridad, no revelar si el email existe
            return { message: 'Si el email existe, se ha enviado un token de restablecimiento' };
        }

        // Generar token aleatorio
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hora

        await AuthModel.setResetToken(email, resetToken, resetTokenExpiry);

        // En producción aquí se enviaría un email
        // Por ahora retornamos el token directamente
        return {
            message: 'Token de restablecimiento generado',
            resetToken // Solo para desarrollo, en producción NO retornar esto
        };
    },

    // Restablecer contraseña
    async resetPassword(token, newPassword) {
        const user = await AuthModel.findByResetToken(token);
        if (!user) {
            throw new Error('Token inválido o expirado');
        }

        const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await AuthModel.updatePassword(user.id, password_hash);

        return { message: 'Contraseña actualizada exitosamente' };
    }
};

module.exports = AuthService;
