const mongoose = require('mongoose');

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const { host, name } = mongoose.connection || {};
    console.log('MongoDB conectado', { host, db: name });
    return true;
  } catch (error) {
    console.error('Error conectando MongoDB:', error.message);
    return false;
  }
}

async function disconnectMongo() {
  try {
    await mongoose.disconnect();
    console.log('MongoDB desconectado');
  } catch (error) {
    console.error('Error desconectando MongoDB:', error.message);
  }
}

module.exports = {
  connectMongo,
  disconnectMongo,
};
