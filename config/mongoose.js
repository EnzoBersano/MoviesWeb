// config/mongoose.js
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME   = process.env.MONGO_DB  || 'moviesweb';

async function connectMongoose() {
    if (mongoose.connection.readyState === 1) return;
    mongoose.set('strictQuery', false);
    await mongoose.connect(`${MONGO_URI}/${DB_NAME}`);
    console.log('✅ Mongoose conectado');
}

async function closeMongoose() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('🔒 Mongoose cerrado');
    }
}

module.exports = { connectMongoose, closeMongoose };
