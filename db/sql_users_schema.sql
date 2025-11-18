-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
                                     user_id SERIAL PRIMARY KEY,
                                     user_username VARCHAR(50) UNIQUE NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Tabla de relación película-usuario (calificaciones, reseñas, favoritos)
CREATE TABLE IF NOT EXISTS movie_user (
                                          id SERIAL PRIMARY KEY,
                                          user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id)
    );

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_movie_user_user_id ON movie_user(user_id);
CREATE INDEX IF NOT EXISTS idx_movie_user_movie_id ON movie_user(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_user_favorite ON movie_user(is_favorite) WHERE is_favorite = TRUE;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_movie_user_updated_at
    BEFORE UPDATE ON movie_user
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Datos de ejemplo (opcional)
INSERT INTO users (user_username, user_name, user_email) VALUES
                                                             ('jdoe', 'John Doe', 'john.doe@example.com'),
                                                             ('asmith', 'Alice Smith', 'alice.smith@example.com'),
                                                             ('bwilliams', 'Bob Williams', 'bob.williams@example.com')
    ON CONFLICT (user_username) DO NOTHING;