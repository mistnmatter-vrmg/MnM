-- Add tracking fields to orders table
ALTER TABLE orders ADD COLUMN tracking_number TEXT;
ALTER TABLE orders ADD COLUMN dispatch_date TEXT;
ALTER TABLE orders ADD COLUMN estimated_delivery TEXT;
ALTER TABLE orders ADD COLUMN courier_name TEXT;
