-- User Cart Table
CREATE TABLE IF NOT EXISTS user_cart (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_phone TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  mrp REAL NOT NULL,
  img TEXT,
  added_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create Index
CREATE INDEX IF NOT EXISTS idx_cart_user ON user_cart(user_phone);
