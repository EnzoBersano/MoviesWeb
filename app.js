require('dotenv').config();
const express = require('express');
const path = require('path');
const routes = require('./src/backend/routes');

const app = express();
const port = process.env.PORT || 3500;

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend/src/views'));

// Servir archivos estáticos (CSS, JS, assets)
app.use('/css', express.static(path.join(__dirname, 'frontend/src/css')));
app.use('/js', express.static(path.join(__dirname, 'frontend/src/js')));
app.use('/assets', express.static(path.join(__dirname, 'frontend/src/assets')));

// Middleware para parsear datos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usar las rutas
app.use('/', routes);

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).send('Página no encontrada');
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor en ejecución en http://localhost:${port}`);
});

module.exports = app;