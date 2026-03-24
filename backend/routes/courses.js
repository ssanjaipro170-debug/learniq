// routes/courses.js
const express = require('express');
const db = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET all courses (with student's progress if logged in)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [courses] = await db.query('SELECT * FROM courses ORDER BY title');
    if (req.user.role === 'student') {
      const [progress] = await db.query(
        'SELECT course_id, progress_pct FROM student_progress WHERE user_id = ?',
        [req.user.id]
      );
      const pMap = Object.fromEntries(progress.map(p => [p.course_id, p.progress_pct]));
      return res.json(courses.map(c => ({ ...c, progress: pMap[c.id] || 0 })));
    }
    res.json(courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single course
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Course not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create course (instructor/admin only)
router.post('/', authMiddleware, requireRole('instructor','admin'), async (req, res) => {
  const { title, description, chapters } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO courses (title, description, chapters, created_by) VALUES (?,?,?,?)',
      [title, description, chapters, req.user.id]
    );
    res.status(201).json({ message: 'Course created', id: result.insertId });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update course
router.put('/:id', authMiddleware, requireRole('instructor','admin'), async (req, res) => {
  const { title, description } = req.body;
  try {
    await db.query('UPDATE courses SET title=?, description=? WHERE id=?', [title, description, req.params.id]);
    res.json({ message: 'Course updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE course
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Course deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
