# LearnIQ — AI-Powered LMS Platform

## Project Structure

```
learniq/
├── frontend/
│   ├── login.html              ← Login page (entry point)
│   ├── css/
│   │   └── style.css           ← Global stylesheet
│   ├── js/
│   │   └── sidebar.js          ← Shared sidebar + auth guard
│   └── pages/
│       ├── dashboard.html      ← Student dashboard
│       ├── courses.html        ← Course listing
│       ├── test.html           ← Test / MCQ screen
│       ├── analytics.html      ← Performance analytics
│       └── admin.html          ← Admin panel
└── backend/
    ├── server.js               ← Express entry point
    ├── package.json
    ├── .env                    ← Environment variables
    ├── config/
    │   ├── db.js               ← MySQL connection pool
    │   └── schema.sql          ← Full DB schema + seed data
    ├── middleware/
    │   └── auth.js             ← JWT auth + role guard
    └── routes/
        ├── auth.js             ← /api/auth  (login, register)
        ├── users.js            ← /api/users
        ├── courses.js          ← /api/courses
        ├── tests.js            ← /api/tests
        ├── analytics.js        ← /api/analytics
        └── admin.js            ← /api/admin
```

---

## Setup Instructions

### Step 1 — Install Node.js & MySQL
- Node.js: https://nodejs.org (v18+ recommended)
- MySQL: https://dev.mysql.com/downloads/

### Step 2 — Set up the database
```bash
mysql -u root -p < backend/config/schema.sql
```
This creates the database, all tables, and seed data (sample admin/instructor/student accounts).

### Step 3 — Configure environment
Edit `backend/.env` and set your MySQL password:
```
DB_PASSWORD=your_actual_password
```

### Step 4 — Install dependencies & start server
```bash
cd backend
npm install
npm run dev        # development (auto-restart)
# or
npm start          # production
```

### Step 5 — Open in browser
```
http://localhost:3000
```

---

## Default Login Accounts (from seed data)

| Role       | Email                    | Password    |
|------------|--------------------------|-------------|
| Admin      | admin@learniq.com        | admin123    |
| Instructor | instructor@learniq.com   | teacher123  |
| Student    | student@learniq.com      | student123  |

---

## API Endpoints

### Auth
| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| POST   | /api/auth/register          | Create account       |
| POST   | /api/auth/login             | Login → get JWT      |
| POST   | /api/auth/change-password   | Change password      |

### Courses
| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| GET    | /api/courses       | List all courses         |
| GET    | /api/courses/:id   | Single course            |
| POST   | /api/courses       | Create (instructor/admin)|
| PUT    | /api/courses/:id   | Update                   |
| DELETE | /api/courses/:id   | Delete (admin only)      |

### Tests
| Method | Endpoint                       | Description             |
|--------|--------------------------------|-------------------------|
| GET    | /api/tests/course/:courseId    | Tests for a course      |
| GET    | /api/tests/:id/questions       | Questions (no answers)  |
| POST   | /api/tests/:id/submit          | Submit + auto-grade     |
| POST   | /api/tests                     | Create test             |

### Analytics
| Method | Endpoint                    | Description             |
|--------|-----------------------------|-------------------------|
| GET    | /api/analytics/me           | My scores & progress    |
| GET    | /api/analytics/leaderboard  | Top 10 students         |

### Admin
| Method | Endpoint               | Description          |
|--------|------------------------|----------------------|
| GET    | /api/admin/stats       | Dashboard stats      |
| GET    | /api/admin/students    | All students + scores|
| DELETE | /api/admin/students/:id| Remove student       |
| GET    | /api/admin/results     | All test results     |

---

## Innovations Added (vs Basic E-Box)

1. **AI Recommendations** — tip panel on dashboard suggests weak topics
2. **Adaptive difficulty** — questions tagged Easy/Medium/Hard
3. **Auto-grading** — test submission instantly scored server-side
4. **Leaderboard** — class rank computed via SQL RANK()
5. **Role-based access** — student / instructor / admin with JWT guards
6. **Streak tracking** — daily study streak counted in analytics
7. **Badge system** — DB-ready achievement engine
8. **AI score prediction** — shown on analytics page
9. **At-risk detection** — admin sees students scoring below 50%
10. **Notification table** — ready for push/email notifications

---

## Next Steps (future improvements)
- Add OpenAI API integration for AI chatbot doubt-solver
- Add email notifications using Nodemailer
- Build mobile-responsive PWA version
- Add video content upload for instructors
- Add coding sandbox for programming tests
