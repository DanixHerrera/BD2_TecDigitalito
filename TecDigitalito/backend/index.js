const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TecDigitalito API is running' });
});

// Routes placeholder
// app.use('/api/courses', require('./routes/courses'));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
// Codigo place-holder de Gemini ( No es codigo de produccion ) 
