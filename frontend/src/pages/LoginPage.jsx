/**
 * Page: LoginPage
 * Vista de autenticación con login, registro y recuperación de contraseña
 */

import { useState } from 'react';
import authService from '../services/auth.service';

function LoginPage({ login }) {
    const [mode, setMode] = useState('login'); // login, register, forgot, reset
    const [formData, setFormData] = useState({
        nombre: '',
        usuario: '',
        email: '',
        password: '',
        confirmPassword: '',
        token: '',
        newPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (mode === 'login') {
                const result = await authService.login(formData.usuario, formData.password);
                login(result.token, result.user);

            } else if (mode === 'register') {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Las contraseñas no coinciden');
                }
                await authService.register({
                    nombre: formData.nombre,
                    usuario: formData.usuario,
                    email: formData.email,
                    password: formData.password
                });
                setSuccess('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
                setMode('login');

            } else if (mode === 'forgot') {
                const result = await authService.forgotPassword(formData.email);
                setSuccess(result.message);
                if (result.resetToken) {
                    setFormData({ ...formData, token: result.resetToken });
                    setMode('reset');
                }

            } else if (mode === 'reset') {
                if (formData.newPassword !== formData.confirmPassword) {
                    throw new Error('Las contraseñas no coinciden');
                }
                await authService.resetPassword(formData.token, formData.newPassword);
                setSuccess('Contraseña actualizada. Ya puedes iniciar sesión.');
                setMode('login');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Cloud Catalog</h1>
                <p className="auth-subtitle">
                    {mode === 'login' && 'Inicia sesión en tu cuenta'}
                    {mode === 'register' && 'Crea una nueva cuenta'}
                    {mode === 'forgot' && 'Recupera tu contraseña'}
                    {mode === 'reset' && 'Establece tu nueva contraseña'}
                </p>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    {mode === 'register' && (
                        <div className="form-group">
                            <label>Nombre completo</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    {(mode === 'login' || mode === 'register') && (
                        <div className="form-group">
                            <label>Usuario</label>
                            <input
                                type="text"
                                name="usuario"
                                value={formData.usuario}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    {(mode === 'register' || mode === 'forgot') && (
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    {(mode === 'login' || mode === 'register') && (
                        <div className="form-group">
                            <label>Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    {(mode === 'register' || mode === 'reset') && (
                        <div className="form-group">
                            <label>Confirmar contraseña</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    {mode === 'reset' && (
                        <>
                            <div className="form-group">
                                <label>Token de restablecimiento</label>
                                <input
                                    type="text"
                                    name="token"
                                    value={formData.token}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Nueva contraseña</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Procesando...' : (
                            mode === 'login' ? 'Iniciar Sesión' :
                            mode === 'register' ? 'Registrarse' :
                            mode === 'forgot' ? 'Enviar Token' :
                            'Restablecer Contraseña'
                        )}
                    </button>
                </form>

                <div className="auth-toggle">
                    {mode === 'login' && (
                        <>
                            <p><a href="#" onClick={(e) => { e.preventDefault(); setMode('register'); }}>Crear una cuenta</a></p>
                            <p><a href="#" onClick={(e) => { e.preventDefault(); setMode('forgot'); }}>¿Olvidaste tu contraseña?</a></p>
                        </>
                    )}
                    {mode !== 'login' && (
                        <p><a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }}>Volver al login</a></p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
