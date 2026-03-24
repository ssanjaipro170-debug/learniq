// routes/analytics.js
const express = require('express');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET student's own analytics
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [testResults] = await db.query(
      `SELECT tr.score, tr.created_at, t.title AS test_title, c.title AS course_title
       FROM test_results tr
       JOIN tests t ON t.id = tr.test_id
       JOIN courses c ON c.id = t.course_id
       WHERE tr.user_id = ?
       ORDER BY tr.created_at DESC LIMIT 20`,
      [req.user.id]
    );

    const [subjectScores] = await db.query(
      `SELECT c.title AS course, ROUND(AVG(tr.score),1) AS avg_score
       FROM test_results tr
       JOIN tests t ON t.id = tr.test_id
       JOIN courses c ON c.id = t.course_id
       WHERE tr.user_id = ?
       GROUP BY c.id ORDER BY avg_score DESC`,
      [req.user.id]
    );

    const [rank] = await db.query(
      `SELECT COUNT(*) + 1 AS rank FROM (
         SELECT user_id, AVG(score) AS avg FROM test_results GROUP BY user_id
       ) t WHERE t.avg > (
         SELECT AVG(score) FROM test_results WHERE user_id = ?
       )`,
      [req.user.id]
    );

    const [streak] = await db.query(
      `SELECT COUNT(DISTINCT DATE(created_at)) AS days
       FROM test_results
       WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [req.user.id]
    );

    res.json({
      testResults,
      subjectScores,
      rank: rank[0].rank,
      streakDays: streak[0].days
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET leaderboard (top 10)
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, ROUND(AVG(tr.score),1) AS avg_score,
              COUNT(tr.id) AS tests_taken
       FROM users u
       JOIN test_results tr ON tr.user_id = u.id
       WHERE u.role = 'student'
       GROUP BY u.id ORDER BY avg_score DESC LIMIT 10`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;


// ── routes/users.js ─────────────────────────────────────────
const usersRouter = express.Router();

usersRouter.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

usersRouter.put('/me', authMiddleware, async (req, res) => {
  const { name } = req.body;
  try {
    await db.query('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
    res.json({ message: 'Profile updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Export both
module.exports = { analyticsRouter: router, usersRouter };
