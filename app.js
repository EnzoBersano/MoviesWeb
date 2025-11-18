// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoDB = require('./src/backend/config/mongodb');
const mainRoutes = require('./src/backend/routes/index.js');

const app = express();
const PORT = process.env.PORT || 3500;

// --- Motor de vistas EJS ---
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

// === Helper: registrar actividad en Mongo (colección "useractivities") ===
async function registrarActividad(userId, type, details) {
    try {
        const db = getDb();
        const activity = {
            userId,
            type,
            timestamp: new Date(),
            details
        };
        await db.collection('useractivities').insertOne(activity); // 👈 alineado con tus modelos/aggregations
    } catch (err) {
        console.error('Error registrando actividad:', err);
    }
}

// --- Rutas base ---
app.use('/', mainRoutes);
// ============================================
// FORMULARIO PARA CREAR USUARIO
// ============================================
app.get('/users/new', (req, res) => {
    res.render('user_form', { user: null, action: '/users', method: 'POST' });
});

// ============================================
// CREAR USUARIO
// ============================================
app.post('/users', async (req, res) => {
    const { user_username, user_name, user_email } = req.body;
    try {
        await pool.query(
            'INSERT INTO users (user_username, user_name, user_email) VALUES ($1, $2, $3)',
            [user_username, user_name, user_email]
        );
        res.redirect('/users');
    } catch (err) {
        console.error('Error creando usuario:', err);
        res.status(500).send('Error al crear usuario');
    }
});

// ============================================
// FORMULARIO PARA EDITAR USUARIO
// ============================================
app.get('/users/:id/edit', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).send('Usuario no encontrado');
        res.render('user_form', {
            user: result.rows[0],
            action: `/users/${req.params.id}`,
            method: 'POST'
        });
    } catch (err) {
        console.error('Error obteniendo usuario:', err);
        res.status(500).send('Error al obtener usuario');
    }
});

// ============================================
// ACTUALIZAR USUARIO
// ============================================
app.post('/users/:id', async (req, res) => {
    const { user_username, user_name, user_email } = req.body;
    try {
        await pool.query(
            'UPDATE users SET user_username = $1, user_name = $2, user_email = $3 WHERE user_id = $4',
            [user_username, user_name, user_email, req.params.id]
        );
        res.redirect('/users');
    } catch (err) {
        console.error('Error actualizando usuario:', err);
        res.status(500).send('Error al actualizar usuario');
    }
});

// ============================================
// ELIMINAR USUARIO
// ============================================
app.post('/users/:id/delete', async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE user_id = $1', [req.params.id]);
        res.redirect('/users');
    } catch (err) {
        console.error('Error eliminando usuario:', err);
        res.status(500).send('Error al eliminar usuario');
    }
});

// ============================================
// PERFIL DE USUARIO CON TIMELINE (MongoDB)
// ============================================
app.get('/users/:id/profile', async (req, res) => {
    try {
        const userId = req.params.id;

        // Usuario desde Postgres
        const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (userResult.rows.length === 0) return res.status(404).send('Usuario no encontrado');

        const user = userResult.rows[0];

        // Películas favoritas del usuario
        const favoritesResult = await pool.query(`
            SELECT m.movie_id, m.movie_title, mu.rating, mu.review, mu.is_favorite, mu.created_at
            FROM movie_user mu
                     JOIN movies m ON mu.movie_id = m.movie_id
            WHERE mu.user_id = $1
            ORDER BY mu.created_at DESC
        `, [userId]);

        // Timeline de actividades (Mongo)
        const db = getDb();
        const activities = await db.collection('useractivities')
            .find({ userId })
            .sort({ timestamp: -1 })
            .limit(20)
            .toArray();

        res.render('user_profile', {
            user,
            movies: favoritesResult.rows,
            activities
        });
    } catch (err) {
        console.error('Error al obtener perfil de usuario:', err);
        res.status(500).send('Error al obtener perfil de usuario');
    }
});

// ============================================
// CALIFICAR PELÍCULA
// ============================================
app.post('/movies/:movieId/rate', async (req, res) => {
    const { movieId } = req.params;
    const { userId, rating } = req.body;

    try {
        const movieResult = await pool.query(
            'SELECT movie_title FROM movies WHERE movie_id = $1',
            [movieId]
        );
        const movieTitle = movieResult.rows[0]?.movie_title || '(desconocido)';

        await pool.query(`
            INSERT INTO movie_user (user_id, movie_id, rating)
            VALUES ($1, $2, $3)
                ON CONFLICT (user_id, movie_id)
      DO UPDATE SET rating = $3, updated_at = CURRENT_TIMESTAMP
        `, [userId, movieId, rating]);

        await registrarActividad(userId, 'RATED_MOVIE', {
            movieId: parseInt(movieId, 10),
            movieTitle,
            rating: parseInt(rating, 10)
        });

        res.redirect(`/pelicula/${movieId}`);
    } catch (err) {
        console.error('Error al calificar película:', err);
        res.status(500).send('Error al calificar película');
    }
});

// ============================================
// ESCRIBIR RESEÑA
// ============================================
app.post('/movies/:movieId/review', async (req, res) => {
    const { movieId } = req.params;
    const { userId, review } = req.body;

    try {
        const movieResult = await pool.query(
            'SELECT movie_title FROM movies WHERE movie_id = $1',
            [movieId]
        );
        const movieTitle = movieResult.rows[0]?.movie_title || '(desconocido)';

        const result = await pool.query(`
            INSERT INTO movie_user (user_id, movie_id, review)
            VALUES ($1, $2, $3)
                ON CONFLICT (user_id, movie_id)
      DO UPDATE SET review = $3, updated_at = CURRENT_TIMESTAMP
                             RETURNING id
        `, [userId, movieId, review]);

        await registrarActividad(userId, 'WROTE_REVIEW', {
            movieId: parseInt(movieId, 10),
            movieTitle,
            reviewId: result.rows[0].id.toString()
        });

        res.redirect(`/pelicula/${movieId}`);
    } catch (err) {
        console.error('Error al escribir reseña:', err);
        res.status(500).send('Error al escribir reseña');
    }
});

// ============================================
// AGREGAR/QUITAR DE FAVORITOS
// ============================================
app.post('/movies/:movieId/favorite', async (req, res) => {
    const { movieId } = req.params;
    const { userId } = req.body;

    try {
        const movieResult = await pool.query(
            'SELECT movie_title FROM movies WHERE movie_id = $1',
            [movieId]
        );
        const movieTitle = movieResult.rows[0]?.movie_title || '(desconocido)';

        const checkResult = await pool.query(
            'SELECT is_favorite FROM movie_user WHERE user_id = $1 AND movie_id = $2',
            [userId, movieId]
        );

        const newFavoriteStatus =
            checkResult.rows.length === 0 ? true : !checkResult.rows[0].is_favorite;

        await pool.query(`
            INSERT INTO movie_user (user_id, movie_id, is_favorite)
            VALUES ($1, $2, $3)
                ON CONFLICT (user_id, movie_id)
      DO UPDATE SET is_favorite = $3, updated_at = CURRENT_TIMESTAMP
        `, [userId, movieId, newFavoriteStatus]);

        if (newFavoriteStatus) {
            await registrarActividad(userId, 'ADDED_TO_FAVORITES', {
                movieId: parseInt(movieId, 10),
                movieTitle
            });
        }

        res.redirect(`/pelicula/${movieId}`);
    } catch (err) {
        console.error('Error al actualizar favoritos:', err);
        res.status(500).send('Error al actualizar favoritos');
    }
});

// ============================================
// PELÍCULAS DE UN USUARIO
// ============================================
app.get('/users/:id/movies', async (req, res) => {
    try {
        const userId = req.params.id;

        const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (userResult.rows.length === 0) return res.status(404).send('Usuario no encontrado');

        const moviesResult = await pool.query(`
            SELECT
                m.movie_id,
                m.movie_title,
                mu.rating,
                mu.review,
                mu.is_favorite,
                mu.created_at,
                mu.updated_at
            FROM movie_user mu
                     JOIN movies m ON mu.movie_id = m.movie_id
            WHERE mu.user_id = $1
            ORDER BY mu.updated_at DESC
        `, [userId]);

        res.render('user_movies', {
            user: userResult.rows[0],
            movies: moviesResult.rows
        });
    } catch (err) {
        console.error('Error al obtener películas del usuario:', err);
        res.status(500).send('Error al obtener películas del usuario');
    }
});

// --- 404 ---
app.use((req, res) => {
    res.status(404).render('error', { message: 'Página no encontrada' });
});

// --- Inicialización del servidor ---
async function startServer() {
    try {
        // Conectar a MongoDB nativo
        await mongoDB.connect();

        app.listen(PORT, () => {
            console.log(` Servidor en ejecución en http://localhost:${PORT}`);
            console.log(` Buscador principal disponible en http://localhost:${PORT}/`);
            console.log(` Timeline integrado en el buscador principal`);
            console.log(`  Usando MongoDB nativo (sin Mongoose)`);
        });
    } catch (error) {
        console.error(' Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// --- Cierre limpio de conexión Mongo ---
process.on('SIGINT', async () => {
    console.log('\n Cerrando conexión a MongoDB...');
    await mongoDB.disconnect();
    console.log(' Servidor cerrado correctamente');
    process.exit(0);
});

startServer();

module.exports = app;