// test/services/movie.service.test.js
jest.mock('../../src/backend/repository/movie.repository', () => ({
    getMovieById: jest.fn(),
    getMovieGenres: jest.fn(),
    getMovieCountries: jest.fn(),
    getMovieCompanies: jest.fn(),
    getMovieKeywords: jest.fn(),
    getMoviesByKeyword: jest.fn(),
}));

const repo = require('../../src/backend/repository/movie.repository');
const MovieService = require('../../src/backend/service/movie.service'); // exporta instancia

describe('MovieService', () => {
    beforeEach(() => jest.clearAllMocks());

    test('getMovieDetails → null cuando no hay filas', async () => {
        repo.getMovieById.mockResolvedValue([]);
        const out = await MovieService.getMovieDetails('10');
        expect(repo.getMovieById).toHaveBeenCalledWith('10');
        expect(out).toBeNull();
    });

    test('getMovieDetails → compone movieData, dedup, y ordena cast', async () => {
        // rows simulando joins de cast/crew
        repo.getMovieById.mockResolvedValue([
            { movie_id: 1, title: 'Matrix', release_date: '1999-03-31', overview: '...', budget: 1, revenue: 2, runtime: 136, tagline: '...', vote_average: 8.7, vote_count: 1000, popularity: 10, homepage: null, movie_status: 'Released',
                // crew director
                crew_member_id: 100, crew_member_name: 'Lana Wachowski', department_name: 'Directing', job: 'Director',
                // actor
                actor_id: 200, actor_name: 'Keanu Reeves', character_name: 'Neo', cast_order: 2
            },
            { movie_id: 1, title: 'Matrix', release_date: '1999-03-31', overview: '...', budget: 1, revenue: 2, runtime: 136, tagline: '...', vote_average: 8.7, vote_count: 1000, popularity: 10, homepage: null, movie_status: 'Released',
                // writer
                crew_member_id: 101, crew_member_name: 'Lilly Wachowski', department_name: 'Writing', job: 'Writer',
                // actor duplicado con otro orden para chequear sort y dedup
                actor_id: 201, actor_name: 'Laurence Fishburne', character_name: 'Morpheus', cast_order: 1
            },
            { movie_id: 1, title: 'Matrix', release_date: '1999-03-31', overview: '...', budget: 1, revenue: 2, runtime: 136, tagline: '...', vote_average: 8.7, vote_count: 1000, popularity: 10, homepage: null, movie_status: 'Released',
                // crew no-directing/no-writing → va a "crew"
                crew_member_id: 300, crew_member_name: 'Bill Pope', department_name: 'Camera', job: 'Director of Photography',
            },
            // Duplicado de director → no debe volver a agregarse
            { movie_id: 1, title: 'Matrix', release_date: '1999-03-31', overview: '...', budget: 1, revenue: 2, runtime: 136, tagline: '...', vote_average: 8.7, vote_count: 1000, popularity: 10, homepage: null, movie_status: 'Released',
                crew_member_id: 100, crew_member_name: 'Lana Wachowski', department_name: 'Directing', job: 'Director',
            },
        ]);

        repo.getMovieGenres.mockResolvedValue(['Action', 'Sci-Fi']);
        repo.getMovieCountries.mockResolvedValue(['US']);
        repo.getMovieCompanies.mockResolvedValue(['Warner Bros.']);
        repo.getMovieKeywords.mockResolvedValue(['hacker', 'simulation']);

        const m = await MovieService.getMovieDetails('1');

        // llamadas a “extras”
        expect(repo.getMovieGenres).toHaveBeenCalledWith('1');
        expect(repo.getMovieCountries).toHaveBeenCalledWith('1');
        expect(repo.getMovieCompanies).toHaveBeenCalledWith('1');
        expect(repo.getMovieKeywords).toHaveBeenCalledWith('1');

        // estructura básica
        expect(m.movie_id).toBe(1);
        expect(m.title).toBe('Matrix');
        expect(m.genres).toEqual(['Action', 'Sci-Fi']);
        expect(m.countries).toEqual(['US']);
        expect(m.companies).toEqual(['Warner Bros.']);
        expect(m.keywords).toEqual(['hacker', 'simulation']);

        // directors (sin duplicados)
        expect(m.directors).toEqual([
            { crew_member_id: 100, crew_member_name: 'Lana Wachowski', job: 'Director' },
        ]);

        // writers
        expect(m.writers).toEqual([
            { crew_member_id: 101, crew_member_name: 'Lilly Wachowski', job: 'Writer' },
        ]);

        // cast ordenado por cast_order asc
        expect(m.cast.map(a => a.actor_name)).toEqual(['Laurence Fishburne', 'Keanu Reeves']);

        // crew (resto)
        expect(m.crew).toEqual([
            { crew_member_id: 300, crew_member_name: 'Bill Pope', department_name: 'Camera', job: 'Director of Photography' },
        ]);
    });

    test('getMovieDetails → lanza error envuelto', async () => {
        repo.getMovieById.mockRejectedValue(new Error('db down'));
        await expect(MovieService.getMovieDetails('1'))
            .rejects
            .toThrow('Error obteniendo detalles de película: db down');
    });

    test('getMoviesByKeyword → ok', async () => {
        repo.getMoviesByKeyword.mockResolvedValue([{ movie_id: 1 }]);
        const out = await MovieService.getMoviesByKeyword('5');
        expect(repo.getMoviesByKeyword).toHaveBeenCalledWith('5');
        expect(out).toEqual([{ movie_id: 1 }]);
    });

    test('getMoviesByKeyword → error envuelto', async () => {
        repo.getMoviesByKeyword.mockRejectedValue(new Error('boom'));
        await expect(MovieService.getMoviesByKeyword('5'))
            .rejects
            .toThrow('Error obteniendo películas por keyword: boom');
    });
});
