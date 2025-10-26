(function() {
    const userId = document.querySelector('[data-user-id]')?.dataset.userId || '1';
    const movieId = document.querySelector('[data-movie-id]')?.dataset.movieId;
    const movieTitle = document.querySelector('[data-movie-title]')?.dataset.movieTitle;

    if (!movieId || !movieTitle) {
        return;
    }

    const stars = document.querySelectorAll('.star');
    const ratingMessage = document.getElementById('rating-message');

    stars.forEach(star => {
        star.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.2)';
        });

        star.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });

        star.addEventListener('click', async function() {
            const rating = this.getAttribute('data-rating');

            try {
                const response = await fetch('/activity/rate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId,
                        movieId: movieId,
                        movieTitle: movieTitle,
                        rating: rating
                    })
                });

                const data = await response.json();

                if (data.success) {
                    ratingMessage.textContent = 'Calificaste esta película con ' + rating + ' estrellas';
                    ratingMessage.style.color = '#4ecdc4';

                    stars.forEach((s, index) => {
                        if (index < rating) {
                            s.style.filter = 'brightness(1.2)';
                        } else {
                            s.style.filter = 'grayscale(100%)';
                        }
                    });
                } else {
                    ratingMessage.textContent = 'Error al guardar la calificación';
                    ratingMessage.style.color = '#ff6b6b';
                }
            } catch (error) {
                ratingMessage.textContent = 'Error de conexión';
                ratingMessage.style.color = '#ff6b6b';
            }
        });
    });

    const favoriteBtn = document.getElementById('favorite-btn');
    const favoriteMessage = document.getElementById('favorite-message');

    favoriteBtn.addEventListener('click', async function() {
        try {
            const response = await fetch('/activity/favorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    movieId: movieId,
                    movieTitle: movieTitle
                })
            });

            const data = await response.json();

            if (data.success) {
                favoriteMessage.textContent = 'Añadido a tus favoritos';
                favoriteMessage.style.color = '#4ecdc4';
                favoriteBtn.disabled = true;
                favoriteBtn.style.opacity = '0.6';
                favoriteBtn.style.cursor = 'not-allowed';
            } else {
                favoriteMessage.textContent = 'Error al añadir a favoritos';
                favoriteMessage.style.color = '#ff6b6b';
            }
        } catch (error) {
            favoriteMessage.textContent = 'Error de conexión';
            favoriteMessage.style.color = '#ff6b6b';
        }
    });

    const reviewText = document.getElementById('review-text');
    const submitReviewBtn = document.getElementById('submit-review-btn');
    const reviewMessage = document.getElementById('review-message');

    submitReviewBtn.addEventListener('click', async function() {
        const text = reviewText.value.trim();

        if (!text) {
            reviewMessage.textContent = 'Por favor escribe una reseña';
            reviewMessage.style.color = '#ff6b6b';
            return;
        }

        try {
            const saveResponse = await fetch('/reviews/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    movieId: movieId,
                    reviewText: text
                })
            });

            const saveData = await saveResponse.json();

            if (saveData.success) {
                const activityResponse = await fetch('/activity/review', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId,
                        movieId: movieId,
                        movieTitle: movieTitle,
                        reviewId: saveData.reviewId
                    })
                });

                const activityData = await activityResponse.json();

                if (activityData.success) {
                    reviewMessage.textContent = 'Reseña publicada exitosamente';
                    reviewMessage.style.color = '#4ecdc4';
                    reviewText.value = '';
                    submitReviewBtn.disabled = true;
                    submitReviewBtn.style.opacity = '0.6';
                }
            } else {
                reviewMessage.textContent = 'Error al publicar la reseña';
                reviewMessage.style.color = '#ff6b6b';
            }
        } catch (error) {
            reviewMessage.textContent = 'Error de conexión';
            reviewMessage.style.color = '#ff6b6b';
        }
    });
})();