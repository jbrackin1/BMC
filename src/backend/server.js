const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes'); // make sure this is imported
const intakeRoutes = require('./routes/intakeRoutes');
const practiceBetterRoutes = require('./routes/practiceBetterRoutes');

const app = express();

// 🔐 CORS config (allows frontend to send cookies)
app.use(
  cors({
    origin: 'http://localhost:3000', // React dev server
    credentials: true // ⬅️ Required to allow cookie sending
  })
);

// 🔐 Middleware
app.use(express.json());
app.use(cookieParser());

// 🔁 Routes
app.use('/api/auth', authRoutes);
app.use('/api/intake', intakeRoutes);
app.use('/api/pb', practiceBetterRoutes);
// 🚀 Start server LAST
const PORT = process.env.BACKEND_PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
