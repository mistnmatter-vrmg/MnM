-- Migration: Add password column and make email unique
-- Run this on your D1 database

-- Step 1: Add password column if not exists
ALTER TABLE users ADD COLUMN password TEXT;

-- Step 2: Add role column if not exists (for admin/user distinction)
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';

-- Step 3: Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Step 4: Update existing users table structure (if needed)
-- Note: SQLite doesn't support ALTER COLUMN, so we need to recreate table for UNIQUE constraint

-- Backup existing data
CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users;

-- Drop old table
DROP TABLE IF EXISTS users;

-- Create new users table with proper constraints
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent REAL DEFAULT 0
);

-- Restore data from backup
INSERT INTO users (id, name, phone, email, password, role, created_at, last_login, total_orders, total_spent)
SELECT id, name, phone, email, NULL, 'user', created_at, last_login, total_orders, total_spent
FROM users_backup;

-- Drop backup table
DROP TABLE users_backup;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Verify migration
SELECT COUNT(*) as total_users FROM users;
