require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');

const authRoutes      = require('./routes/auth');
const userRoutes      = require('./routes/users');
const courseRoutes    = require('./routes/courses');
const testRoutes      = require('./routes/tests');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes     = require('./routes/admin');
const db              = require('./config/db');

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

// ── Seed route — sets password123 for ALL users ──────────────
app.get('/setup-seed', async (req, res) => {
  try {
    const hash = await bcrypt.hash('password123', 10);

    // Update existing users
    await db.query('UPDATE users SET password = ?', [hash]);

    // Insert 10 students if not already there
    const students = [
      ['Arjun Kumar',    'arjun@learniq.com'],
      ['Priya Sharma',   'priya@learniq.com'],
      ['Rahul Nair',     'rahul@learniq.com'],
      ['Divya Mohan',    'divya@learniq.com'],
      ['Karthik Raja',   'karthik@learniq.com'],
      ['Sneha Patel',    'sneha@learniq.com'],
      ['Vikram Singh',   'vikram@learniq.com'],
      ['Ananya Reddy',   'ananya@learniq.com'],
      ['Mohammed Ali',   'mali@learniq.com'],
      ['Deepa Krishnan', 'deepa@learniq.com'],
    ];

    for (const [name, email] of students) {
      await db.query(
        'INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hash, 'student']
      );
    }

    res.json({
      message: '✅ All done! 10 students + admin + instructor created.',
      password: 'password123',
      accounts: [
        'admin@learniq.com',
        'student@learniq.com',
        'arjun@learniq.com',
        'priya@learniq.com',
        'rahul@learniq.com',
        'divya@learniq.com',
        'karthik@learniq.com',
        'sneha@learniq.com',
        'vikram@learniq.com',
        'ananya@learniq.com',
        'mali@learniq.com',
        'deepa@learniq.com',
      ]
    });
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
