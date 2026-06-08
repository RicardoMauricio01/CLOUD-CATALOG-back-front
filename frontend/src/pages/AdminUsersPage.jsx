/**
 * Page: AdminUsersPage
 * Panel de gestión de usuarios y roles (solo administrador)
 */

import { useState, useEffect } from 'react';
import userService from '../services/user.service';

function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersData, statsData] = await Promise.all([
                userService.getAll(),
                userService.getStats()
            ]);
            setUsers(usersData);
            setStats(statsData);
        } catch (err) {
            setError('Error cargando usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await userService.updateRole(userId, newRole);
            setUsers(users.map(u =>
                u.id === userId ? { ...u, rol: newRole } : u
            ));
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

        try {
            await userService.delete(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        }
    };

    const getRoleStats = (rol) => {
        const found = stats.find(s => s.rol === rol);
        return found ? parseInt(found.total) : 0;
    };

    if (loading) {
        return <div className="container"><p>Cargando usuarios...</p></div>;
    }

    return (
        <div className="container">
            <h2 style={{ color: '#6bc76b', marginBottom: '20px' }}>Gestión de Usuarios</h2>

            {/* Estadísticas */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <div className="card" style={{ flex: 1, textAlign: 'center' }}>
                    <h3 style={{ color: '#6bc76b' }}>{getRoleStats('admin')}</h3>
                    <p>Administradores</p>
                </div>
                <div className="card" style={{ flex: 1, textAlign: 'center' }}>
                    <h3 style={{ color: '#6bc76b' }}>{getRoleStats('empleado')}</h3>
                    <p>Empleados</p>
                </div>
                <div className="card" style={{ flex: 1, textAlign: 'center' }}>
                    <h3 style={{ color: '#6bc76b' }}>{getRoleStats('cliente')}</h3>
                    <p>Clientes</p>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.nombre}</td>
                                <td>{user.usuario}</td>
                                <td>{user.email}</td>
                                <td>
                                    <select
                                        value={user.rol}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            border: '1px solid #ddd',
                                            backgroundColor: '#fff'
                                        }}
                                    >
                                        <option value="cliente">Cliente</option>
                                        <option value="empleado">Empleado</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminUsersPage;
