require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectMongo, closeMongo } = require('./config/mongo-config');
const mainRoutes = require('./src/backend/routes/index.js'); // rutas principales del backend
const profileRoutes = require('./src/backend/routes/profileRoutes'); // 👈 NUEVA LÍNEA

const app = express();
const PORT = process.env.PORT || 3500;

// --- Configuración del motor de vistas EJS ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/frontend/src/views'));

// --- Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Override de método (PUT/DELETE vía POST)
app.use((req, res, next) => {
    if (req.body && req.body._method) {
        req.method = req.body._method.toUpperCase();
        delete req.body._method;
    }
    next();
});

// --- Archivos estáticos ---
app.use('/css', express.static(path.join(__dirname, 'src/frontend/src/css')));
app.use('/js', express.static(path.join(__dirname, 'src/frontend/src/js')));
app.use('/assets', express.static(path.join(__dirname, 'src/frontend/src/assets')));
app.use(express.static(path.join(__dirname, 'public')));

// --- Rutas ---
app.use('/', mainRoutes);
app.use('/profile', profileRoutes); // 👈 NUEVA LÍNEA

// --- Manejo de errores 404 ---
app.use((req, res) => {
    res.status(404).render('error', { message: 'Página no encontrada' });
});

// --- Inicialización del servidor ---
async function startServer() {
    try {
        await connectMongo();
        app.listen(PORT, () => {
            console.log(`✅ Servidor en ejecución en http://localhost:${PORT}`);
            console.log(`📊 Perfil de usuario disponible en http://localhost:${PORT}/profile/user_abc`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// --- Cierre limpio de conexión Mongo ---
process.on('SIGINT', async () => {
    console.log('\n🔄 Cerrando conexión a MongoDB...');
    await closeMongo();
    console.log('👋 Servidor cerrado correctamente');
    process.exit(0);
});

startServer();

module.exports = app;