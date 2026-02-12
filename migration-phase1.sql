-- Migration: Add missing columns to existing tables

-- Add password and role to users table
ALTER TABLE users ADD COLUMN password TEXT;
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  mrp REAL NOT NULL,
  category TEXT,
  images TEXT,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  stock_quantity INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert products
INSERT OR IGNORE INTO products (name, description, price, mrp, category, images, rating, review_count, stock_quantity) VALUES
  ('Royal Cotton Fabric Perfume', 'Royal Cotton captures the calm of freshly washed linen drying under soft morning light.', 599, 999, 'Clean cotton freshness | Subtle, non-overpowering scent', '["royalcotton2.png"]', 4.8, 1300, 50),
  ('White Tea & Woods Fabric Perfume', 'A gentle blend of white tea wrapped in soft woody warmth.', 699, 1299, 'Soft White Tea | Light Woody Warmth', '["Tea.png"]', 4.9, 1600, 30),
  ('Soft Cotton Cloud Fabric Perfume', 'Comforting cotton freshness with a smooth finish.', 599, 999, 'Soft Cotton Freshness | Smooth Comforting Finish', '["softcotton.png"]', 4.8, 1100, 40),
  ('Ivory Linen Fabric Perfume', 'Crisp linen softened by airy florals.', 699, 1299, 'Clean Linen Opening | Soft Airy Florals', '["ivorylinen.png"]', 4.7, 1400, 35);

-- Add tracking columns to orders
ALTER TABLE orders ADD COLUMN tracking_number TEXT;
ALTER TABLE orders ADD COLUMN courier_name TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
