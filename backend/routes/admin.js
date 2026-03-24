// routes/admin.js
const express = require('express');
const db = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

// All admin routes require login + admin role
router.use(authMiddleware, requireRole('admin'));

// GET dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [[{ students }]] = await db.query("SELECT COUNT(*) AS students FROM users WHERE role='student'");
    const [[{ courses  }]] = await db.query("SELECT COUNT(*) AS courses FROM courses");
    const [[{ tests    }]] = await db.query("SELECT COUNT(*) AS tests FROM tests");
    const [[{ atRisk   }]] = await db.query(
      `SELECT COUNT(*) AS atRisk FROM (
         SELECT user_id FROM test_results GROUP BY user_id HAVING AVG(score) < 50
       ) t`
    );
    res.json({ students, courses, tests, atRisk });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET all students with their avg score
router.get('/students', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.created_at,
              ROUND(COALESCE(AVG(tr.score),0),1) AS avg_score,
              COUNT(tr.id) AS tests_taken
       FROM users u
       LEFT JOIN test_results tr ON tr.user_id = u.id
       WHERE u.role = 'student'
       GROUP BY u.id ORDER BY avg_score DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE a student
router.delete('/students/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ? AND role = ?', [req.params.id, 'student']);
    res.json({ message: 'Student removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET all test results (admin view)
router.get('/results', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.name, t.title AS test, c.title AS course, tr.score, tr.created_at
       FROM test_results tr
       JOIN users u ON u.id = tr.user_id
       JOIN tests t ON t.id = tr.test_id
       JOIN courses c ON c.id = t.course_id
       ORDER BY tr.created_at DESC LIMIT 100`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
