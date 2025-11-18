// scripts/setup.js - NUEVO ARCHIVO
// Script para verificar configuración inicial
const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkPostgreSQL() {
    console.log('🔍 Verificando conexión a PostgreSQL...');
    const pool = new Pool({
        host: process.env.PG_HOST,
        port: process.env.PG_PORT,
        database: process.env.PG_DATABASE,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD
    });

    try {
        const result = await pool.query('SELECT COUNT(*) FROM movies.movie');
        console.log(`✅ PostgreSQL conectado - ${result.rows[0].count} películas encontradas`);
        await pool.end();
        return true;
    } catch (error) {
        console.error('❌ Error en PostgreSQL:', error.message);
        return false;
    }
}

async function checkMongoDB() {
    console.log('🔍 Verificando conexión a MongoDB...');
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        const db = client.db();
        console.log(`✅ MongoDB conectado - Base de datos: ${db.databaseName}`);
        await client.close();
        return true;
    } catch (error) {
        console.error('❌ Error en MongoDB:', error.message);
        return false;
    }
}

async function setup() {
    console.log('🚀 Iniciando verificación del sistema...\n');

    const pgOk = await checkPostgreSQL();
    const mongoOk = await checkMongoDB();

    console.log('\n📊 Resumen:');
    console.log(`PostgreSQL: ${pgOk ? '✅' : '❌'}`);
    console.log(`MongoDB: ${mongoOk ? '✅' : '❌'}`);

    if (pgOk && mongoOk) {
        console.log('\n✨ Sistema listo para iniciar!');
        console.log('Ejecuta: npm start');
    } else {
        console.log('\n⚠️  Hay problemas de configuración. Revisa tu .env');
    }
}

setup();