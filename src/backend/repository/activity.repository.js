const mongoDB = require('../config/mongodb');
const { ObjectId } = require('mongodb');

class ActivityRepository {
    constructor() {
        this.collectionName = 'user_activity';
    }

    async getCollection() {
        try {
            const db = mongoDB.getDb();
            return db.collection(this.collectionName);
        } catch (error) {
            console.error('Error obteniendo colección:', error);
            throw new Error('Database not available');
        }
    }

    // CREATE
    async create(activityData) {
        try {
            const collection = await this.getCollection();
            const result = await collection.insertOne(activityData);
            return { _id: result.insertedId, ...activityData };
        } catch (error) {
            console.error('Error en repository.create:', error);
            throw error;
        }
    }

    // READ
    async findByUserId(userId, options = {}) {
        try {
            const collection = await this.getCollection();
            const { limit = 20, skip = 0, sort = { timestamp: -1 } } = options;

            const cursor = collection
                .find({ userId: userId.toString() })
                .sort(sort)
                .skip(skip)
                .limit(limit);

            return await cursor.toArray();
        } catch (error) {
            console.error('Error en repository.findByUserId:', error);
            return [];
        }
    }

    async findAll(options = {}) {
        try {
            const collection = await this.getCollection();
            const { limit = 50, skip = 0, sort = { timestamp: -1 } } = options;

            const cursor = collection
                .find({})
                .sort(sort)
                .skip(skip)
                .limit(limit);

            return await cursor.toArray();
        } catch (error) {
            console.error('Error en repository.findAll:', error);
            return [];
        }
    }

    async findByType(userId, type, options = {}) {
        try {
            const collection = await this.getCollection();
            const { limit = 20, skip = 0, sort = { timestamp: -1 } } = options;

            const cursor = collection
                .find({
                    userId: userId.toString(),
                    type: type
                })
                .sort(sort)
                .skip(skip)
                .limit(limit);

            return await cursor.toArray();
        } catch (error) {
            console.error('Error en repository.findByType:', error);
            return [];
        }
    }

    async findById(activityId) {
        try {
            const collection = await this.getCollection();

            if (!ObjectId.isValid(activityId)) {
                return null;
            }

            return await collection.findOne({
                _id: new ObjectId(activityId)
            });
        } catch (error) {
            console.error('Error en repository.findById:', error);
            return null;
        }
    }

    // DELETE
    async deleteById(activityId) {
        try {
            const collection = await this.getCollection();

            if (!ObjectId.isValid(activityId)) {
                throw new Error('ID de actividad inválido');
            }

            const result = await collection.deleteOne({
                _id: new ObjectId(activityId)
            });

            if (result.deletedCount === 0) {
                throw new Error('Actividad no encontrada');
            }

            return result;
        } catch (error) {
            console.error('Error en repository.deleteById:', error);
            throw error;
        }
    }

    async deleteByUserId(userId) {
        try {
            const collection = await this.getCollection();

            const result = await collection.deleteMany({
                userId: userId.toString()
            });

            return result;
        } catch (error) {
            console.error('Error en repository.deleteByUserId:', error);
            throw error;
        }
    }

    // STATISTICS
    async getUserStats(userId) {
        try {
            const collection = await this.getCollection();

            const pipeline = [
                {
                    $match: {
                        userId: userId.toString()
                    }
                },
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 }
                    }
                }
            ];

            const cursor = collection.aggregate(pipeline);
            return await cursor.toArray();
        } catch (error) {
            console.error('Error en repository.getUserStats:', error);
            throw error;
        }
    }
}

module.exports = new ActivityRepository();