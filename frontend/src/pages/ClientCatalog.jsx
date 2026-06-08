/**
 * Page: ClientCatalog
 * Vista pública de productos organizados por categorías
 */

import { useState, useEffect } from 'react';
import productService from '../services/product.service';

function ClientCatalog() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cargar categorías y productos
    useEffect(() => {
        loadData();
    }, []);

    // Cargar productos cuando cambia la categoría seleccionada
    useEffect(() => {
        loadProducts();
    }, [selectedCategory]);

    const loadData = async () => {
        try {
            const cats = await productService.getCategories();
            setCategories(cats);
            await loadProducts();
        } catch (err) {
            console.error('Error cargando datos:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            let prods;
            if (selectedCategory) {
                prods = await productService.getByCategory(selectedCategory);
            } else {
                prods = await productService.getAll();
            }
            setProducts(prods);
        } catch (err) {
            console.error('Error cargando productos:', err);
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
            <h2 style={{ marginBottom: '20px', color: '#6bc76b' }}>Catálogo de Productos</h2>

            {/* Filtro de categorías */}
            <div className="categories-filter">
                <button
                    className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(null)}
                >
                    Todos
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.id)}
                    >
                        {cat.nombre}
                    </button>
                ))}
            </div>

            {/* Grid de productos */}
            {products.length === 0 ? (
                <div className="empty-state">
                    <h3>No hay productos disponibles</h3>
                    <p>Selecciona otra categoría o vuelve más tarde.</p>
                </div>
            ) : (
                <div className="product-grid">
                    {products.map(product => (
                        <div key={product.id} className="product-card">
                            {product.imagen_url ? (
                                <img
                                    src={product.imagen_url}
                                    alt={product.nombre}
                                    className="product-image"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="product-image" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#f0f0f0',
                                    color: '#999'
                                }}>
                                    Sin imagen
                                </div>
                            )}
                            <div className="product-info">
                                <h3 className="product-name">{product.nombre}</h3>
                                {product.descripcion && (
                                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>
                                        {product.descripcion}
                                    </p>
                                )}
                                <p className="product-price">{formatPrice(product.precio)}</p>
                                {product.categoria && (
                                    <span className="product-category">{product.categoria}</span>
                                )}
                                <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '8px' }}>
                                    Stock: {product.stock}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ClientCatalog;
