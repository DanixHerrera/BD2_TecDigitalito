require('dotenv').config();
const express = require('express');
const { connectMongo, disconnectMongo } = require('./src/databases/mongo');
// const usersRoutes = require('./routes/User');
// const coursesRoutes = require('./routes/Course');

const app = express();
app.use(express.json());
// app.use('/api/users', usersRoutes);
// app.use('/api/courses', coursesRoutes);

async function iniciar() {
  const conectado = await connectMongo();
  if (!conectado) process.exit(1);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Puerto ${PORT}`);
  });
}

process.on('SIGINT', async () => {
  console.log('\nCerrar');
  await disconnectMongo();
  process.exit(0);
});

iniciar();