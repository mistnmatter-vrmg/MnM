# Phase 4 - Admin Quick Reference

## 📧 Newsletter Management

### View Subscribers
```sql
-- Get all active subscribers
SELECT * FROM newsletter WHERE is_active = 1 ORDER BY subscribed_at DESC;

-- Count subscribers
SELECT COUNT(*) as total_subscribers FROM newsletter WHERE is_active = 1;

-- Recent subscribers (last 7 days)
SELECT * FROM newsletter 
WHERE subscribed_at >= datetime('now', '-7 days')
ORDER BY subscribed_at DESC;
```

### Export for Email Campaign
```sql
-- Export emails for Mailchimp/SendGrid
SELECT email, name FROM newsletter WHERE is_active = 1;
```

---

## 🛒 Abandoned Cart Recovery

### View Abandoned Carts
```sql
-- All abandoned carts (not recovered)
SELECT * FROM abandoned_carts 
WHERE recovered = 0 
ORDER BY created_at DESC;

-- High-value abandoned carts (>₹1000)
SELECT * FROM abandoned_carts 
WHERE recovered = 0 AND total > 1000
ORDER BY total DESC;

-- Abandoned carts with user info
SELECT ac.*, u.name, u.email 
FROM abandoned_carts ac
LEFT JOIN users u ON ac.user_phone = u.phone
WHERE ac.recovered = 0
ORDER BY ac.created_at DESC;
```

### Recovery Actions
```sql
-- Mark cart as recovered
UPDATE abandoned_carts 
SET recovered = 1, recovered_at = datetime('now')
WHERE id = ?;

-- Get cart details
SELECT user_phone, cart_data, total, created_at 
FROM abandoned_carts 
WHERE id = ?;
```

---

## 📱 WhatsApp Notifications

### View Logs
```sql
-- Recent WhatsApp notifications
SELECT * FROM whatsapp_logs 
ORDER BY sent_at DESC 
LIMIT 50;

-- Notifications by order
SELECT * FROM whatsapp_logs 
WHERE order_id = 'MNM1234567890';

-- Failed notifications
SELECT * FROM whatsapp_logs 
WHERE status = 'failed';
```

---

## 📊 Analytics Queries

### Newsletter Performance
```sql
-- Subscribers by month
SELECT 
  strftime('%Y-%m', subscribed_at) as month,
  COUNT(*) as subscribers
FROM newsletter
GROUP BY month
ORDER BY month DESC;

-- Subscribers with phone numbers
SELECT COUNT(*) as with_phone 
FROM newsletter 
WHERE phone IS NOT NULL AND phone != '';
```

### Abandoned Cart Stats
```sql
-- Abandonment rate
SELECT 
  COUNT(*) as total_abandoned,
  SUM(CASE WHEN recovered = 1 THEN 1 ELSE 0 END) as recovered,
  ROUND(SUM(CASE WHEN recovered = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as recovery_rate
FROM abandoned_carts;

-- Average abandoned cart value
SELECT ROUND(AVG(total), 2) as avg_cart_value
FROM abandoned_carts
WHERE recovered = 0;

-- Total potential revenue
SELECT SUM(total) as potential_revenue
FROM abandoned_carts
WHERE recovered = 0;
```

### WhatsApp Engagement
```sql
-- Messages sent today
SELECT COUNT(*) as messages_today
FROM whatsapp_logs
WHERE DATE(sent_at) = DATE('now');

-- Messages by status
SELECT status, COUNT(*) as count
FROM whatsapp_logs
GROUP BY status;
```

---

## 🎯 Marketing Actions

### Send Recovery Email/WhatsApp
1. Query abandoned carts (>24 hours old)
2. Get user contact info
3. Send personalized message:
   ```
   Hi [Name]! 👋
   
   You left items in your cart:
   [Cart Items]
   
   Complete your order now and get 10% off!
   Use code: COMEBACK10
   
   [Checkout Link]
   ```

### Newsletter Campaign
1. Export subscriber list
2. Create campaign in email service
3. Track opens/clicks
4. Update database with engagement

---

## 📈 Growth Metrics

### Key Metrics to Track
- Newsletter subscribers (daily/weekly/monthly)
- Abandoned cart rate
- Recovery rate
- WhatsApp engagement
- Conversion rate
- Average order value

### Weekly Report Query
```sql
-- Weekly summary
SELECT 
  'Newsletter' as metric,
  COUNT(*) as count
FROM newsletter
WHERE subscribed_at >= datetime('now', '-7 days')
UNION ALL
SELECT 
  'Abandoned Carts',
  COUNT(*)
FROM abandoned_carts
WHERE created_at >= datetime('now', '-7 days')
UNION ALL
SELECT 
  'Orders',
  COUNT(*)
FROM orders
WHERE created_at >= datetime('now', '-7 days');
```

---

## 🔧 Maintenance

### Clean Old Data
```sql
-- Delete old abandoned carts (>90 days)
DELETE FROM abandoned_carts 
WHERE created_at < datetime('now', '-90 days');

-- Archive old WhatsApp logs
DELETE FROM whatsapp_logs 
WHERE sent_at < datetime('now', '-180 days');
```

### Unsubscribe User
```sql
-- Mark as inactive
UPDATE newsletter 
SET is_active = 0 
WHERE email = 'user@example.com';
```

---

## 📱 Quick Actions

### Send WhatsApp to Customer
```javascript
// In browser console or admin panel
sendOrderWhatsApp('MNM1234567890', '9876543210');
```

### Track Newsletter Conversion
```sql
-- Subscribers who made orders
SELECT n.email, n.name, COUNT(o.id) as orders
FROM newsletter n
LEFT JOIN users u ON n.phone = u.phone
LEFT JOIN orders o ON u.phone = o.phone
GROUP BY n.email
HAVING orders > 0;
```

---

## 🎯 Optimization Tips

1. **Newsletter:**
   - Send weekly updates
   - Offer exclusive discounts
   - Share product tips

2. **Abandoned Carts:**
   - Send reminder after 24 hours
   - Offer 10% discount
   - Create urgency (limited stock)

3. **WhatsApp:**
   - Order confirmations
   - Shipping updates
   - Delivery notifications

4. **SEO:**
   - Update meta descriptions
   - Add blog content
   - Build backlinks

---

## 📞 Support

**Database:** wrangler d1 execute mnm-orders-db --remote  
**API:** https://mnm-orders-api.mistnmatter.workers.dev  
**Website:** https://mnm-website.pages.dev

**Admin Panel:** admin-fixed.html (local only)
