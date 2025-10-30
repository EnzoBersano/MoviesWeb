// src/backend/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Reemplaza esta URL con tu MongoDB URI
        // Para desarrollo local: 'mongodb://localhost:27017/moviesweb'
        // Para MongoDB Atlas: 'mongodb+srv://usuario:password@cluster.mongodb.net/moviesweb'
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/moviesweb';

        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ MongoDB conectado exitosamente');
    } catch (error) {
        console.error('❌ Error al conectar MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;