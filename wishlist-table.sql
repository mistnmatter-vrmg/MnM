-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_phone TEXT NOT NULL,
  product_name TEXT NOT NULL,
  price REAL NOT NULL,
  mrp REAL NOT NULL,
  img TEXT,
  added_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_phone, product_name)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_phone);
