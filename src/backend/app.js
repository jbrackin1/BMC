const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const intakeRoutes = require('./routes/intakeRoutes');
const practiceBetterRoutes = require('./routes/practiceBetterRoutes');

const app = express();

// 🔧 Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies

// 🔐 Routes
app.use('/api/auth', authRoutes); // Example: POST /api/auth/login
app.use('/api/intake', intakeRoutes);
app.use('/api/pb', practiceBetterRoutes);
// ✅ Health check route (optional)
app.get('/', (req, res) => {
  res.send('BetterMindCare backend is live!');
});

module.exports = app;
