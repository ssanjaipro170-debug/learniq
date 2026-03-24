// routes/users.js
const express = require('express');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET logged-in user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update profile
router.put('/me', authMiddleware, async (req, res) => {
  const { name } = req.body;
  try {
    await db.query('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
    res.json({ message: 'Profile updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
