-- ============================================================
--  LearnIQ LMS — MySQL Database Schema
--  Run this file once to set up the full database
--  Command: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS learniq_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE learniq_db;

-- ── 1. USERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100)  NOT NULL,
  email        VARCHAR(150)  NOT NULL UNIQUE,
  password     VARCHAR(255)  NOT NULL,
  role         ENUM('student','instructor','admin') NOT NULL DEFAULT 'student',
  avatar_url   VARCHAR(255),
  department   VARCHAR(100),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── 2. COURSES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(150) NOT NULL,
  description  TEXT,
  chapters     INT          DEFAULT 0,
  icon         VARCHAR(10)  DEFAULT '📚',
  created_by   INT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ── 3. STUDENT COURSE ENROLMENT ──────────────────────────────
CREATE TABLE IF NOT EXISTS enrolments (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  course_id    INT NOT NULL,
  enrolled_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_enrol (user_id, course_id),
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ── 4. STUDENT PROGRESS PER COURSE ──────────────────────────
CREATE TABLE IF NOT EXISTS student_progress (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  course_id    INT NOT NULL,
  progress_pct TINYINT UNSIGNED DEFAULT 0,   -- 0-100
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_progress (user_id, course_id),
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ── 5. TESTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tests (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(200) NOT NULL,
  course_id      INT NOT NULL,
  duration_min   TINYINT UNSIGNED DEFAULT 30,
  question_count SMALLINT UNSIGNED DEFAULT 0,
  due_date       DATE,
  created_by     INT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id)  REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)   ON DELETE SET NULL
);

-- ── 6. QUESTIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  test_id        INT NOT NULL,
  question_text  TEXT NOT NULL,
  option_a       VARCHAR(300) NOT NULL,
  option_b       VARCHAR(300) NOT NULL,
  option_c       VARCHAR(300) NOT NULL,
  option_d       VARCHAR(300) NOT NULL,
  correct_option ENUM('a','b','c','d') NOT NULL,
  difficulty     ENUM('Easy','Medium','Hard') DEFAULT 'Medium',
  explanation    TEXT,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- ── 7. TEST RESULTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS test_results (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  test_id       INT NOT NULL,
  score         TINYINT UNSIGNED NOT NULL,   -- 0-100 percentage
  correct_count SMALLINT UNSIGNED DEFAULT 0,
  total_count   SMALLINT UNSIGNED DEFAULT 0,
  time_taken_s  SMALLINT UNSIGNED,           -- seconds taken
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- ── 8. BADGES / ACHIEVEMENTS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  icon        VARCHAR(10)  DEFAULT '🏅',
  condition_type ENUM('streak','score','tests_completed','rank') NOT NULL,
  condition_value INT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  badge_id   INT NOT NULL,
  earned_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_badge (user_id, badge_id),
  FOREIGN KEY (user_id)  REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id)  ON DELETE CASCADE
);

-- ── 9. NOTIFICATIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  message    VARCHAR(255) NOT NULL,
  type       ENUM('reminder','achievement','warning','info') DEFAULT 'info',
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
--  SEED DATA — starter content for development/testing
-- ============================================================

-- Default admin account (password: admin123)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin User', 'admin@learniq.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVwork9Az2', 'admin');

-- Default instructor (password: teacher123)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Prof. Ramesh Kumar', 'instructor@learniq.com',
 '$2a$10$Ei1pCGpAHgGaATLnN3dAuOXiJuP7UhiWO8FxAKB89VtGnR7TfJfVK', 'instructor');

-- Sample student (password: student123)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Arjun Kumar', 'student@learniq.com',
 '$2a$10$TJqnKJVdO4nMlAF9GGmpqO5I0x.3VUPXl6yRSnP9w4s9g6TS06Nce', 'student');

-- Courses
INSERT IGNORE INTO courses (title, description, chapters, icon, created_by) VALUES
('Java Programming',   'OOP, Collections, JDBC, Multithreading', 12, '☕', 2),
('Data Structures',    'Arrays, Linked Lists, Trees, Graphs',    10, '🌲', 2),
('Aptitude',           'Quantitative, Logical, Verbal Reasoning', 8, '🧠', 2),
('DBMS',               'SQL, Normalization, Transactions',         9, '🗄️', 2),
('OS Concepts',        'Processes, Memory, Scheduling',           11, '⚙️', 2),
('Computer Networks',  'TCP/IP, OSI Model, Protocols',             8, '🌐', 2);

-- Badges
INSERT IGNORE INTO badges (name, description, icon, condition_type, condition_value) VALUES
('7-Day Streak',    'Study 7 days in a row',           '🔥', 'streak',           7),
('Test Champion',   'Score 90%+ on any test',          '🏆', 'score',            90),
('Consistent',      'Complete 10 tests',               '📋', 'tests_completed',  10),
('Top 10',          'Reach top 10 in class rank',      '⭐', 'rank',             10);

-- ============================================================
--  USEFUL VIEWS for quick queries
-- ============================================================

CREATE OR REPLACE VIEW student_leaderboard AS
  SELECT
    u.id, u.name, u.email,
    ROUND(AVG(tr.score), 1)   AS avg_score,
    COUNT(tr.id)              AS tests_taken,
    RANK() OVER (ORDER BY AVG(tr.score) DESC) AS class_rank
  FROM users u
  LEFT JOIN test_results tr ON tr.user_id = u.id
  WHERE u.role = 'student'
  GROUP BY u.id;

CREATE OR REPLACE VIEW course_performance AS
  SELECT
    c.id, c.title,
    COUNT(DISTINCT e.user_id)  AS enrolled_students,
    ROUND(AVG(tr.score), 1)    AS avg_score,
    COUNT(t.id)                AS total_tests
  FROM courses c
  LEFT JOIN enrolments e   ON e.course_id = c.id
  LEFT JOIN tests t        ON t.course_id = c.id
  LEFT JOIN test_results tr ON tr.test_id = t.id
  GROUP BY c.id;
