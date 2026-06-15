const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserDao = require('../dao/userDao');
const { toPublicUser } = require('../dtos/userDto');

const SALT_ROUNDS = 10;

const AuthService = {
    async register({ nombre, usuario, email, password, rol }) {
        const existingUser = await UserDao.findByUsername(usuario);
        if (existingUser) {
            throw new Error('El nombre de usuario ya esta en uso');
        }

        const existingEmail = await UserDao.findByEmail(email);
        if (existingEmail) {
            throw new Error('El email ya esta registrado');
        }

        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = await UserDao.create({
            nombre, usuario, email, password_hash,
            rol: rol || 'cliente'
        });

        return toPublicUser(newUser);
    },

    async login({ usuario, password }) {
        const user = await UserDao.findByUsername(usuario);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            throw new Error('Contrasena incorrecta');
        }

        const token = jwt.sign(
            { id: user.id, usuario: user.usuario, email: user.email, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        return {
            token,
            user: toPublicUser(user)
        };
    },

    async forgotPassword(email) {
        const user = await UserDao.findByEmail(email);
        if (!user) {
            return { message: 'Si el email existe, se ha enviado un token de restablecimiento' };
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString();

        await UserDao.setResetToken(email, resetToken, resetTokenExpiry);

        return {
            message: 'Token de restablecimiento generado',
            resetToken
        };
    },

    async resetPassword(token, newPassword) {
        const user = await UserDao.findByResetToken(token);
        if (!user) {
            throw new Error('Token invalido o expirado');
        }

        const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await UserDao.updatePassword(user.id, password_hash);

        return { message: 'Contrasena actualizada exitosamente' };
    }
};

module.exports = AuthService;
