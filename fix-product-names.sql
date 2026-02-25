-- Fix product names to include size variants properly
UPDATE stock SET product_name = 'Royal Cotton 100ml' WHERE product_name = 'Royal Cotton';
UPDATE stock SET product_name = 'White Tea & Woods 100ml' WHERE product_name = 'White Tea & Woods';
UPDATE stock SET product_name = 'scc 100ml' WHERE product_name = 'scc';
UPDATE stock SET product_name = 'Ivory Linen 100ml' WHERE product_name = 'Ivory Linen';
