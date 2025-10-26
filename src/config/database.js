require('dotenv').config();
const { Pool } = require('pg');

// Crear pool de conexiones a PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    options: `-c search_path=movies,public`,
});

// Event listeners para monitorear la conexión
pool.on('connect', () => {
    console.log('Conectado a PostgreSQL');
});

pool.on('error', (err) => {
    console.error(' Error inesperado en el cliente de PostgreSQL:', err);
    process.exit(-1);
});

// Función helper para ejecutar queries con logs (opcional)
pool.queryWithLog = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Query ejecutado:', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Error en query:', { text, error: error.message });
        throw error;
    }
};

module.exports = pool;