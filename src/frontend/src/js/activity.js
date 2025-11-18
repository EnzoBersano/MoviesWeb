const CURRENT_USER_ID = 'user_abc';

// Registrar calificación
async function registerRating(movieId, movieTitle, rating) {
    try {
        const response = await fetch('/activity/rate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: CURRENT_USER_ID,
                movieId,
                movieTitle,
                rating
            })
        });

        const data = await response.json();
        if (data.success) {
            console.log(' Calificación registrada');
        }
    } catch (error) {
        console.error('Error al registrar calificación:', error);
    }
}

// Registrar reseña
async function registerReview(movieId, movieTitle, reviewText) {
    try {
        const response = await fetch('/activity/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: CURRENT_USER_ID,
                movieId,
                movieTitle,
                reviewText
            })
        });

        const data = await response.json();
        if (data.success) {
            console.log(' Reseña registrada');
        }
    } catch (error) {
        console.error('Error al registrar reseña:', error);
    }
}

// Registrar favorito
async function registerFavorite(movieId, movieTitle) {
    try {
        const response = await fetch('/activity/favorite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: CURRENT_USER_ID,
                movieId,
                movieTitle
            })
        });

        const data = await response.json();
        if (data.success) {
            console.log(' Favorito registrado');
        }
    } catch (error) {
        console.error('Error al registrar favorito:', error);
    }
}


if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerRating, registerReview, registerFavorite };
}