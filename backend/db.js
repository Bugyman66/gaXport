const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(
  path.resolve(__dirname, 'database.sqlite'),
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error('Error connecting to database:', err);
    } else {
      console.log('Connected to SQLite database');
      
      // Initialize tables
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        transaction_pin TEXT,
        referral_code TEXT,
        referred_by INTEGER,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token TEXT,
        balance REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reset_token TEXT,
        reset_token_expiry INTEGER
      )`);
    }
  }
);

module.exports = db;
