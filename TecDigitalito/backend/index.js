require('dotenv').config();
const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const { connectMongo, disconnectMongo } = require('./src/databases/mongo');
const { connectRedis, disconnectRedis, redisClient } = require('./src/databases/redis');
const { connectNeo4j, closeNeo4j } = require('./src/databases/neo4j');
const { connectRaven } = require('./src/databases/raven');
const { initSocket } = require('./src/socket');

const authRoutes = require('./src/routes/auth');
const authMiddleware = require('./src/middlewares/authMiddleware');
const courseRoutes = require('./src/routes/course');
const sectionRoutes = require('./src/routes/section');
const sectionContentRoutes = require('./src/routes/sectionContent');
const messageRoutes = require('./src/routes/message');
const socialRoutes = require('./src/routes/social');
const evaluationRoutes = require('./src/routes/evaluation');

const app = express();
// Avoid 304 responses (ETag-based) for API fetches; they often break `res.json()` on the client.
app.disable('etag');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost',
    credentials: true,
  },
});

initSocket(io);

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId.toString());
    }
  });
});

app.use(express.json());
app.use(cookieParser());
app.use(require('./src/middlewares/responseMiddleware'));
app.use((req, res, next) => {
  if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
});

app.use('/api', sectionRoutes);
app.use('/api', sectionContentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/social', socialRoutes);
app.use('/api', evaluationRoutes);

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

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// Error handler debe ir DESPUÉS de todas las rutas
app.use(require('./src/middlewares/errorHandler'));

async function iniciar() {
  console.log('Iniciando Mongo...');
  const mongoConectado = await connectMongo();
  if (!mongoConectado) process.exit(1);

  console.log('Iniciando Redis...');
  const redisConectado = await connectRedis();
  if (!redisConectado) process.exit(1);

  console.log('Iniciando RavenDB...');
  const ravenConectado = connectRaven();
  if (!ravenConectado) process.exit(1);

  console.log('Iniciando Neo4j...');
  const neo4jConectado = await connectNeo4j();
  if (!neo4jConectado) process.exit(1);
  console.log('testing backend');
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
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
