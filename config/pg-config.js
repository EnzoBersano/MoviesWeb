// config/pg-config.js
const { Pool } = require('pg');

// Configuración del pool de PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'movies',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    max: 20, // Máximo de conexiones simultáneas
    idleTimeoutMillis: 30000, // Tiempo máximo que una conexión puede estar inactiva
    connectionTimeoutMillis: 5000 // Tiempo máximo para intentar conectar
});

// Probar conexión inicial
pool.connect()
    .then(client => {
        console.log('✅ Conectado a PostgreSQL');
        client.release();
    })
    .catch(err => {
        console.error('❌ Error al conectar a PostgreSQL:', err);
    });

// Exportar el pool para usar en app.js y rutas
module.exports = { pool };
