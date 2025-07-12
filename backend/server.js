// server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('cleaning_service.db');

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Services table
  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Bookings table
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    address TEXT NOT NULL,
    date_time DATETIME NOT NULL,
    service_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Insert default services
  db.run(`INSERT OR IGNORE INTO services (id, name, description, price) VALUES 
    (1, 'Deep Cleaning', 'Complete deep cleaning service', 150.00),
    (2, 'Carpet Cleaning', 'Professional carpet cleaning', 80.00),
    (3, 'Window Cleaning', 'Interior and exterior window cleaning', 60.00),
    (4, 'Kitchen Cleaning', 'Detailed kitchen cleaning', 100.00),
    (5, 'Bathroom Cleaning', 'Complete bathroom sanitization', 70.00)`);

  // Insert default admin user (username: admin, password: admin123)
  bcrypt.hash('admin123', 10, (err, hash) => {
    if (!err) {
      db.run(`INSERT OR IGNORE INTO users (username, password_hash) VALUES ('admin', ?)`, [hash]);
    }
  });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', 
      [username, hashedPassword], 
      function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        
        const token = jwt.sign({ userId: this.lastID, username }, JWT_SECRET);
        res.json({ token, user: { id: this.lastID, username } });
      });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username } });
  });
});

// Services routes
app.get('/api/services', (req, res) => {
  db.all('SELECT * FROM services ORDER BY name', (err, services) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(services);
  });
});

// Booking routes
app.get('/api/bookings', authenticateToken, (req, res) => {
  const query = `
    SELECT b.*, s.name as service_name, s.price as service_price
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    WHERE b.user_id = ?
    ORDER BY b.date_time DESC
  `;
  
  db.all(query, [req.user.userId], (err, bookings) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(bookings);
  });
});

app.post('/api/bookings', authenticateToken, (req, res) => {
  const { customer_name, address, date_time, service_id } = req.body;
  
  // Validation
  if (!customer_name || !address || !date_time || !service_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `
    INSERT INTO bookings (customer_name, address, date_time, service_id, user_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.run(query, [customer_name, address, date_time, service_id, req.user.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Return the created booking with service details
    const selectQuery = `
      SELECT b.*, s.name as service_name, s.price as service_price
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ?
    `;
    
    db.get(selectQuery, [this.lastID], (err, booking) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json(booking);
    });
  });
});

app.put('/api/bookings/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { customer_name, address, date_time, service_id } = req.body;
  
  // Validation
  if (!customer_name || !address || !date_time || !service_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `
    UPDATE bookings 
    SET customer_name = ?, address = ?, date_time = ?, service_id = ?
    WHERE id = ? AND user_id = ?
  `;
  
  db.run(query, [customer_name, address, date_time, service_id, id, req.user.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Booking not found or not authorized' });
    }
    
    // Return the updated booking with service details
    const selectQuery = `
      SELECT b.*, s.name as service_name, s.price as service_price
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ?
    `;
    
    db.get(selectQuery, [id], (err, booking) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(booking);
    });
  });
});

app.delete('/api/bookings/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM bookings WHERE id = ? AND user_id = ?', [id, req.user.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Booking not found or not authorized' });
    }
    
    res.json({ message: 'Booking deleted successfully' });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;