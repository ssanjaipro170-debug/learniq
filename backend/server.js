require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');

const authRoutes       = require('./routes/auth');
const userRoutes       = require('./routes/users');
const courseRoutes     = require('./routes/courses');
const testRoutes       = require('./routes/tests');
const analyticsRoutes  = require('./routes/analytics');
const adminRoutes      = require('./routes/admin');
const db               = require('./config/db');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/courses',   courseRoutes);
app.use('/api/tests',     testRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin',     adminRoutes);

// ── Temporary seed route ─────────────────────────────────────
app.get('/setup-seed', async (req, res) => {
  try {
    const hash = await bcrypt.hash('password123', 10);
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hash, 'admin@learniq.com']);
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hash, 'student@learniq.com']);
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hash, 'instructor@learniq.com']);
    res.json({ message: 'Passwords updated! Login with password123' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'LearnIQ API is running!' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`LearnIQ server running on http://localhost:${PORT}`));
