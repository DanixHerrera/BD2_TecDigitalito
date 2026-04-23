require('dotenv').config();
const express = require('express');
const { connectMongo, disconnectMongo } = require('./src/databases/mongo');
const { connectRedis, disconnectRedis } = require('./src/databases/redis');
const { connectNeo4j, closeNeo4j } = require('./src/databases/neo4j');
const { connectRaven } = require('./src/databases/raven');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

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