const express = require('express');
const mysql = require('mysql2');
const path = require('path'); // Import the path module
const app = express();
const PORT = process.env.PORT || 3000;

// Create a connection pool to the MySQL database
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'sql6.freesqldatabase.com',
  user: 'sql6686890',
  password: 'ksiI5xeCNq',
  database: 'sql6686890'
});

// Middleware to check connection to MySQL server
app.use((req, res, next) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    console.log('Connected to MySQL database');
    connection.release(); // Release the connection back to the pool
    next(); // Move to the next middleware or route handler
  });
});

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// Display current week leaderboard (Top 200)
// Display current week leaderboard (Top 200)
app.get('/leaderboard', (req, res) => {
  const currentTime = new Date().getTime();
  const oneWeekAgo = currentTime - (7 * 24 * 60 * 60 * 1000); // Calculate timestamp for one week ago
  const sql = 'SELECT * FROM usertable WHERE Timestamp >= ? ORDER BY Score DESC LIMIT 200';
  pool.query(sql, [oneWeekAgo], (err, results) => {
    if (err) {
      console.error('Error fetching current week leaderboard:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});

////Display last week leaderboard given a country by the user (Top 200)
app.get('/leaderboard/:country', (req, res) => {
  const country = req.params.country;
  const currentTime = new Date().getTime();
  const oneWeekAgo = new Date(currentTime - (7 * 24 * 60 * 60 * 1000)).toISOString();
  const sql = 'SELECT * FROM usertable WHERE country = ? AND Timestamp >= ? ORDER BY score DESC LIMIT 200';
  pool.query(sql, [country, oneWeekAgo], (err, results) => {
      if (err) {
          console.error('Error fetching leaderboard by country:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
      }
      res.json(results);
  });
});

  
//Display last week leaderboard given a country by the user (Top 200)
// app.get('/leaderboard/:country', (req, res) => {
//     const country = req.params.country;
//     const sql = 'SELECT * FROM usertable WHERE country = ? ORDER BY score DESC LIMIT 200';
//     pool.query(sql, [country], (err, results) => {
//       if (err) {
//         console.error('Error fetching leaderboard by country:', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//         return;
//       }
//       res.json(results);
//     });
//   });
// // Fetch user rank, given the userId
app.get('/:userId/rank', (req, res) => {
  const userId = req.params.userId;
  const sql = 'SELECT COUNT(*) AS `rank` FROM usertable WHERE score > (SELECT score FROM usertable WHERE UID = ?)';
  pool.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user rank:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const rank = results[0] ? results[0].rank + 1 : 'N/A';
    res.json({ rank });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
