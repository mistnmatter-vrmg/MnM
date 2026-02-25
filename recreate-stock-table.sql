-- Drop and recreate stock table with size column
DROP TABLE IF EXISTS stock;

CREATE TABLE stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name TEXT NOT NULL,
  size TEXT NOT NULL DEFAULT '100ml',
  available INTEGER DEFAULT 0,
  reserved INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_name, size)
);

-- Insert all products with variants
INSERT INTO stock (product_name, size, available, reserved) VALUES
  ('Royal Cotton', '100ml', 50, 0),
  ('Royal Cotton', '50ml', 30, 0),
  ('Royal Cotton', '30ml', 30, 0),
  ('White Tea & Woods', '100ml', 30, 0),
  ('White Tea & Woods', '50ml', 30, 0),
  ('White Tea & Woods', '30ml', 30, 0),
  ('scc', '100ml', 40, 0),
  ('scc', '50ml', 30, 0),
  ('scc', '30ml', 30, 0),
  ('Ivory Linen', '100ml', 35, 0),
  ('Ivory Linen', '50ml', 30, 0),
  ('Ivory Linen', '30ml', 30, 0);
