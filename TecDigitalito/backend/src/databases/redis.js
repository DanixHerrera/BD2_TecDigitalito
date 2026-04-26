const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err.message);
});

async function connectRedis() {
  try {
    await redisClient.connect();
    console.log('Redis conectado');
    return true;
  } catch (error) {
    console.error('Error conectando Redis:', error.message);
    return false;
  }
}

async function disconnectRedis() {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log('Redis desconectado');
    }
  } catch (error) {
    console.error('Error desconectando Redis:', error.message);
  }
}

module.exports = {
  redisClient,
  connectRedis,
  disconnectRedis,
};