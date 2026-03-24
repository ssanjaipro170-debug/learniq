const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'learniq_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

---

**Steps:**
1. Open `backend/config/db.js` in VS Code
2. Add `port: process.env.DB_PORT || 3306,` after the host line
3. Save the file
4. Push to GitHub:
```
git add .
git commit -m "fix db port"
git push
