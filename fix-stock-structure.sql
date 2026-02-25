-- Revert product names back to original (without size suffix)
UPDATE stock SET product_name = 'Royal Cotton' WHERE product_name LIKE 'Royal Cotton%';
UPDATE stock SET product_name = 'White Tea & Woods' WHERE product_name LIKE 'White Tea & Woods%';
UPDATE stock SET product_name = 'scc' WHERE product_name LIKE 'scc%';
UPDATE stock SET product_name = 'Ivory Linen' WHERE product_name LIKE 'Ivory Linen%';

-- Delete duplicate entries, keep only one per product
DELETE FROM stock WHERE id NOT IN (
  SELECT MIN(id) FROM stock GROUP BY product_name
);

-- Add size column
ALTER TABLE stock ADD COLUMN size TEXT DEFAULT '100ml';

-- Insert variants for each product
INSERT INTO stock (product_name, size, available, reserved) VALUES
  ('Royal Cotton', '50ml', 30, 0),
  ('Royal Cotton', '30ml', 30, 0),
  ('White Tea & Woods', '50ml', 30, 0),
  ('White Tea & Woods', '30ml', 30, 0),
  ('scc', '50ml', 30, 0),
  ('scc', '30ml', 30, 0),
  ('Ivory Linen', '50ml', 30, 0),
  ('Ivory Linen', '30ml', 30, 0);
