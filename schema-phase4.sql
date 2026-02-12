-- Phase 4: Growth & Conversion Tables

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  subscribed_at TEXT NOT NULL,
  is_active INTEGER DEFAULT 1
);

-- Abandoned cart tracking
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_phone TEXT NOT NULL,
  cart_data TEXT NOT NULL,
  total REAL NOT NULL,
  created_at TEXT NOT NULL,
  recovered INTEGER DEFAULT 0,
  recovered_at TEXT
);

-- WhatsApp notification logs
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id TEXT,
  sent_at TEXT NOT NULL,
  status TEXT DEFAULT 'sent'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter(email);
CREATE INDEX IF NOT EXISTS idx_abandoned_phone ON abandoned_carts(user_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_order ON whatsapp_logs(order_id);
