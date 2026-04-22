const mongoose = require('mongoose');

async function connectMongo() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB conectado");
        return true;
    } catch (error) {
        console.log("Error:", error.message);
        return false;
    }
}

async function disconnectMongo() {
    try {
        await mongoose.disconnect();
        console.log("MongoDB desconectado");
    } catch (error) {
        console.log("Error:", error.message);
    }
}

module.exports = { connectMongo, disconnectMongo };


/// Base para empezar con mongo 