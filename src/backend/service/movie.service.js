const movieRepository = require('../repositories/movieRepository');

class MovieService {
    async getMovieDetails(movieId) {
        try {
            const rows = await movieRepository.getMovieById(movieId);

            if (rows.length === 0) {
                return null;
            }

            // Obtener información adicional
            const [genres, countries, companies, keywords] = await Promise.all([
                movieRepository.getMovieGenres(movieId),
                movieRepository.getMovieCountries(movieId),
                movieRepository.getMovieCompanies(movieId),
                movieRepository.getMovieKeywords(movieId)
            ]);

            // Estructurar los datos de la película
            const movieData = {
                movie_id: rows[0].movie_id,
                title: rows[0].title,
                release_date: rows[0].release_date,
                overview: rows[0].overview,
                budget: rows[0].budget,
                revenue: rows[0].revenue,
                runtime: rows[0].runtime,
                tagline: rows[0].tagline,
                vote_average: rows[0].vote_average,
                vote_count: rows[0].vote_count,
                popularity: rows[0].popularity,
                homepage: rows[0].homepage,
                movie_status: rows[0].movie_status,
                genres: genres,
                countries: countries,
                companies: companies,
                keywords: keywords,
                directors: [],
                writers: [],
                cast: [],
                crew: []
            };

            // Procesar directores
            rows.forEach((row) => {
                if (row.crew_member_id && row.crew_member_name && row.department_name && row.job) {
                    const isDuplicate = movieData.directors.some((crew) => crew.crew_member_id === row.crew_member_id);
                    if (!isDuplicate && row.department_name === 'Directing' && row.job === 'Director') {
                        movieData.directors.push({
                            crew_member_id: row.crew_member_id,
                            crew_member_name: row.crew_member_name,
                            job: row.job
                        });
                    }
                }
            });

            // Procesar escritores
            rows.forEach((row) => {
                if (row.crew_member_id && row.crew_member_name && row.department_name && row.job) {
                    const isDuplicate = movieData.writers.some((crew) => crew.crew_member_id === row.crew_member_id);
                    if (!isDuplicate && row.department_name === 'Writing') {
                        movieData.writers.push({
                            crew_member_id: row.crew_member_id,
                            crew_member_name: row.crew_member_name,
                            job: row.job
                        });
                    }
                }
            });

            // Procesar elenco
            rows.forEach((row) => {
                if (row.actor_id && row.actor_name && row.character_name) {
                    const isDuplicate = movieData.cast.some((actor) => actor.actor_id === row.actor_id);
                    if (!isDuplicate) {
                        movieData.cast.push({
                            actor_id: row.actor_id,
                            actor_name: row.actor_name,
                            character_name: row.character_name,
                            cast_order: row.cast_order
                        });
                    }
                }
            });

            // Procesar crew (resto del equipo)
            rows.forEach((row) => {
                if (row.crew_member_id && row.crew_member_name && row.department_name && row.job) {
                    const isDuplicate = movieData.crew.some((crew) => crew.crew_member_id === row.crew_member_id);
                    if (!isDuplicate && row.department_name !== 'Directing' && row.department_name !== 'Writing') {
                        movieData.crew.push({
                            crew_member_id: row.crew_member_id,
                            crew_member_name: row.crew_member_name,
                            department_name: row.department_name,
                            job: row.job
                        });
                    }
                }
            });

            // Ordenar cast por cast_order
            movieData.cast.sort((a, b) => a.cast_order - b.cast_order);

            return movieData;
        } catch (error) {
            throw new Error(`Error obteniendo detalles de película: ${error.message}`);
        }
    }

    async getMoviesByKeyword(keywordId) {
        try {
            return await movieRepository.getMoviesByKeyword(keywordId);
        } catch (error) {
            throw new Error(`Error obteniendo películas por keyword: ${error.message}`);
        }
    }
}

module.exports = new MovieService();