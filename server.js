// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5005;

// Secret key for JWT
const JWT_SECRET = 'your_strong_secret_key'; // Change this in production

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Update as needed
  database: 'hrms',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});


// -------------------- REGISTER ROUTE --------------------
app.post('/api/auth/register', (req, res) => {
  const { fullName, phoneNumber, email, role, username, password } = req.body;

  if (!fullName || !email || !username || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);

  const sql = `
    INSERT INTO account (FullName, PhoneNumber, Email, Role, Username, Password, IsActive)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `;

  db.query(sql, [fullName, phoneNumber, email, role, username, hashedPassword], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Email or Username already exists' });
      }
      return res.status(500).json({ message: 'Registration failed', error: err });
    }
    res.status(201).json({ message: 'Account registered successfully' });
  });
});


// -------------------- LOGIN ROUTE --------------------
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const sql = 'SELECT * FROM account WHERE Username = ?';

  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ message: 'Login failed', error: err });

    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = results[0];

    // ✅ Check if account is deactivated
    if (!user.IsActive) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact the admin.' });
    }
    const isMatch = bcrypt.compareSync(password, user.Password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user.ID, username: user.Username, role: user.Role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.ID, username: user.Username, role: user.Role }
    });
  });
});


app.get('/api/accounts', (req, res) => {
  const sql = `
    SELECT ID, FullName, PhoneNumber, Email, Role, Username, IsActive 
    FROM account
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ message: 'Failed to fetch accounts', error: err });
    }
    res.json(results);
  });
});

// -------------------- TOGGLE ACCOUNT STATUS --------------------
app.put('/api/accounts/:id/status', (req, res) => {
  const accountId = req.params.id;

  // Fetch current status
  db.query('SELECT IsActive FROM account WHERE ID = ?', [accountId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const currentStatus = results[0].IsActive;
    const newStatus = currentStatus ? 0 : 1;

    db.query(
      'UPDATE account SET IsActive = ? WHERE ID = ?',
      [newStatus, accountId],
      (err, updateResult) => {
        if (err) return res.status(500).json({ message: 'Failed to update status', error: err });
        res.json({ message: `Account ${newStatus ? 'activated' : 'deactivated'} successfully` });
      }
    );
  });
});


// -------------------- TOKEN VERIFICATION (optional) --------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}


// -------------------- TEST PROTECTED ROUTE --------------------
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.username}, your role is ${req.user.role}` });
});


// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});