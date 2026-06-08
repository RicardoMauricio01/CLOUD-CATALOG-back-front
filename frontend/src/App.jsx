/**
 * Cloud Catalog - Componente Raíz
 */

import { useState, useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';

function App() {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Cargar usuario del localStorage al iniciar
    useEffect(() => {
        if (token) {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        }
    }, [token]);

    // Función para iniciar sesión
    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(token);
        setUser(userData);
    };

    // Función para cerrar sesión
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <div className="app">
            <AppRoutes user={user} token={token} login={login} logout={logout} />
        </div>
    );
}

export default App;
