const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    database: process.env.PG_DATABASE || 'movies',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD
});

pool.on('connect', () => {
    // Conectado a PostgreSQL
});

pool.on('error', (err) => {
    // Error en PostgreSQL
});

module.exports = pool;