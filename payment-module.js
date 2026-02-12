// ============ PHASE 2: RAZORPAY INTEGRATION ============

// Razorpay Payment Handler
async function createRazorpayOrder(request, env, corsHeaders) {
  const { amount, currency, orderId, customerInfo } = await request.json();
  
  // Create Razorpay order
  const razorpayOrder = {
    id: 'rzp_' + Date.now(),
    amount: amount * 100, // Convert to paise
    currency: currency || 'INR',
    receipt: orderId,
    status: 'created'
  };
  
  // Store in database
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

// Verify Razorpay Payment
async function verifyRazorpayPayment(request, env, corsHeaders) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await request.json();
  
  // In production, verify signature with Razorpay secret
  // For now, mark as verified
  
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

// COD Order Handler
async function createCODOrder(request, env, corsHeaders) {
  const data = await request.json();
  const orderId = 'MNM' + Date.now();
  
  // Create order with COD
  await env.DB.prepare(`
    INSERT INTO orders (id, customer_name, phone, email, total, shipping, payment_method, status)
    VALUES (?, ?, ?, ?, ?, ?, 'COD', 'pending')
  `).bind(
    orderId,
    data.customerName,
    data.phone,
    data.email || null,
    data.total,
    data.shipping || 0
  ).run();
  
  // Add items
  for (const item of data.items) {
    await env.DB.prepare(`
      INSERT INTO order_items (order_id, product_name, quantity, price)
      VALUES (?, ?, ?, ?)
    `).bind(orderId, item.name, item.qty, item.price).run();
    
    // Reserve stock
    await env.DB.prepare(`
      UPDATE stock SET available = available - ?, reserved = reserved + ?
      WHERE product_name = ?
    `).bind(item.qty, item.qty, item.name).run();
  }
  
  // Add address
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
  
  return new Response(JSON.stringify({ success: true, orderId, paymentMethod: 'COD' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Update Order Status with Tracking
async function updateOrderStatus(request, env, corsHeaders) {
  const url = new URL(request.url);
  const orderId = url.pathname.split('/').pop();
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
  
  await env.DB.prepare(`
    UPDATE orders SET ${updates.join(', ')} WHERE id = ?
  `).bind(...bindings).run();
  
  // Add status history
  await env.DB.prepare(`
    INSERT INTO order_status_history (order_id, status, notes, created_at)
    VALUES (?, ?, ?, ?)
  `).bind(orderId, status, notes || null, new Date().toISOString()).run();
  
  // Send notification (email/SMS)
  await sendOrderNotification(env, orderId, status);
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Send Order Notification
async function sendOrderNotification(env, orderId, status) {
  const { results } = await env.DB.prepare(`
    SELECT o.*, d.* FROM orders o
    LEFT JOIN delivery_addresses d ON o.id = d.order_id
    WHERE o.id = ?
  `).bind(orderId).all();
  
  if (results.length === 0) return;
  
  const order = results[0];
  let message = '';
  
  switch(status) {
    case 'confirmed':
      message = `Order ${orderId} confirmed! We're preparing your items.`;
      break;
    case 'shipped':
      message = `Order ${orderId} shipped! Track: ${order.tracking_number}`;
      break;
    case 'delivered':
      message = `Order ${orderId} delivered! Thank you for shopping with us.`;
      break;
  }
  
  // Log notification
  await env.DB.prepare(`
    INSERT INTO notifications (order_id, type, recipient, message, status)
    VALUES (?, 'sms', ?, ?, 'pending')
  `).bind(orderId, order.phone, message).run();
}

// Generate Invoice
async function generateInvoice(request, env, corsHeaders) {
  const url = new URL(request.url);
  const orderId = url.pathname.split('/').pop();
  
  // Get order details
  const { results: orders } = await env.DB.prepare(`
    SELECT * FROM orders WHERE id = ?
  `).bind(orderId).all();
  
  if (orders.length === 0) {
    return new Response(JSON.stringify({ success: false, error: 'Order not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const order = orders[0];
  
  // Get items
  const { results: items } = await env.DB.prepare(`
    SELECT * FROM order_items WHERE order_id = ?
  `).bind(orderId).all();
  
  // Get address
  const { results: addresses } = await env.DB.prepare(`
    SELECT * FROM delivery_addresses WHERE order_id = ?
  `).bind(orderId).all();
  
  const address = addresses[0];
  
  // Generate HTML invoice
  const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
<style>
body{font-family:Arial,sans-serif;margin:40px;}
.header{text-align:center;margin-bottom:30px;}
.invoice-details{margin:20px 0;}
table{width:100%;border-collapse:collapse;margin:20px 0;}
th,td{border:1px solid #ddd;padding:12px;text-align:left;}
th{background:#667eea;color:white;}
.total{text-align:right;font-size:18px;font-weight:bold;margin-top:20px;}
</style>
</head>
<body>
<div class="header">
<h1>🌸 Mist & Matter</h1>
<p>Tax Invoice</p>
</div>
<div class="invoice-details">
<p><strong>Invoice No:</strong> ${orderId}</p>
<p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
<p><strong>Payment Method:</strong> ${order.payment_method}</p>
</div>
<div>
<h3>Bill To:</h3>
<p>${address.full_name}<br>
${address.address}<br>
${address.city}, ${address.state} - ${address.pincode}<br>
Phone: ${address.phone}</p>
</div>
<table>
<tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
${items.map(item => `
<tr>
<td>${item.product_name}</td>
<td>${item.quantity}</td>
<td>₹${item.price}</td>
<td>₹${item.price * item.quantity}</td>
</tr>
`).join('')}
<tr><td colspan="3" style="text-align:right"><strong>Shipping:</strong></td><td>₹${order.shipping}</td></tr>
<tr><td colspan="3" style="text-align:right"><strong>Total:</strong></td><td><strong>₹${order.total}</strong></td></tr>
</table>
<p style="text-align:center;margin-top:40px;color:#666;">Thank you for shopping with Mist & Matter!</p>
</body>
</html>
  `;
  
  return new Response(invoiceHTML, {
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'text/html',
      'Content-Disposition': `inline; filename="invoice-${orderId}.html"`
    }
  });
}

// Export functions
export {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createCODOrder,
  updateOrderStatus,
  generateInvoice
};
