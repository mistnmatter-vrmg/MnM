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
  valid_from TEXT,
  valid_until TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Coupon Usage Table
CREATE TABLE IF NOT EXISTS coupon_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coupon_id INTEGER NOT NULL,
  user_phone TEXT NOT NULL,
  order_id TEXT NOT NULL,
  discount_amount REAL NOT NULL,
  used_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id)
);

-- Insert sample coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_discount, usage_limit, valid_until) VALUES
  ('FIRST10', 'percentage', 10, 0, 100, 100, '2026-12-31'),
  ('SAVE50', 'fixed', 50, 500, NULL, 500, '2026-12-31'),
  ('WELCOME20', 'percentage', 20, 1000, 200, 50, '2026-12-31');

CREATE INDEX IF NOT EXISTS idx_coupon_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage(user_phone);
