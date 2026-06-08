-- =============================================
-- Script 01: ENUM de roles y tabla de usuarios
-- Cloud Catalog - Base de datos PostgreSQL
-- =============================================

-- Crear tipo ENUM para los tres roles del sistema
CREATE TYPE rol_usuario AS ENUM ('cliente', 'empleado', 'admin');

-- Tabla de usuarios con campos para autenticación y recuperación de contraseña
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol rol_usuario DEFAULT 'cliente',
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_usuario ON usuarios(usuario);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
