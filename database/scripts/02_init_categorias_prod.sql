-- =============================================
-- Script 02: Tablas de categorías y productos
-- Cloud Catalog - Base de datos PostgreSQL
-- =============================================

-- Tabla de categorías para organizar productos
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos con imagen_url como enlace externo (no archivo físico)
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    imagen_url VARCHAR(500),
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas y filtrado
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_precio ON productos(precio);
CREATE INDEX idx_categorias_nombre ON categorias(nombre);

-- Datos iniciales de ejemplo (categorías)
INSERT INTO categorias (nombre, descripcion) VALUES
    ('Electrónica', 'Dispositivos y gadgets electrónicos'),
    ('Ropa', 'Vestimenta y accesorios'),
    ('Hogar', 'Artículos para el hogar'),
    ('Deportes', 'Equipamiento deportivo');
