const personService = require('../service/person.service');

class PersonController {
    async getActorDetails(req, res) {
        try {
            const actorId = req.params.id;
            const actorData = await personService.getActorDetails(actorId);

            if (!actorData) {
                return res.status(404).send('Actor no encontrado.');
            }

            res.render('actor', {
                actorName: actorData.actorName,
                movies: actorData.movies
            });
        } catch (error) {
            console.error('Error obteniendo actor:', error);
            res.status(500).send('Error al cargar las películas del actor.');
        }
    }

    async getDirectorDetails(req, res) {
        try {
            const directorId = req.params.id;
            const directorData = await personService.getDirectorDetails(directorId);

            if (!directorData) {
                return res.status(404).send('Director no encontrado.');
            }

            res.render('director', {
                directorName: directorData.directorName,
                movies: directorData.movies
            });
        } catch (error) {
            console.error('Error obteniendo director:', error);
            res.status(500).send('Error al cargar las películas del director.');
        }
    }
}

module.exports = new PersonController();