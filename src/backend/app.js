const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 🔧 Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies

// 🔐 Routes
app.use('/api/auth', authRoutes); // Example: POST /api/auth/login

// ✅ Health check route (optional)
app.get('/', (req, res) => {
  res.send('BetterMindCare backend is live!');
});

module.exports = app;