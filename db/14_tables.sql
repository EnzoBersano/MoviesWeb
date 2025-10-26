-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
                                     user_id SERIAL PRIMARY KEY,
                                     user_username VARCHAR(50) UNIQUE NOT NULL,
    user_name VARCHAR(100),
    user_email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS favorites (
                                         favorite_id SERIAL PRIMARY KEY,
                                         user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id)
    );

-- Índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_movie_id ON favorites(movie_id);

-- Tabla de reseñas
CREATE TABLE IF NOT EXISTS reviews (
                                       review_id SERIAL PRIMARY KEY,
                                       user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL,
    review_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON reviews(movie_id);

-- Tabla de calificaciones (movie_user)
CREATE TABLE IF NOT EXISTS movie_user (
                                          user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    opinion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, movie_id)
    );

-- Índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_movie_user_movie_id ON movie_user(movie_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para movie_user
DROP TRIGGER IF EXISTS update_movie_user_updated_at ON movie_user;
CREATE TRIGGER update_movie_user_updated_at
    BEFORE UPDATE ON movie_user
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();