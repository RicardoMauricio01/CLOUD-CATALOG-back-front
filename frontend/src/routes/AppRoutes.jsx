/**
 * Routes: AppRoutes
 * Enrutamiento de React Router con protección por roles
 */

import { Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import ClientCatalog from '../pages/ClientCatalog';
import AdminProdPage from '../pages/AdminProdPage';
import AdminUsersPage from '../pages/AdminUsersPage';

// Componente para rutas protegidas
function ProtectedRoute({ user, allowedRoles, children }) {
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.rol)) {
        return <Navigate to="/" replace />;
    }

    return children;
}

// Componente Navbar
function Navbar({ user, logout }) {
    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">Cloud Catalog</Link>

            <ul className="navbar-nav">
                <li><Link to="/">Catálogo</Link></li>

                {user && (user.rol === 'admin' || user.rol === 'empleado') && (
                    <li><Link to="/admin/products">Productos</Link></li>
                )}

                {user && user.rol === 'admin' && (
                    <li><Link to="/admin/users">Usuarios</Link></li>
                )}

                {user ? (
                    <>
                        <li>
                            <span className="navbar-user">
                                {user.nombre}
                                <span className="navbar-role">{user.rol}</span>
                            </span>
                        </li>
                        <li><button onClick={logout}>Cerrar Sesión</button></li>
                    </>
                ) : (
                    <li><Link to="/login">Iniciar Sesión</Link></li>
                )}
            </ul>
        </nav>
    );
}

function AppRoutes({ user, token, login, logout }) {
    return (
        <>
            <Navbar user={user} logout={logout} />

            <Routes>
                {/* Ruta pública - Catálogo de clientes */}
                <Route path="/" element={<ClientCatalog />} />

                {/* Ruta de login */}
                <Route
                    path="/login"
                    element={
                        user ? <Navigate to="/" replace /> : <LoginPage login={login} />
                    }
                />

                {/* Ruta protegida - Panel de productos (empleado + admin) */}
                <Route
                    path="/admin/products"
                    element={
                        <ProtectedRoute user={user} allowedRoles={['empleado', 'admin']}>
                            <AdminProdPage />
                        </ProtectedRoute>
                    }
                />

                {/* Ruta protegida - Panel de usuarios (solo admin) */}
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute user={user} allowedRoles={['admin']}>
                            <AdminUsersPage />
                        </ProtectedRoute>
                    }
                />

                {/* Ruta por defecto - Redirigir al catálogo */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

export default AppRoutes;
