// routes/tests.js
const express = require('express');
const db = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET all tests for a course
router.get('/course/:courseId', authMiddleware, async (req, res) => {
  try {
    const [tests] = await db.query(
      'SELECT id, title, question_count, duration_min, difficulty FROM tests WHERE course_id = ?',
      [req.params.courseId]
    );
    res.json(tests);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET test questions (hide correct answers for students during test)
router.get('/:id/questions', authMiddleware, async (req, res) => {
  try {
    const [questions] = await db.query(
      'SELECT id, question_text, option_a, option_b, option_c, option_d, difficulty FROM questions WHERE test_id = ? ORDER BY RAND()',
      [req.params.id]
    );
    // Instructors/admins get the correct_option too
    if (req.user.role !== 'student') {
      const [full] = await db.query('SELECT * FROM questions WHERE test_id = ?', [req.params.id]);
      return res.json(full);
    }
    res.json(questions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST submit test answers & auto-grade
router.post('/:id/submit', authMiddleware, async (req, res) => {
  const { answers } = req.body; // { questionId: selectedOption, ... }
  try {
    const [questions] = await db.query(
      'SELECT id, correct_option FROM questions WHERE test_id = ?', [req.params.id]
    );
    let correct = 0;
    const results = questions.map(q => {
      const isCorrect = answers[q.id] === q.correct_option;
      if (isCorrect) correct++;
      return { questionId: q.id, correct: isCorrect, correctOption: q.correct_option, selected: answers[q.id] };
    });
    const score = Math.round((correct / questions.length) * 100);

    // Save result
    await db.query(
      'INSERT INTO test_results (user_id, test_id, score, correct_count, total_count) VALUES (?,?,?,?,?)',
      [req.user.id, req.params.id, score, correct, questions.length]
    );

    res.json({ score, correct, total: questions.length, results });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create test (instructor/admin)
router.post('/', authMiddleware, requireRole('instructor','admin'), async (req, res) => {
  const { title, courseId, durationMin, questions } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [t] = await conn.query(
      'INSERT INTO tests (title, course_id, duration_min, question_count) VALUES (?,?,?,?)',
      [title, courseId, durationMin, questions.length]
    );
    for (const q of questions) {
      await conn.query(
        'INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty) VALUES (?,?,?,?,?,?,?,?)',
        [t.insertId, q.text, q.a, q.b, q.c, q.d, q.correct, q.difficulty || 'Medium']
      );
    }
    await conn.commit();
    res.status(201).json({ message: 'Test created', testId: t.insertId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally { conn.release(); }
});

module.exports = router;
