const { MongoClient } = require('mongodb');

class MongoDB {
    constructor() {
        this.client = null;
        this.db = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            if (this.isConnected) {
                console.log('MongoDB ya está conectado');
                return this.db;
            }

            const mongoURI = process.env.MONGODB_URI;
            console.log(` Conectando a MongoDB: ${mongoURI}`);

            this.client = new MongoClient(mongoURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            });

            await this.client.connect();
            this.db = this.client.db();
            this.isConnected = true;

            console.log(' MongoDB conectado directamente a:', this.db.databaseName);
            return this.db;
        } catch (error) {
            console.error(' Error al conectar MongoDB:', error.message);
            throw error;
        }
    }

    getDb() {
        if (!this.isConnected || !this.db) {
            throw new Error(' Database not initialized. Call connect() first.');
        }
        return this.db;
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.isConnected = false;
            this.db = null;
            this.client = null;
            console.log(' MongoDB desconectado');
        }
    }

    async healthCheck() {
        try {
            if (!this.isConnected) return false;
            await this.db.command({ ping: 1 });
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Singleton instance
const mongoDB = new MongoDB();
module.exports = mongoDB;