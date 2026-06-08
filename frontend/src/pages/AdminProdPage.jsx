/**
 * Page: AdminProdPage
 * Panel CRUD de productos para administradores y empleados
 * Actualización en tiempo real vía Socket.io
 */

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import productService from '../services/product.service';

const emptyProduct = {
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagen_url: '',
    categoria_id: ''
};

function AdminProdPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState(emptyProduct);
    const [editingId, setEditingId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Conexión Socket.io
    useEffect(() => {
        const socket = io();

        socket.on('product:created', (product) => {
            setProducts(prev => [...prev, product]);
        });

        socket.on('product:updated', (product) => {
            setProducts(prev => prev.map(p => p.id === product.id ? product : p));
        });

        socket.on('product:deleted', ({ id }) => {
            setProducts(prev => prev.filter(p => p.id !== id));
        });

        return () => socket.disconnect();
    }, []);

    // Cargar datos iniciales
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [prods, cats] = await Promise.all([
                productService.getAll(),
                productService.getCategories()
            ]);
            setProducts(prods);
            setCategories(cats);
        } catch (err) {
            setError('Error cargando datos');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openModal = (product = null) => {
        if (product) {
            setEditingId(product.id);
            setFormData({
                nombre: product.nombre,
                descripcion: product.descripcion || '',
                precio: product.precio,
                stock: product.stock,
                imagen_url: product.imagen_url || '',
                categoria_id: product.categoria_id || ''
            });
        } else {
            setEditingId(null);
            setFormData(emptyProduct);
        }
        setShowModal(true);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const data = {
                ...formData,
                precio: parseFloat(formData.precio),
                stock: parseInt(formData.stock) || 0,
                categoria_id: formData.categoria_id || null
            };

            if (editingId) {
                await productService.update(editingId, data);
            } else {
                await productService.create(data);
            }

            setShowModal(false);
            setFormData(emptyProduct);
            setEditingId(null);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            await productService.delete(id);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        }
    };

    const formatPrice = (price) => {
        return '$ ' + new Intl.NumberFormat('es-CL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    if (loading) {
        return <div className="container"><p>Cargando productos...</p></div>;
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#6bc76b' }}>Gestión de Productos</h2>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + Nuevo Producto
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Categoría</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>{product.nombre}</td>
                                <td>{formatPrice(product.precio)}</td>
                                <td>{product.stock}</td>
                                <td>{product.categoria || 'Sin categoría'}</td>
                                <td>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => openModal(product)}
                                        style={{ marginRight: '8px' }}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de producto */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingId ? 'Editar Producto' : 'Nuevo Producto'}
                            </h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Precio *</label>
                                <input
                                    type="number"
                                    name="precio"
                                    value={formData.precio}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="form-group">
                                <label>Stock</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>URL de imagen</label>
                                <input
                                    type="url"
                                    name="imagen_url"
                                    value={formData.imagen_url}
                                    onChange={handleChange}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                />
                            </div>

                            <div className="form-group">
                                <label>Categoría</label>
                                <select
                                    name="categoria_id"
                                    value={formData.categoria_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Sin categoría</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? 'Guardar Cambios' : 'Crear Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminProdPage;
