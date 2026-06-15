const AuthService = require('../services/authService');

const AuthController = {
    async register(req, res) {
        try {
            const { nombre, usuario, email, password, rol } = req.body;

            if (!nombre || !usuario || !email || !password) {
                return res.status(400).json({
                    error: 'Todos los campos son requeridos: nombre, usuario, email, password'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    error: 'La contrasena debe tener al menos 6 caracteres'
                });
            }

            const newUser = await AuthService.register({ nombre, usuario, email, password, rol });
            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                user: newUser
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async login(req, res) {
        try {
            const { usuario, password } = req.body;

            if (!usuario || !password) {
                return res.status(400).json({
                    error: 'Usuario y contrasena son requeridos'
                });
            }

            const result = await AuthService.login({ usuario, password });
            res.json(result);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    },

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ error: 'El email es requerido' });
            }

            const result = await AuthService.forgotPassword(email);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                return res.status(400).json({
                    error: 'Token y nueva contrasena son requeridos'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    error: 'La contrasena debe tener al menos 6 caracteres'
                });
            }

            const result = await AuthService.resetPassword(token, newPassword);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = AuthController;
