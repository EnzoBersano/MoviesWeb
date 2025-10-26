const personRepository = require('../repository/person.repository');

class PersonService {
    async getActorDetails(actorId) {
        try {
            const movies = await personRepository.getActorMovies(actorId);

            if (movies.length === 0) {
                return null;
            }

            return {
                actorName: movies[0].actor_name,
                movies: movies
            };
        } catch (error) {
            throw new Error(`Error obteniendo detalles del actor: ${error.message}`);
        }
    }

    async getDirectorDetails(directorId) {
        try {
            const movies = await personRepository.getDirectorMovies(directorId);

            if (movies.length === 0) {
                return null;
            }

            return {
                directorName: movies[0].director_name,
                movies: movies
            };
        } catch (error) {
            throw new Error(`Error obteniendo detalles del director: ${error.message}`);
        }
    }
}

module.exports = new PersonService();