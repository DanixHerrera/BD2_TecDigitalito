const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err.message);
});

async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("Redis conectado");
  } catch (error) {
    console.error("Error conectando Redis:", error.message);
  }
}

module.exports = { redisClient, connectRedis };