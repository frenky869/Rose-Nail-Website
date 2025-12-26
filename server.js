const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize SQLite database
const db = new Database('bookings.db');

// Create bookings table with unique constraint on date, time, and service
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, time)
  )
`);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Check if a slot is available
app.get('/api/check-availability', (req, res) => {
  const { date, time } = req.query;

  if (!date || !time) {
    return res.status(400).json({ 
      error: 'Date and time are required' 
    });
  }

  try {
    const stmt = db.prepare('SELECT id FROM bookings WHERE date = ? AND time = ?');
    const booking = stmt.get(date, time);

    res.json({ 
      available: !booking,
      message: booking ? 'Already booked' : 'Available'
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new booking
app.post('/api/bookings', (req, res) => {
  const { name, phone, service, date, time } = req.body;

  // Validation
  if (!name || !phone || !service || !date || !time) {
    return res.status(400).json({ 
      error: 'All fields are required' 
    });
  }

  try {
    // Using INSERT with UNIQUE constraint to handle race conditions at database level
    const stmt = db.prepare(`
      INSERT INTO bookings (name, phone, service, date, time)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(name, phone, service, date, time);

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      bookingId: info.lastInsertRowid
    });
  } catch (error) {
    // Check if error is due to UNIQUE constraint violation
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        success: false,
        error: 'Already booked',
        message: 'This time slot is already booked. Please choose a different time.'
      });
    }

    console.error('Error creating booking:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to create booking. Please try again.'
    });
  }
});

// Get all bookings (for admin/debugging purposes)
app.get('/api/bookings', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM bookings ORDER BY date, time');
    const bookings = stmt.all();
    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
