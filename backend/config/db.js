// config/db.js — MySQL connection pool
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'learniq_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(conn => { console.log('MySQL connected'); conn.release(); })
  .catch(err  => console.error('MySQL connection error:', err.message));

module.exports = pool;
```

**Steps:**
1. Open `config/db.js` in VS Code
2. Press **Ctrl + A** to select everything
3. Delete it all
4. Paste the code above
5. Save → Push to GitHub:
```
git add .
git commit -m "fix db.js"
git push
