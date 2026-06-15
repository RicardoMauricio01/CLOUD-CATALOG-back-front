const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
});

async function resetDatabase() {
    console.log('Reiniciando base de datos...\n');

    try {
        console.log('Eliminando tablas existentes...');
        await pool.query('DROP TABLE IF EXISTS productos CASCADE');
        await pool.query('DROP TABLE IF EXISTS categorias CASCADE');
        await pool.query('DROP TABLE IF EXISTS usuarios CASCADE');
        await pool.query('DROP TYPE IF EXISTS rol_usuario');

        const scriptsDir = path.join(__dirname, '..', 'database', 'scripts');
        const scripts = [
            '01_init_roles_usuarios.sql',
            '02_init_categorias_prod.sql',
            '03_seed_tienda.sql',
            '04_seed_productos.sql',
            '05_seed_admin.sql'
        ];

        for (const script of scripts) {
            const scriptPath = path.join(scriptsDir, script);
            if (!fs.existsSync(scriptPath)) {
                console.warn(`  Script no encontrado: ${script}`);
                continue;
            }
            const sql = fs.readFileSync(scriptPath, 'utf-8');
            await pool.query(sql);
            console.log(`  Ejecutado: ${script}`);
        }

        console.log('\n Base de datos reiniciada exitosamente');
        console.log(' Usuarios creados:');
        console.log('   admin / 123456 (rol: admin)');
        console.log('   test / cliente (rol: cliente)');
        console.log('\nCategorías y productos de ejemplo restaurados.\n');
    } catch (err) {
        console.error('Error al reiniciar la base de datos:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

resetDatabase();
