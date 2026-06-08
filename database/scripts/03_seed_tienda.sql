DELETE FROM productos;
DELETE FROM categorias;

INSERT INTO categorias (nombre, descripcion) VALUES
    ('Despensa', 'Aceites, harinas, pastas, arroces y salsas'),
    ('Lacteos y Huevos', 'Leches, quesos, yogures y huevos'),
    ('Limpieza', 'Detergentes y productos de limpieza del hogar'),
    ('Panaderia', 'Pan y productos de panaderia');

SELECT id, nombre FROM categorias ORDER BY id;
