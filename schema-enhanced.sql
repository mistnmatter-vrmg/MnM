-- ============ PHASE 1: Enhanced Schema with Auth & Products ============

-- Users Table (Enhanced with password and role)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  password TEXT,
  role TEXT DEFAULT 'user',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent REAL DEFAULT 0
);

-- Products Table (NEW)
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

-- Insert Initial Products
INSERT OR IGNORE INTO products (name, description, price, mrp, category, images, rating, review_count, stock_quantity) VALUES
  ('Royal Cotton Fabric Perfume', 'Royal Cotton captures the calm of freshly washed linen drying under soft morning light.', 599, 999, 'Clean cotton freshness | Subtle, non-overpowering scent', '["royalcotton2.png"]', 4.8, 1300, 50),
  ('White Tea & Woods Fabric Perfume', 'A gentle blend of white tea wrapped in soft woody warmth.', 699, 1299, 'Soft White Tea | Light Woody Warmth', '["Tea.png"]', 4.9, 1600, 30),
  ('Soft Cotton Cloud Fabric Perfume', 'Comforting cotton freshness with a smooth finish.', 599, 999, 'Soft Cotton Freshness | Smooth Comforting Finish', '["softcotton.png"]', 4.8, 1100, 40),
  ('Ivory Linen Fabric Perfume', 'Crisp linen softened by airy florals.', 699, 1299, 'Clean Linen Opening | Soft Airy Florals', '["ivorylinen.png"]', 4.7, 1400, 35);

-- User Addresses Table
CREATE TABLE IF NOT EXISTS user_addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_phone TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  is_default INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  total REAL NOT NULL,
  shipping REAL DEFAULT 0,
  payment_method TEXT,
  screenshot_url TEXT,
  status TEXT DEFAULT 'pending',
  tracking_number TEXT,
  courier_name TEXT,
  verified_by TEXT,
  verified_at TEXT,
  rejected_reason TEXT,
  rejected_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Delivery Addresses Table
CREATE TABLE IF NOT EXISTS delivery_addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Stock Table
CREATE TABLE IF NOT EXISTS stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name TEXT UNIQUE NOT NULL,
  available INTEGER DEFAULT 0,
  reserved INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert Initial Stock
INSERT OR IGNORE INTO stock (product_name, available, reserved) VALUES
  ('Royal Cotton Fabric Perfume', 50, 0),
  ('White Tea & Woods Fabric Perfume', 30, 0),
  ('Soft Cotton Cloud Fabric Perfume', 40, 0),
  ('Ivory Linen Fabric Perfume', 35, 0);

-- User Cart Table
CREATE TABLE IF NOT EXISTS user_cart (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_phone TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  mrp REAL NOT NULL,
  img TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value REAL NOT NULL,
  min_order_value REAL DEFAULT 0,
  max_discount REAL,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_until TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_phone TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price REAL NOT NULL,
  product_mrp REAL NOT NULL,
  product_img TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_phone, product_name)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  review_text TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_name, user_phone)
);

-- Notifications Log
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_phone ON user_addresses(user_phone);
CREATE INDEX IF NOT EXISTS idx_cart_phone ON user_cart(user_phone);
CREATE INDEX IF NOT EXISTS idx_wishlist_phone ON wishlist(user_phone);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_name);
