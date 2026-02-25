// Enhanced Chatbot for Mist & Matter
(function() {
  'use strict';
  
  const chatbotHTML = `
    <div id="chatbot-container">
      <button id="chat-toggle">💬</button>
      <div id="chat-window" style="display:none;">
        <div id="chat-header">
          <strong>Mist & Matter Assistant</strong>
          <button id="chat-close">×</button>
        </div>
        <div id="chat-messages"></div>
        <div id="chat-quick-replies"></div>
        <div id="chat-input-area">
          <input type="text" id="chat-input" placeholder="Type message...">
          <button id="chat-send">Send</button>
        </div>
      </div>
    </div>
  `;
  
  window.addEventListener('DOMContentLoaded', function() {
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    
    const toggle = document.getElementById('chat-toggle');
    const closeBtn = document.getElementById('chat-close');
    const chatWindow = document.getElementById('chat-window');
    const sendBtn = document.getElementById('chat-send');
    const chatInput = document.getElementById('chat-input');
    
    toggle.onclick = () => {
      chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
      if (chatWindow.style.display === 'flex') {
        addMessage('bot', 'Hi! 👋 How can I help you today?');
        showQuickReplies(['Products', 'Shipping', 'Offers', 'Contact']);
      }
    };
    
    closeBtn.onclick = () => chatWindow.style.display = 'none';
    
    sendBtn.onclick = sendMsg;
    chatInput.onkeypress = (e) => { if (e.key === 'Enter') sendMsg(); };
    
    function sendMsg() {
      const text = chatInput.value.trim();
      if (!text) return;
      addMessage('user', text);
      chatInput.value = '';
      setTimeout(() => handleMessage(text.toLowerCase()), 300);
    }
    
    function addMessage(type, text) {
      const div = document.createElement('div');
      div.className = `chat-message ${type}-message`;
      div.innerHTML = `<div class="message-bubble">${text}</div>`;
      document.getElementById('chat-messages').appendChild(div);
      div.scrollIntoView();
    }
    
    function showQuickReplies(replies) {
      const container = document.getElementById('chat-quick-replies');
      container.innerHTML = replies.map(r => 
        `<button class="quick-reply" onclick="handleQuick('${r}')">${r}</button>`
      ).join('');
    }
    
    window.handleQuick = function(text) {
      addMessage('user', text);
      document.getElementById('chat-quick-replies').innerHTML = '';
      handleMessage(text.toLowerCase());
    };
    
    // Track order by ID
    async function trackOrder(orderId) {
      addMessage('bot', '🔍 Searching for order...');
      
      try {
        const response = await fetch(`https://mnm-orders-api.mistnmatter.workers.dev/api/orders?orderId=${orderId}`);
        const result = await response.json();
        
        if (result.success && result.orders && result.orders.length > 0) {
          const order = result.orders[0];
          const statusEmoji = order.status === 'verified' ? '✅' : order.status === 'rejected' ? '❌' : '⏳';
          const statusText = order.status === 'verified' ? 'Verified - Will be dispatched in 24 hours' : 
                            order.status === 'rejected' ? 'Cancelled' : 'Pending Verification';
          
          let msg = `${statusEmoji} Order #${order.id}\n\n`;
          msg += `💰 Amount: ₹${order.total}\n`;
          msg += `📦 Status: ${statusText}\n`;
          msg += `📅 Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}\n`;
          
          if (order.tracking_number) {
            msg += `\n🚚 Tracking: ${order.tracking_number}`;
            if (order.courier_name) msg += ` (${order.courier_name})`;
          }
          
          addMessage('bot', msg);
          showQuickReplies(['Products', 'Contact']);
        } else {
          addMessage('bot', '❌ Order not found. Please check your order ID or contact support.');
          showQuickReplies(['Contact', 'Products']);
        }
      } catch (error) {
        addMessage('bot', '❌ Error fetching order. Please try again or contact support.');
        showQuickReplies(['Contact', 'Products']);
      }
    }
    
    // Track orders by phone
    async function trackOrderByPhone(phone) {
      addMessage('bot', '🔍 Searching for your orders...');
      
      try {
        const response = await fetch(`https://mnm-orders-api.mistnmatter.workers.dev/api/orders?phone=${phone}`);
        const result = await response.json();
        
        if (result.success && result.orders && result.orders.length > 0) {
          let msg = `Found ${result.orders.length} order(s):\n\n`;
          
          result.orders.slice(0, 3).forEach(order => {
            const statusEmoji = order.status === 'verified' ? '✅' : order.status === 'rejected' ? '❌' : '⏳';
            msg += `${statusEmoji} #${order.id} - ₹${order.total} (${order.status})\n`;
          });
          
          if (result.orders.length > 3) {
            msg += `\n...and ${result.orders.length - 3} more orders`;
          }
          
          msg += `\n\nShare order ID for detailed tracking.`;
          addMessage('bot', msg);
          showQuickReplies(['Products', 'Contact']);
        } else {
          addMessage('bot', '❌ No orders found for this number. Please check or contact support.');
          showQuickReplies(['Contact', 'Products']);
        }
      } catch (error) {
        addMessage('bot', '❌ Error fetching orders. Please try again or contact support.');
        showQuickReplies(['Contact', 'Products']);
      }
    }
    
    function handleMessage(text) {
      if (text.includes('product') || text.includes('show') || text.includes('buy')) {
        addMessage('bot', '🌸 Royal Cotton\n30ml: ₹199 | 50ml: ₹399 | 100ml: ₹599\nClean cotton freshness\n\n🌸 White Tea & Woods\n30ml: ₹379 | 50ml: ₹449 | 100ml: ₹699\nSoft tea with woody warmth\n\n🌸 Soft Cotton Cloud\n30ml: ₹199 | 50ml: ₹399 | 100ml: ₹599\nGentle & comforting\n\n🌸 Ivory Linen\n30ml: ₹379 | 50ml: ₹449 | 100ml: ₹699\nElegant floral notes');
        showQuickReplies(['Shipping', 'How to use', 'Offers']);
      } else if (text.includes('ship') || text.includes('deliver')) {
        addMessage('bot', '📦 FREE shipping above ₹999\n⏱️ Delivery: 3-5 days\n🏙️ Metro cities: 2-3 days\n💰 COD available');
        showQuickReplies(['Track order', 'Products', 'Contact']);
      } else if (text.includes('track') || text.includes('order')) {
        addMessage('bot', 'Please share your order ID or phone number to track your order.');
        showQuickReplies(['Products', 'Contact']);
      } else if (text.match(/mnm\d+/i)) {
        // Extract order ID
        const orderId = text.match(/mnm\d+/i)[0].toUpperCase();
        trackOrder(orderId);
      } else if (text.match(/\d{10}/)) {
        // Phone number provided
        const phone = text.match(/\d{10}/)[0];
        trackOrderByPhone(phone);
      } else if (text.includes('use') || text.includes('how') || text.includes('apply')) {
        addMessage('bot', '📋 How to use:\n1️⃣ Hold 20-30cm from fabric\n2️⃣ Spray 2-3 pumps evenly\n3️⃣ Let air dry 2 minutes\n4️⃣ Enjoy fresh fragrance!\n\n⚠️ Not for direct skin use');
        showQuickReplies(['Is it safe?', 'Products']);
      } else if (text.includes('safe') || text.includes('stain')) {
        addMessage('bot', '✅ 100% fabric-safe\n✅ No stains or marks\n✅ Works on all fabrics\n✅ Dermatologically tested\n✅ Safe around kids & pets');
        showQuickReplies(['Ingredients', 'How to use', 'Products']);
      } else if (text.includes('ingredient') || text.includes('contain')) {
        addMessage('bot', '🧪 Ingredients:\n• Alcohol denat\n• Fragrance (parfum)\n• Aqua\n• Natural essential oils\n\n❌ No parabens\n❌ No sulfates\n✅ Vegan & cruelty-free');
        showQuickReplies(['Is it safe?', 'Products']);
      } else if (text.includes('return') || text.includes('refund') || text.includes('replace')) {
        addMessage('bot', '🔄 Return Policy:\n• No returns (hygiene)\n• FREE replacement if damaged\n• Contact within 48 hours\n• Unopened: 7-day return');
        showQuickReplies(['Contact', 'Products']);
      } else if (text.includes('discount') || text.includes('offer') || text.includes('coupon') || text.includes('sale')) {
        addMessage('bot', '🎉 Active Offers:\n\n✨ Buy 2 Get 1 FREE (Same size)\n   - Buy any 3x 30ml = 1 FREE\n   - Buy any 3x 50ml = 1 FREE\n   - Buy any 3x 100ml = 1 FREE\n\n✨ Up to 46% OFF on all products\n✨ FREE Shipping on orders ₹999+\n✨ COD Available\n\nMix & match any products of same size!');
        showQuickReplies(['Products', 'Shipping']);
      } else if (text.includes('cod') || text.includes('payment')) {
        addMessage('bot', '💳 Payment Options:\n✅ Cash on Delivery\n✅ UPI\n✅ Credit/Debit Cards\n✅ Net Banking\n\nNo extra charges!');
        showQuickReplies(['Products', 'Shipping']);
      } else if (text.includes('compare') || text.includes('difference')) {
        addMessage('bot', '📊 Product Comparison:\n\n💰 Budget (30ml: ₹199):\n• Royal Cotton - Daily wear\n• Soft Cotton Cloud - Gentle\n\n👑 Premium (30ml: ₹379):\n• White Tea & Woods - Evening\n• Ivory Linen - Special occasions\n\nAll available in 30ml, 50ml & 100ml!');
        showQuickReplies(['Royal Cotton', 'White Tea & Woods', 'Ivory Linen']);
      } else if (text.includes('contact') || text.includes('support') || text.includes('help')) {
        addMessage('bot', '📞 Contact Us:\n\n📱 +91 98346 90921\n📱 +91 90960 63159\n📧 mistnmatter@gmail.com\n🕒 Mon-Sat: 10 AM - 7 PM\n📸 Instagram: @mist_n_matter');
        showQuickReplies(['Products', 'Shipping']);
      } else {
        addMessage('bot', 'I can help you with:\n\n🛍️ Products & Pricing\n📦 Shipping & Delivery\n🔍 Order Tracking\n📋 Usage Instructions\n✅ Safety & Ingredients\n💰 Offers & Discounts\n📞 Contact Support\n\nWhat would you like to know?');
        showQuickReplies(['Products', 'Shipping', 'How to use', 'Contact']);
      }
    }
  });
})();
