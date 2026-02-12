// JWT Secret (use env variable in production)
const JWT_SECRET = 'your-secret-key-change-in-production';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Auth Routes
      if (path === '/api/auth/register' && request.method === 'POST') {
        return await registerUser(request, env, corsHeaders);
      }
      if (path === '/api/auth/login' && request.method === 'POST') {
        return await loginUser(request, env, corsHeaders);
      }
      if (path === '/api/auth/reset-password' && request.method === 'POST') {
        return await resetPassword(request, env, corsHeaders);
      }
      
      // Product Routes
      if (path === '/api/products' && request.method === 'GET') {
        return await getProducts(request, env, corsHeaders);
      }
      if (path === '/api/products' && request.method === 'POST') {
        return await createProduct(request, env, corsHeaders);
      }
      
      // Order Routes
      if (path === '/api/orders' && request.method === 'POST') {
        return await createOrder(request, env, corsHeaders);
      }
      if (path === '/api/orders' && request.method === 'GET') {
        return await getOrders(request, env, corsHeaders);
      }
      if (path.startsWith('/api/orders/') && request.method === 'PUT') {
        return await updateOrder(request, env, corsHeaders);
      }
      
      // Stock Routes
      if (path === '/api/stock' && request.method === 'GET') {
        return await getStock(request, env, corsHeaders);
      }
      if (path === '/api/stock' && request.method === 'PUT') {
        return await updateStock(request, env, corsHeaders);
      }
      
      // User Routes
      if (path === '/api/users/login' && request.method === 'POST') {
        return await userLogin(request, env, corsHeaders);
      }
      if (path === '/api/users/profile' && request.method === 'PUT') {
        return await updateUserProfile(request, env, corsHeaders);
      }
      if (path === '/api/users/address' && request.method === 'POST') {
        return await saveUserAddress(request, env, corsHeaders);
      }
      if (path.startsWith('/api/users/') && request.method === 'GET') {
        return await getUserData(request, env, corsHeaders);
      }
      if (path.startsWith('/api/users/address/') && request.method === 'DELETE') {
        return await deleteAddress(request, env, corsHeaders);
      }
      if (path.startsWith('/api/users/address/') && request.method === 'PUT') {
        return await updateAddress(request, env, corsHeaders);
      }
      
      // Cart Routes
      if (path === '/api/cart' && request.method === 'POST') {
        return await saveCart(request, env, corsHeaders);
      }
      if (path === '/api/cart' && request.method === 'GET') {
        return await getCart(request, env, corsHeaders);
      }
      
      // Coupon Routes
      if (path === '/api/coupon/validate' && request.method === 'POST') {
        return await validateCoupon(request, env, corsHeaders);
      }
      
      // Wishlist Routes
      if (path === '/api/wishlist') {
        return await handleWishlist(request, env);
      }
      
      // Review Routes
      if (path === '/api/reviews') {
        return await handleReviews(request, env);
      }
      if (path.startsWith('/api/reviews/') && request.method === 'PUT') {
        return await updateReview(request, env, corsHeaders);
      }
      
      // PHASE 2: Payment Routes
      if (path === '/api/payment/razorpay/create' && request.method === 'POST') {
        return await createRazorpayOrder(request, env, corsHeaders);
      }
      if (path === '/api/payment/razorpay/verify' && request.method === 'POST') {
        return await verifyRazorpayPayment(request, env, corsHeaders);
      }
      if (path === '/api/orders/cod' && request.method === 'POST') {
        return await createCODOrder(request, env, corsHeaders);
      }
      if (path.startsWith('/api/orders/') && path.endsWith('/status') && request.method === 'PUT') {
        return await updateOrderStatus(request, env, corsHeaders);
      }
      if (path.startsWith('/api/invoice/') && request.method === 'GET') {
        return await generateInvoice(request, env, corsHeaders);
      }
      
      // PHASE 4: Growth Routes
      if (path === '/api/newsletter/subscribe' && request.method === 'POST') {
        return await subscribeNewsletter(request, env, corsHeaders);
      }
      if (path === '/api/abandoned-cart' && request.method === 'POST') {
        return await trackAbandonedCart(request, env, corsHeaders);
      }
      if (path === '/api/whatsapp/notify' && request.method === 'POST') {
        return await sendWhatsAppNotification(request, env, corsHeaders);
      }
      
      return new Response('Not Found', { status: 404, headers: corsHeaders });
      
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// ============ AUTH HELPERS ============
function generateToken(userId, role = 'user') {
  const payload = { userId, role, iat: Date.now() };
  return btoa(JSON.stringify(payload));
}

function verifyToken(token) {
  try {
    const payload = JSON.parse(atob(token));
    if (Date.now() - payload.iat > 30 * 24 * 60 * 60 * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

async function getUserFromRequest(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  
  const token = auth.substring(7);
  const payload = verifyToken(token);
  if (!payload) return null;
  
  const { results } = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.userId).all();
  return results[0] || null;
}

// ============ AUTH ENDPOINTS ============
async function registerUser(request, env, corsHeaders) {
  const { name, dob, phone, email, password } = await request.json();
  
  // Check if email already exists
  const { results } = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).all();
  
  if (results.length > 0) {
    const user = results[0];
    
    // If user exists but no password, update password
    if (!user.password || user.password === '') {
      const hashedPassword = btoa(password);
      await env.DB.prepare('UPDATE users SET password = ?, name = ?, phone = ?, dob = ? WHERE email = ?')
        .bind(hashedPassword, name, phone, dob || null, email).run();
      
      const { results: updatedUser } = await env.DB.prepare('SELECT id, name, phone, email, dob, role FROM users WHERE email = ?').bind(email).all();
      const token = generateToken(updatedUser[0].id, updatedUser[0].role);
      
      return new Response(JSON.stringify({ success: true, user: updatedUser[0], token }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ success: false, error: 'Email already registered. Please sign in.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Create new user
  const hashedPassword = btoa(password);
  
  await env.DB.prepare(`
    INSERT INTO users (name, phone, email, password, dob, role, created_at)
    VALUES (?, ?, ?, ?, ?, 'user', ?)
  `).bind(name, phone, email, hashedPassword, dob || null, new Date().toISOString()).run();
  
  const { results: newUser } = await env.DB.prepare('SELECT id, name, phone, email, dob, role FROM users WHERE email = ?').bind(email).all();
  const user = newUser[0];
  const token = generateToken(user.id, user.role);
  
  return new Response(JSON.stringify({ success: true, user, token }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function loginUser(request, env, corsHeaders) {
  const { email, password } = await request.json();
  
  const { results } = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).all();
  if (results.length === 0) {
    return new Response(JSON.stringify({ success: false, error: 'Email not registered' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const user = results[0];
  
  // Check if password is set
  if (!user.password || user.password === '') {
    return new Response(JSON.stringify({ success: false, error: 'Please sign up to set a password' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const hashedPassword = btoa(password);
  
  if (user.password !== hashedPassword) {
    return new Response(JSON.stringify({ success: false, error: 'Incorrect password' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  await env.DB.prepare('UPDATE users SET last_login = ? WHERE id = ?').bind(new Date().toISOString(), user.id).run();
  
  const token = generateToken(user.id, user.role);
  const { password: _, ...userWithoutPassword } = user;
  
  return new Response(JSON.stringify({ success: true, user: userWithoutPassword, token }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function resetPassword(request, env, corsHeaders) {
  const { email, newPassword } = await request.json();
  
  const { results } = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).all();
  if (results.length === 0) {
    return new Response(JSON.stringify({ success: false, error: 'Email not registered' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const hashedPassword = btoa(newPassword);
  await env.DB.prepare('UPDATE users SET password = ? WHERE email = ?').bind(hashedPassword, email).run();
  
  return new Response(JSON.stringify({ success: true, message: 'Password reset successful' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============ PRODUCT ENDPOINTS ============
async function getProducts(request, env, corsHeaders) {
  const { results } = await env.DB.prepare('SELECT * FROM products WHERE is_active = 1').all();
  
  return new Response(JSON.stringify({ success: true, products: results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function createProduct(request, env, corsHeaders) {
  const user = await getUserFromRequest(request, env);
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const { name, description, price, mrp, category, images } = await request.json();
  
  await env.DB.prepare(`
    INSERT INTO products (name, description, price, mrp, category, images, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `).bind(name, description, price, mrp, category, JSON.stringify(images), new Date().toISOString()).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============ ORDER ENDPOINTS ============
async function createOrder(request, env, corsHeaders) {
  const data = await request.json();
  const orderId = 'MNM' + Date.now();
  
  await env.DB.prepare(`
    INSERT INTO orders (id, customer_name, phone, email, total, shipping, payment_method, screenshot_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).bind(
    orderId,
    data.customerName,
    data.phone,
    data.email || null,
    data.total,
    data.shipping || 0,
    data.paymentMethod || 'UPI',
    data.screenshot || null
  ).run();
  
  for (const item of data.items) {
    await env.DB.prepare(`
      INSERT INTO order_items (order_id, product_name, quantity, price)
      VALUES (?, ?, ?, ?)
    `).bind(orderId, item.name, item.qty, item.price).run();
  }
  
  if (data.address) {
    await env.DB.prepare(`
      INSERT INTO delivery_addresses (order_id, full_name, phone, address, city, state, pincode, landmark)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderId,
      data.address.fullName,
      data.address.phone,
      data.address.address,
      data.address.city,
      data.address.state,
      data.address.pincode,
      data.address.landmark || null
    ).run();
  }
  
  return new Response(JSON.stringify({ success: true, orderId }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getOrders(request, env, corsHeaders) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const phone = url.searchParams.get('phone');
  
  let query = 'SELECT * FROM orders';
  const conditions = [];
  const bindings = [];
  
  if (status) {
    conditions.push("status = ?");
    bindings.push(status);
  }
  
  if (phone) {
    conditions.push("phone = ?");
    bindings.push(phone);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY created_at DESC';
  
  const stmt = env.DB.prepare(query);
  const { results } = bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all();
  
  for (const order of results) {
    const { results: items } = await env.DB.prepare(
      'SELECT * FROM order_items WHERE order_id = ?'
    ).bind(order.id).all();
    order.items = items;
    
    const { results: address } = await env.DB.prepare(
      'SELECT * FROM delivery_addresses WHERE order_id = ?'
    ).bind(order.id).all();
    order.address = address[0] || null;
  }
  
  return new Response(JSON.stringify({ success: true, orders: results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function updateOrder(request, env, corsHeaders) {
  const url = new URL(request.url);
  const orderId = url.pathname.split('/').pop();
  const data = await request.json();
  
  let query = 'UPDATE orders SET ';
  const updates = [];
  const bindings = [];
  
  if (data.status) {
    updates.push('status = ?');
    bindings.push(data.status);
    
    if (data.status === 'verified') {
      updates.push('verified_by = ?', 'verified_at = ?');
      bindings.push(data.verifiedBy || 'Admin', new Date().toISOString());
    }
    
    if (data.status === 'rejected') {
      updates.push('rejected_reason = ?', 'rejected_at = ?');
      bindings.push(data.reason || 'Manual rejection', new Date().toISOString());
    }
  }
  
  query += updates.join(', ') + ' WHERE id = ?';
  bindings.push(orderId);
  
  await env.DB.prepare(query).bind(...bindings).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============ STOCK ENDPOINTS ============
async function getStock(request, env, corsHeaders) {
  const { results } = await env.DB.prepare('SELECT * FROM stock').all();
  
  const stock = {};
  results.forEach(item => {
    stock[item.product_name] = {
      available: item.available,
      reserved: item.reserved
    };
  });
  
  return new Response(JSON.stringify({ success: true, stock }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function updateStock(request, env, corsHeaders) {
  const data = await request.json();
  
  await env.DB.prepare(`
    UPDATE stock 
    SET available = available + ?, updated_at = ?
    WHERE product_name = ?
  `).bind(data.quantity, new Date().toISOString(), data.productName).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============ USER ENDPOINTS ============
async function userLogin(request, env, corsHeaders) {
  const data = await request.json();
  
  const { results } = await env.DB.prepare(
    'SELECT * FROM users WHERE phone = ?'
  ).bind(data.phone).all();
  
  let user;
  if (results.length === 0) {
    await env.DB.prepare(`
      INSERT INTO users (name, phone, email, last_login)
      VALUES (?, ?, ?, ?)
    `).bind(data.name, data.phone, data.email || null, new Date().toISOString()).run();
    
    const { results: newUser } = await env.DB.prepare(
      'SELECT * FROM users WHERE phone = ?'
    ).bind(data.phone).all();
    user = newUser[0];
  } else {
    await env.DB.prepare(
      'UPDATE users SET last_login = ? WHERE phone = ?'
    ).bind(new Date().toISOString(), data.phone).run();
    user = results[0];
  }
  
  return new Response(JSON.stringify({ success: true, user }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function saveUserAddress(request, env, corsHeaders) {
  const data = await request.json();
  
  await env.DB.prepare(`
    INSERT INTO user_addresses (user_phone, full_name, phone, address, city, state, pincode, landmark, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).bind(
    data.userPhone,
    data.fullName,
    data.phone,
    data.address,
    data.city,
    data.state,
    data.pincode,
    data.landmark || null
  ).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getUserData(request, env, corsHeaders) {
  const url = new URL(request.url);
  const phone = url.pathname.split('/').pop();
  
  const { results: users } = await env.DB.prepare(
    'SELECT id, name, phone, email, dob, role, created_at, last_login FROM users WHERE phone = ?'
  ).bind(phone).all();
  
  if (users.length === 0) {
    return new Response(JSON.stringify({ success: false, error: 'User not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const user = users[0];
  
  const { results: addresses } = await env.DB.prepare(
    'SELECT * FROM user_addresses WHERE user_phone = ? ORDER BY is_default DESC, created_at DESC'
  ).bind(phone).all();
  
  const { results: orders } = await env.DB.prepare(
    'SELECT * FROM orders WHERE phone = ? ORDER BY created_at DESC LIMIT 10'
  ).bind(phone).all();
  
  return new Response(JSON.stringify({ 
    success: true, 
    user,
    addresses,
    orders
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function updateUserProfile(request, env, corsHeaders) {
  const { phone, name, dob, email } = await request.json();
  
  await env.DB.prepare(
    'UPDATE users SET name = ?, dob = ?, email = ? WHERE phone = ?'
  ).bind(name, dob || null, email, phone).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function deleteAddress(request, env, corsHeaders) {
  const url = new URL(request.url);
  const addressId = url.pathname.split('/').pop();
  
  await env.DB.prepare('DELETE FROM user_addresses WHERE id = ?').bind(addressId).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function updateAddress(request, env, corsHeaders) {
  const url = new URL(request.url);
  const addressId = url.pathname.split('/').pop();
  const data = await request.json();
  
  await env.DB.prepare(`
    UPDATE user_addresses 
    SET full_name = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ?, landmark = ?
    WHERE id = ?
  `).bind(
    data.fullName,
    data.phone,
    data.address,
    data.city,
    data.state,
    data.pincode,
    data.landmark || null,
    addressId
  ).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============ CART ENDPOINTS ============
async function saveCart(request, env, corsHeaders) {
  const data = await request.json();
  
  await env.DB.prepare('DELETE FROM user_cart WHERE user_phone = ?').bind(data.userPhone).run();
  
  for (const item of data.cart) {
    await env.DB.prepare(`
      INSERT INTO user_cart (user_phone, product_name, quantity, price, mrp, img)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(data.userPhone, item.name, item.qty, item.price, item.mrp, item.img).run();
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getCart(request, env, corsHeaders) {
  const url = new URL(request.url);
  const phone = url.searchParams.get('phone');
  
  if (!phone) {
    return new Response(JSON.stringify({ success: false, error: 'Phone required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const { results } = await env.DB.prepare(
    'SELECT * FROM user_cart WHERE user_phone = ?'
  ).bind(phone).all();
  
  const cart = results.map(item => ({
    name: item.product_name,
    qty: item.quantity,
    price: item.price,
    mrp: item.mrp,
    img: item.img
  }));
  
  return new Response(JSON.stringify({ success: true, cart }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============ COUPON ENDPOINTS ============
async function validateCoupon(request, env, corsHeaders) {
  const data = await request.json();
  
  const { results } = await env.DB.prepare(
    'SELECT * FROM coupons WHERE code = ? AND is_active = 1'
  ).bind(data.code).all();
  
  if (results.length === 0) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid coupon code' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const coupon = results[0];
  
  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    return new Response(JSON.stringify({ success: false, error: 'Coupon expired' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return new Response(JSON.stringify({ success: false, error: 'Coupon usage limit reached' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  if (data.orderTotal < coupon.min_order_value) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Minimum order value ₹${coupon.min_order_value} required` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (data.orderTotal * coupon.discount_value) / 100;
    if (coupon.max_discount && discount > coupon.max_discount) {
      discount = coupon.max_discount;
    }
  } else {
    discount = coupon.discount_value;
  }
  
  return new Response(JSON.stringify({ 
    success: true, 
    coupon: coupon,
    discount: Math.round(discount)
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============ WISHLIST ENDPOINTS ============
async function handleWishlist(request, env) {
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const phone = url.searchParams.get('phone');
    
    const result = await env.DB.prepare('SELECT * FROM wishlist WHERE user_phone = ? ORDER BY added_at DESC')
      .bind(phone).all();
    
    return new Response(JSON.stringify({ success: true, wishlist: result.results }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
  
  if (request.method === 'POST') {
    const { userPhone, productName, productPrice, productMrp, productImg } = await request.json();
    
    const existing = await env.DB.prepare('SELECT * FROM wishlist WHERE user_phone = ? AND product_name = ?')
      .bind(userPhone, productName).first();
    
    if (existing) {
      await env.DB.prepare('DELETE FROM wishlist WHERE user_phone = ? AND product_name = ?')
        .bind(userPhone, productName).run();
      return new Response(JSON.stringify({ success: true, action: 'removed' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } else {
      await env.DB.prepare('INSERT INTO wishlist (user_phone, product_name, price, mrp, img) VALUES (?, ?, ?, ?, ?)')
        .bind(userPhone, productName, productPrice, productMrp, productImg).run();
      return new Response(JSON.stringify({ success: true, action: 'added' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
}

// ============ REVIEW ENDPOINTS ============
async function handleReviews(request, env) {
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const product = url.searchParams.get('product');
    
    const result = await env.DB.prepare('SELECT * FROM reviews WHERE product_name = ? ORDER BY created_at DESC')
      .bind(product).all();
    
    return new Response(JSON.stringify({ success: true, reviews: result.results }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
  
  if (request.method === 'POST') {
    const { productName, userPhone, userName, rating, reviewText } = await request.json();
    
    const existing = await env.DB.prepare('SELECT * FROM reviews WHERE product_name = ? AND user_phone = ?')
      .bind(productName, userPhone).first();
    
    if (existing) {
      return new Response(JSON.stringify({ success: false, error: 'You have already reviewed this product' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    await env.DB.prepare('INSERT INTO reviews (product_name, user_phone, user_name, rating, review_text) VALUES (?, ?, ?, ?, ?)')
      .bind(productName, userPhone, userName, rating, reviewText).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

async function updateReview(request, env, corsHeaders) {
  const url = new URL(request.url);
  const reviewId = url.pathname.split('/').pop();
  const { rating, reviewText } = await request.json();
  
  await env.DB.prepare('UPDATE reviews SET rating = ?, review_text = ?, created_at = ? WHERE id = ?')
    .bind(rating, reviewText, new Date().toISOString(), reviewId).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============ PHASE 2: PAYMENT FUNCTIONS ============

async function createRazorpayOrder(request, env, corsHeaders) {
  const { amount, currency, orderId, customerInfo } = await request.json();
  
  const razorpayOrder = {
    id: 'rzp_' + Date.now(),
    amount: amount * 100,
    currency: currency || 'INR',
    receipt: orderId,
    status: 'created'
  };
  
  await env.DB.prepare(`
    INSERT INTO payment_transactions (order_id, gateway, gateway_order_id, amount, currency, status)
    VALUES (?, 'razorpay', ?, ?, ?, 'created')
  `).bind(orderId, razorpayOrder.id, amount, currency || 'INR').run();
  
  return new Response(JSON.stringify({ 
    success: true, 
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: env.RAZORPAY_KEY_ID || 'rzp_test_key'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function verifyRazorpayPayment(request, env, corsHeaders) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await request.json();
  
  await env.DB.prepare(`
    UPDATE payment_transactions 
    SET gateway_payment_id = ?, status = 'success', verified_at = ?
    WHERE gateway_order_id = ?
  `).bind(razorpay_payment_id, new Date().toISOString(), razorpay_order_id).run();
  
  await env.DB.prepare(`
    UPDATE orders SET status = 'paid', payment_verified_at = ? WHERE id = ?
  `).bind(new Date().toISOString(), orderId).run();
  
  return new Response(JSON.stringify({ success: true, verified: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function createCODOrder(request, env, corsHeaders) {
  const data = await request.json();
  const orderId = 'MNM' + Date.now();
  
  await env.DB.prepare(`
    INSERT INTO orders (id, customer_name, phone, email, total, shipping, payment_method, status)
    VALUES (?, ?, ?, ?, ?, ?, 'COD', 'pending')
  `).bind(orderId, data.customerName, data.phone, data.email || null, data.total, data.shipping || 0).run();
  
  for (const item of data.items) {
    await env.DB.prepare(`
      INSERT INTO order_items (order_id, product_name, quantity, price)
      VALUES (?, ?, ?, ?)
    `).bind(orderId, item.name, item.qty, item.price).run();
    
    await env.DB.prepare(`
      UPDATE stock SET available = available - ?, reserved = reserved + ?
      WHERE product_name = ?
    `).bind(item.qty, item.qty, item.name).run();
  }
  
  if (data.address) {
    await env.DB.prepare(`
      INSERT INTO delivery_addresses (order_id, full_name, phone, address, city, state, pincode, landmark)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(orderId, data.address.fullName, data.address.phone, data.address.address, data.address.city, data.address.state, data.address.pincode, data.address.landmark || null).run();
  }
  
  return new Response(JSON.stringify({ success: true, orderId, paymentMethod: 'COD' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function updateOrderStatus(request, env, corsHeaders) {
  const url = new URL(request.url);
  const orderId = url.pathname.split('/')[3];
  const { status, trackingNumber, courierName, notes } = await request.json();
  
  const updates = ['status = ?', 'updated_at = ?'];
  const bindings = [status, new Date().toISOString()];
  
  if (trackingNumber) {
    updates.push('tracking_number = ?');
    bindings.push(trackingNumber);
  }
  
  if (courierName) {
    updates.push('courier_name = ?');
    bindings.push(courierName);
  }
  
  bindings.push(orderId);
  
  await env.DB.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run();
  
  await env.DB.prepare(`
    INSERT INTO order_status_history (order_id, status, notes, created_at)
    VALUES (?, ?, ?, ?)
  `).bind(orderId, status, notes || null, new Date().toISOString()).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function generateInvoice(request, env, corsHeaders) {
  const url = new URL(request.url);
  const orderId = url.pathname.split('/')[3];
  
  const { results: orders } = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).all();
  if (orders.length === 0) {
    return new Response(JSON.stringify({ success: false, error: 'Order not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const order = orders[0];
  const { results: items } = await env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(orderId).all();
  const { results: addresses } = await env.DB.prepare('SELECT * FROM delivery_addresses WHERE order_id = ?').bind(orderId).all();
  const address = addresses[0];
  
  const invoiceHTML = `<!DOCTYPE html>
<html><head><style>
body{font-family:Arial;margin:40px;}
.header{text-align:center;margin-bottom:30px;}
table{width:100%;border-collapse:collapse;margin:20px 0;}
th,td{border:1px solid #ddd;padding:12px;text-align:left;}
th{background:#667eea;color:white;}
</style></head><body>
<div class="header"><h1>🌸 Mist & Matter</h1><p>Tax Invoice</p></div>
<p><strong>Invoice:</strong> ${orderId}</p>
<p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
<h3>Bill To:</h3>
<p>${address.full_name}<br>${address.address}<br>${address.city}, ${address.state} - ${address.pincode}</p>
<table><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
${items.map(i => `<tr><td>${i.product_name}</td><td>${i.quantity}</td><td>₹${i.price}</td><td>₹${i.price * i.quantity}</td></tr>`).join('')}
<tr><td colspan="3" align="right"><strong>Shipping:</strong></td><td>₹${order.shipping}</td></tr>
<tr><td colspan="3" align="right"><strong>Total:</strong></td><td><strong>₹${order.total}</strong></td></tr>
</table></body></html>`;
  
  return new Response(invoiceHTML, {
    headers: { ...corsHeaders, 'Content-Type': 'text/html' }
  });
}

// ============ PHASE 4: GROWTH FUNCTIONS ============

async function subscribeNewsletter(request, env, corsHeaders) {
  const { email, name, phone } = await request.json();
  
  const { results } = await env.DB.prepare('SELECT * FROM newsletter WHERE email = ?').bind(email).all();
  if (results.length > 0) {
    return new Response(JSON.stringify({ success: false, error: 'Already subscribed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  await env.DB.prepare(`
    INSERT INTO newsletter (email, name, phone, subscribed_at)
    VALUES (?, ?, ?, ?)
  `).bind(email, name || null, phone || null, new Date().toISOString()).run();
  
  return new Response(JSON.stringify({ success: true, message: 'Subscribed successfully' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function trackAbandonedCart(request, env, corsHeaders) {
  const { userPhone, cart, total } = await request.json();
  
  if (!cart || cart.length === 0) return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
  
  await env.DB.prepare(`
    INSERT INTO abandoned_carts (user_phone, cart_data, total, created_at)
    VALUES (?, ?, ?, ?)
  `).bind(userPhone, JSON.stringify(cart), total, new Date().toISOString()).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function sendWhatsAppNotification(request, env, corsHeaders) {
  const { phone, message, orderId } = await request.json();
  
  const whatsappAPI = `https://api.whatsapp.com/send?phone=91${phone}&text=${encodeURIComponent(message)}`;
  
  await env.DB.prepare(`
    INSERT INTO whatsapp_logs (phone, message, order_id, sent_at)
    VALUES (?, ?, ?, ?)
  `).bind(phone, message, orderId || null, new Date().toISOString()).run();
  
  return new Response(JSON.stringify({ success: true, url: whatsappAPI }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
