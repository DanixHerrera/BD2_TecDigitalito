require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const { connectMongo, disconnectMongo } = require('./src/databases/mongo');
const { connectRedis, disconnectRedis, redisClient } = require('./src/databases/redis');
const { connectNeo4j, closeNeo4j } = require('./src/databases/neo4j');
const { connectRaven } = require('./src/databases/raven');

const authRoutes = require('./src/routes/auth');
const authMiddleware = require('./src/middlewares/authMiddleware');
const courseRoutes = require('./src/routes/course');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});
app.get('/profile', authMiddleware, (req, res) => {
  res.json({
    ok: true,
    message: 'Ruta protegida funcionando',
    user: req.user,
  });
});
app.get('/health/redis-set', async (req, res) => {
  try {
    await redisClient.set('prueba', 'hola_redis', { EX: 60 });
    res.json({ ok: true, message: 'Valor guardado en Redis por 60 segundos' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/health/redis-get', async (req, res) => {
  try {
    const valor = await redisClient.get('prueba');
    res.json({ ok: true, valor });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

async function iniciar() {
  console.log('Iniciando Mongo...');
  const mongoConectado = await connectMongo();
  if (!mongoConectado) process.exit(1);

  console.log('Iniciando Redis...');
  const redisConectado = await connectRedis();
  if (!redisConectado) process.exit(1);

  console.log('Iniciando Neo4j...');
  const neo4jConectado = await connectNeo4j();
  if (!neo4jConectado) process.exit(1);

  console.log('Iniciando RavenDB...');
  const ravenConectado = connectRaven();
  if (!ravenConectado) process.exit(1);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Puerto ${PORT}`);
  });
}

process.on('SIGINT', async () => {
  console.log('\nCerrar');
  await disconnectMongo();
  await disconnectRedis();
  await closeNeo4j();
  process.exit(0);
});

iniciar().catch((error) => {
  console.error('Error iniciando servidor:', error);
  process.exit(1);
});