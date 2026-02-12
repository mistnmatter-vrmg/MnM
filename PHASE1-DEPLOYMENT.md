# 🚀 Mist & Matter - PHASE 1 Deployment Guide

## ✅ PHASE 1 COMPLETED: Backend Foundation

### What's New:
- ✅ JWT Authentication system
- ✅ User registration & login with password
- ✅ Admin role support
- ✅ Products table with full catalog
- ✅ Enhanced API structure
- ✅ Secure password hashing
- ✅ Token-based auth

---

## 📦 Deployment Steps

### Step 1: Update Database Schema

```bash
# Run enhanced schema
wrangler d1 execute mnm-orders-db --file=schema-enhanced.sql
```

### Step 2: Deploy Enhanced API

```bash
# Deploy new API
wrangler deploy --config api-wrangler.toml api-enhanced.js
```

### Step 3: Test API Endpoints

#### Register User:
```bash
curl -X POST https://mnm-orders-api.mistnmatter.workers.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "9999999999",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Login User:
```bash
curl -X POST https://mnm-orders-api.mistnmatter.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9999999999",
    "password": "password123"
  }'
```

#### Get Products:
```bash
curl https://mnm-orders-api.mistnmatter.workers.dev/api/products
```

---

## 🔐 Admin Setup

### Create Admin User:

```sql
-- Run in D1 console
UPDATE users SET role = 'admin' WHERE phone = '9834690921';
```

---

## 📝 API Endpoints

### Auth:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT token)

### Products:
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin only)

### Orders:
- `POST /api/orders` - Create order
- `GET /api/orders?phone=XXX` - Get user orders
- `PUT /api/orders/:id` - Update order status

### Users:
- `GET /api/users/:phone` - Get user data
- `POST /api/users/address` - Save address

### Cart:
- `GET /api/cart?phone=XXX` - Get cart
- `POST /api/cart` - Save cart

### Wishlist:
- `GET /api/wishlist?phone=XXX` - Get wishlist
- `POST /api/wishlist` - Toggle wishlist

### Reviews:
- `GET /api/reviews?product=XXX` - Get reviews
- `POST /api/reviews` - Add review

---

## 🔑 Using JWT Token

After login, use token in requests:

```bash
curl https://mnm-orders-api.mistnmatter.workers.dev/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ⚠️ Important Notes

1. **Change JWT Secret**: Update `JWT_SECRET` in `api-enhanced.js` before production
2. **Use bcrypt**: Current password hashing is basic - use bcrypt in production
3. **HTTPS Only**: Always use HTTPS in production
4. **Rate Limiting**: Add rate limiting for auth endpoints

---

## 🎯 Next Steps (PHASE 2)

- [ ] Razorpay integration
- [ ] COD order system
- [ ] Invoice generator
- [ ] Email notifications
- [ ] Inventory tracking

---

## 📊 Testing Checklist

- [ ] User registration works
- [ ] User login returns token
- [ ] Products API returns data
- [ ] Admin can create products
- [ ] Orders can be created
- [ ] Cart sync works
- [ ] Wishlist toggle works
- [ ] Reviews can be added

---

## 🐛 Troubleshooting

**Issue**: "Unauthorized" error
**Fix**: Check if token is valid and not expired

**Issue**: "User already exists"
**Fix**: Use different phone number or login instead

**Issue**: Database error
**Fix**: Run schema migration again

---

## 📞 Support

For issues, check:
1. Cloudflare Workers logs
2. D1 database console
3. API response errors
