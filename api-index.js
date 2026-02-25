// JWT Secret (use env variable in production)
const JWT_SECRET = 'your-secret-key-change-in-production';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Routes
      if (path === '/api/orders' && request.method === 'POST') {
        return await createOrder(request, env, corsHeaders);
      }
      
      if (path === '/api/orders' && request.method === 'GET') {
        return await getOrders(request, env, corsHeaders);
      }
      
      if (path.startsWith('/api/orders/') && request.method === 'PUT') {
        return await updateOrder(request, env, corsHeaders);
      }
      
      if (path === '/api/stock' && request.method === 'GET') {
        return await getStock(request, env, corsHeaders);
      }
      
      if (path === '/api/stock' && request.method === 'PUT') {
        return await updateStock(request, env, corsHeaders);
      }
      
      if (path === '/api/auth/register' && request.method === 'POST') {
        return await registerUser(request, env, corsHeaders);
      }
      
      if (path === '/api/auth/login' && request.method === 'POST') {
        return await loginUser(request, env, corsHeaders);
      }
      
      if (path === '/api/auth/reset-password' && request.method === 'POST') {
        return await resetPassword(request, env, corsHeaders);
      }
      
      if (path === '/api/users/profile' && request.method === 'PUT') {
        return await updateUserProfile(request, env, corsHeaders);
      }
      
      if (path === '/api/users/login' && request.method === 'POST') {
        return await userLogin(request, env, corsHeaders);
      }
      
      if (path === '/api/users/address' && request.method === 'POST') {
        return await saveUserAddress(request, env, corsHeaders);
      }
      
      if (path.startsWith('/api/users/') && request.method === 'GET') {
        return await getUserData(request, env, corsHeaders);
      }
      
      if (path === '/api/cart' && request.method === 'POST') {
        return await saveCart(request, env, corsHeaders);
      }
      
      if (path === '/api/cart' && request.method === 'GET') {
        return await getCart(request, env, corsHeaders);
      }
      
      if (path.startsWith('/api/users/address/') && request.method === 'DELETE') {
        return await deleteAddress(request, env, corsHeaders);
      }
      
      if (path === '/api/coupon/validate' && request.method === 'POST') {
        return await validateCoupon(request, env, corsHeaders);
      }
      
      if (path === '/api/wishlist') {
        return await handleWishlist(request, env);
      }
      
      if (path === '/api/reviews') {
        return await handleReviews(request, env);
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

// Create Order
async function createOrder(request, env, corsHeaders) {
  const data = await request.json();
  const orderId = 'MNM' + Date.now();
  
  // Insert order
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
  
  // Insert order items
  for (const item of data.items) {
    await env.DB.prepare(`
      INSERT INTO order_items (order_id, product_name, quantity, price)
      VALUES (?, ?, ?, ?)
    `).bind(orderId, item.name, item.qty, item.price).run();
  }
  
  // Insert delivery address
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

// Get Orders
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
  
  // Get items for each order
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

// Update Order
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
      
      // Reserve stock
      const { results: items } = await env.DB.prepare(
        'SELECT * FROM order_items WHERE order_id = ?'
      ).bind(orderId).all();
      
      for (const item of items) {
        await env.DB.prepare(`
          UPDATE stock 
          SET available = available - ?, reserved = reserved + ?
          WHERE product_name = ?
        `).bind(item.quantity, item.quantity, item.product_name).run();
      }
    }
    
    if (data.status === 'rejected') {
      updates.push('rejected_reason = ?', 'rejected_at = ?');
      bindings.push(data.reason || 'Manual rejection', new Date().toISOString());
      
      // Release stock if was verified
      const { results: orderData } = await env.DB.prepare(
        'SELECT status FROM orders WHERE id = ?'
      ).bind(orderId).all();
      
      if (orderData[0]?.status === 'verified') {
        const { results: items } = await env.DB.prepare(
          'SELECT * FROM order_items WHERE order_id = ?'
        ).bind(orderId).all();
        
        for (const item of items) {
          await env.DB.prepare(`
            UPDATE stock 
            SET available = available + ?, reserved = reserved - ?
            WHERE product_name = ?
          `).bind(item.quantity, item.quantity, item.product_name).run();
        }
      }
    }
  }
  
  query += updates.join(', ') + ' WHERE id = ?';
  bindings.push(orderId);
  
  await env.DB.prepare(query).bind(...bindings).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Get Stock
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

// Update Stock
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


// User Login/Register
async function userLogin(request, env, corsHeaders) {
  const data = await request.json();
  
  // Check if user exists
  const { results } = await env.DB.prepare(
    'SELECT * FROM users WHERE phone = ?'
  ).bind(data.phone).all();
  
  let user;
  if (results.length === 0) {
    // Create new user
    await env.DB.prepare(`
      INSERT INTO users (name, phone, email, last_login)
      VALUES (?, ?, ?, ?)
    `).bind(data.name, data.phone, data.email || null, new Date().toISOString()).run();
    
    const { results: newUser } = await env.DB.prepare(
      'SELECT * FROM users WHERE phone = ?'
    ).bind(data.phone).all();
    user = newUser[0];
  } else {
    // Update last login
    await env.DB.prepare(
      'UPDATE users SET last_login = ? WHERE phone = ?'
    ).bind(new Date().toISOString(), data.phone).run();
    user = results[0];
  }
  
  return new Response(JSON.stringify({ success: true, user }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Register User
async function registerUser(request, env, corsHeaders) {
  const data = await request.json();
  
  const { results } = await env.DB.prepare('SELECT * FROM users WHERE phone = ? OR email = ?').bind(data.phone, data.email).all();
  
  if (results.length > 0) {
    return new Response(JSON.stringify({ success: false, error: 'Phone or email already registered' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  await env.DB.prepare('INSERT INTO users (name, phone, email, dob, last_login) VALUES (?, ?, ?, ?, ?)').bind(
    data.name, data.phone, data.email, data.dob || null, new Date().toISOString()
  ).run();
  
  const { results: newUser } = await env.DB.prepare('SELECT * FROM users WHERE phone = ?').bind(data.phone).all();
  
  return new Response(JSON.stringify({ success: true, user: newUser[0], token: 'dummy-token' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Login User
async function loginUser(request, env, corsHeaders) {
  const data = await request.json();
  
  const { results } = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(data.email).all();
  
  if (results.length === 0) {
    return new Response(JSON.stringify({ success: false, error: 'User not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  await env.DB.prepare('UPDATE users SET last_login = ? WHERE email = ?').bind(
    new Date().toISOString(), data.email
  ).run();
  
  return new Response(JSON.stringify({ success: true, user: results[0], token: 'dummy-token' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Reset Password
async function resetPassword(request, env, corsHeaders) {
  const data = await request.json();
  
  const { results } = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(data.email).all();
  
  if (results.length === 0) {
    return new Response(JSON.stringify({ success: false, error: 'User not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Update User Profile
async function updateUserProfile(request, env, corsHeaders) {
  const data = await request.json();
  
  await env.DB.prepare('UPDATE users SET name = ?, email = ?, dob = ? WHERE phone = ?').bind(
    data.name, data.email, data.dob || null, data.phone
  ).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Save User Address
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

// Get User Data
async function getUserData(request, env, corsHeaders) {
  const url = new URL(request.url);
  const phone = url.pathname.split('/').pop();
  
  // Get user
  const { results: users } = await env.DB.prepare(
    'SELECT * FROM users WHERE phone = ?'
  ).bind(phone).all();
  
  if (users.length === 0) {
    return new Response(JSON.stringify({ success: false, error: 'User not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const user = users[0];
  
  // Get addresses
  const { results: addresses } = await env.DB.prepare(
    'SELECT * FROM user_addresses WHERE user_phone = ? ORDER BY is_default DESC, created_at DESC'
  ).bind(phone).all();
  
  // Get orders
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


// Save Cart
async function saveCart(request, env, corsHeaders) {
  const data = await request.json();
  
  // Delete existing cart for user
  await env.DB.prepare('DELETE FROM user_cart WHERE user_phone = ?').bind(data.userPhone).run();
  
  // Insert new cart items
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

// Get Cart
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
  
  // Convert to cart format
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


// Delete Address
async function deleteAddress(request, env, corsHeaders) {
  const url = new URL(request.url);
  const addressId = url.pathname.split('/').pop();
  
  await env.DB.prepare('DELETE FROM user_addresses WHERE id = ?').bind(addressId).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}


// Validate Coupon
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
  
  // Check validity
  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    return new Response(JSON.stringify({ success: false, error: 'Coupon expired' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Check usage limit
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return new Response(JSON.stringify({ success: false, error: 'Coupon usage limit reached' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Check minimum order value
  if (data.orderTotal < coupon.min_order_value) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Minimum order value ₹${coupon.min_order_value} required` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Calculate discount
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


// Wishlist endpoints
async function handleWishlist(request, env) {
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const phone = url.searchParams.get('phone');
    
    const result = await env.DB.prepare('SELECT * FROM wishlist WHERE user_phone = ? ORDER BY created_at DESC')
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
      await env.DB.prepare('INSERT INTO wishlist (user_phone, product_name, product_price, product_mrp, product_img) VALUES (?, ?, ?, ?, ?)')
        .bind(userPhone, productName, productPrice, productMrp, productImg).run();
      return new Response(JSON.stringify({ success: true, action: 'added' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
}

// Reviews endpoints
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
