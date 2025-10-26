require('dotenv').config();
const express = require('express');
const path = require('path');
const routes = require('./src/backend/routes/index.js'); // Ruta explícita al index.js

const app = express();
const port = process.env.PORT || 3500;

// Configurar motor de vistas EJS
app.set('view engine', 'ejs');

// Ruta absoluta a las vistas (según tu estructura)
app.set('views', path.join(__dirname, 'src/frontend/src/views'));

// Servir archivos estáticos (CSS, JS, assets)
app.use('/css', express.static(path.join(__dirname, 'src/frontend/src/css')));
app.use('/js', express.static(path.join(__dirname, 'src/frontend/src/js')));
app.use('/assets', express.static(path.join(__dirname, 'src/frontend/src/assets')));

// Middleware para parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware opcional para soportar override de métodos (PUT/DELETE vía POST)
app.use((req, res, next) => {
    if (req.body && req.body._method) {
        req.method = req.body._method.toUpperCase();
        delete req.body._method;
    }
    next();
});

// Usar las rutas del backend
app.use('/', routes);

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).render('error', { message: 'Página no encontrada' });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor en ejecución en http://localhost:${port}`);
});

module.exports = app;
