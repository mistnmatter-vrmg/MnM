// Custom AI Chatbot for Mist & Matter
const chatbotData = {
  products: [
    { 
      name: "Royal Cotton", 
      price: 599, 
      mrp: 999,
      desc: "Clean cotton freshness with subtle, non-overpowering scent",
      details: "Perfect for daily wear, bedsheets, and towels. Lasts 6-8 hours.",
      bestFor: "Office wear, casual clothes, bed linens"
    },
    { 
      name: "White Tea & Woods", 
      price: 699, 
      mrp: 1299,
      desc: "Soft white tea with light woody warmth",
      details: "Premium blend with calming tea notes and warm wood finish. Lasts 8-10 hours.",
      bestFor: "Evening wear, curtains, premium fabrics"
    },
    { 
      name: "Soft Cotton Cloud", 
      price: 599, 
      mrp: 999,
      desc: "Smooth comforting finish with soft cotton freshness",
      details: "Ultra-gentle formula perfect for sensitive fabrics. Lasts 6-8 hours.",
      bestFor: "Baby clothes, delicate fabrics, everyday comfort"
    },
    { 
      name: "Ivory Linen", 
      price: 699, 
      mrp: 1299,
      desc: "Clean linen opening with soft airy florals",
      details: "Elegant floral notes with fresh linen base. Lasts 8-10 hours.",
      bestFor: "Special occasions, formal wear, luxury linens"
    }
  ],
  faqs: {
    shipping: {
      short: "Free shipping on orders above ₹999. Delivery in 3-5 business days.",
      detailed: "We offer FREE shipping on all orders above ₹999 across India. Orders below ₹999 have a flat ₹50 shipping charge. Delivery typically takes 3-5 business days. Metro cities: 2-3 days. Tier 2/3 cities: 4-5 days. We use trusted courier partners like Delhivery and BlueDart."
    },
    return: {
      short: "No returns due to hygiene. Replacement only if damaged in transit.",
      detailed: "Due to hygiene reasons, we don't accept returns on opened products. However, if your product arrives damaged or defective, we'll replace it immediately at no cost. Just contact us within 48 hours of delivery with photos. Unopened products can be returned within 7 days."
    },
    cod: {
      short: "Yes, Cash on Delivery is available.",
      detailed: "COD is available on all orders. No extra charges for COD. You can pay in cash to our delivery partner when your order arrives. We also accept UPI, cards, and net banking for online payment."
    },
    safe: {
      short: "All products are fabric-safe and non-staining.",
      detailed: "Our fabric perfumes are specially formulated to be 100% fabric-safe. They don't leave stains or marks on any fabric type - cotton, silk, wool, or synthetics. We use alcohol-based formulas that evaporate quickly without residue. Dermatologically tested and safe for use around children and pets."
    },
    usage: {
      short: "Spray lightly from 20-30cm on fabric, let air dry for 2 minutes.",
      detailed: "How to use: 1) Hold bottle 20-30cm away from fabric. 2) Spray 2-3 pumps evenly. 3) Let air dry for 2 minutes before wearing. 4) Avoid spraying on wet fabric. 5) Test on small area first for delicate fabrics. 6) Store in cool, dry place away from sunlight. One bottle lasts 2-3 months with daily use."
    },
    ingredients: "Our perfumes contain: Alcohol denat, Fragrance (parfum), Aqua, and natural essential oils. No parabens, no sulfates, no harsh chemicals. Vegan and cruelty-free.",
    storage: "Store in a cool, dry place away from direct sunlight. Keep bottle upright. Shelf life: 24 months from manufacturing date. Once opened, use within 12 months for best results.",
    difference: "Unlike regular perfumes, our fabric perfumes are designed specifically for clothes and linens - not skin. They're lighter, longer-lasting on fabric, and won't cause skin irritation or fabric damage."
  },
  issues: {
    "not lasting": "If fragrance isn't lasting long: 1) Spray on clean, dry fabric. 2) Use 3-4 pumps instead of 1-2. 3) Spray on thicker fabrics like cotton for better retention. 4) Store bottle properly to maintain quality. 5) Avoid spraying in humid conditions.",
    "too strong": "If scent is too strong: 1) Use only 1-2 pumps. 2) Spray from 40cm distance. 3) Let fabric air out for 5 minutes. 4) Try our lighter variants like Soft Cotton Cloud.",
    "stain": "Our products don't stain. If you see marks: 1) You might be spraying too close. 2) Fabric might be wet. 3) Test on hidden area first. 4) Contact us with photos for replacement if product is defective.",
    "allergic": "If you have allergies: 1) All our products are hypoallergenic. 2) Avoid direct skin contact. 3) Use in well-ventilated area. 4) Try Soft Cotton Cloud - our gentlest formula. 5) Consult doctor if reaction persists."
  },
  contact: {
    phone: "+91 98346 90921",
    phone2: "+91 90960 63159",
    email: "mistnmatter@gmail.com",
    hours: "Mon-Sat: 10 AM - 7 PM IST",
    instagram: "@mist_n_matter"
  }
};

let chatHistory = [];
let isChatOpen = false;

function initChatbot() {
  const chatHTML = `
    <div id="chatbot-container">
      <button id="chat-toggle" onclick="toggleChat()">
        <span id="chat-icon">💬</span>
      </button>
      
      <div id="chat-window" style="display:none;">
        <div id="chat-header">
          <div>
            <strong>Mist & Matter Assistant</strong>
            <span style="font-size:11px;color:#aaa;">Always here to help</span>
          </div>
          <button onclick="toggleChat()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;">×</button>
        </div>
        
        <div id="chat-messages"></div>
        
        <div id="chat-quick-replies"></div>
        
        <div id="chat-input-area">
          <input type="text" id="chat-input" placeholder="Type your message..." onkeypress="if(event.key==='Enter') sendMessage()">
          <button onclick="sendMessage()">Send</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', chatHTML);
  showWelcomeMessage();
}

function toggleChat() {
  isChatOpen = !isChatOpen;
  const chatWindow = document.getElementById('chat-window');
  const chatIcon = document.getElementById('chat-icon');
  
  if (isChatOpen) {
    chatWindow.style.display = 'flex';
    chatIcon.textContent = '×';
  } else {
    chatWindow.style.display = 'none';
    chatIcon.textContent = '💬';
  }
}

function showWelcomeMessage() {
  setTimeout(() => {
    addBotMessage("Hi! 👋 I'm your Mist & Matter assistant. How can I help you today?");
    showQuickReplies([
      "Show products",
      "Shipping info",
      "How to use",
      "Track order"
    ]);
  }, 500);
}

function addBotMessage(text) {
  const messagesDiv = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-message bot-message';
  msgDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
  messagesDiv.appendChild(msgDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addUserMessage(text) {
  const messagesDiv = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-message user-message';
  msgDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
  messagesDiv.appendChild(msgDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showQuickReplies(replies) {
  const quickDiv = document.getElementById('chat-quick-replies');
  quickDiv.innerHTML = replies.map(r => 
    `<button class="quick-reply" onclick="handleQuickReply('${r}')">${r}</button>`
  ).join('');
}

function handleQuickReply(reply) {
  addUserMessage(reply);
  document.getElementById('chat-quick-replies').innerHTML = '';
  processMessage(reply.toLowerCase());
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  
  if (!text) return;
  
  addUserMessage(text);
  input.value = '';
  
  setTimeout(() => processMessage(text.toLowerCase()), 500);
}

function processMessage(text) {
  // Product recommendations
  if (text.includes('product') || text.includes('show') || text.includes('buy')) {
    let response = "Here are our premium fabric perfumes:\n\n";
    chatbotData.products.forEach(p => {
      response += `🌸 ${p.name} - ₹${p.price} (MRP ₹${p.mrp})\n${p.desc}\nBest for: ${p.bestFor}\n\n`;
    });
    response += "Which one interests you?";
    addBotMessage(response);
    showQuickReplies(chatbotData.products.map(p => p.name));
    return;
  }
  
  // Specific product inquiry
  chatbotData.products.forEach(p => {
    if (text.includes(p.name.toLowerCase())) {
      addBotMessage(`${p.name} - ₹${p.price}\n\n${p.desc}\n\n${p.details}\n\nPerfect for: ${p.bestFor}`);
      showQuickReplies(["Add to cart", "Compare products", "More info"]);
      return;
    }
  });
  
  // Shipping
  if (text.includes('ship') || text.includes('deliver')) {
    const detailed = text.includes('detail') || text.includes('more') || text.includes('tell me');
    addBotMessage(detailed ? chatbotData.faqs.shipping.detailed : chatbotData.faqs.shipping.short);
    showQuickReplies(["Track order", "Return policy", "Show products"]);
    return;
  }
  
  // Return policy
  if (text.includes('return') || text.includes('refund') || text.includes('replace')) {
    const detailed = text.includes('detail') || text.includes('more') || text.includes('policy');
    addBotMessage(detailed ? chatbotData.faqs.return.detailed : chatbotData.faqs.return.short);
    showQuickReplies(["Contact support", "Show products"]);
    return;
  }
  
  // COD
  if (text.includes('cod') || text.includes('cash') || text.includes('payment')) {
    const detailed = text.includes('detail') || text.includes('more') || text.includes('option');
    addBotMessage(detailed ? chatbotData.faqs.cod.detailed : chatbotData.faqs.cod.short);
    showQuickReplies(["Show products", "Shipping info"]);
    return;
  }
  
  // Usage instructions
  if (text.includes('use') || text.includes('apply') || text.includes('spray') || text.includes('how')) {
    const detailed = text.includes('detail') || text.includes('step') || text.includes('guide');
    addBotMessage(detailed ? chatbotData.faqs.usage.detailed : chatbotData.faqs.usage.short);
    showQuickReplies(["Is it safe?", "Show products", "Storage tips"]);
    return;
  }
  
  // Safety
  if (text.includes('safe') || text.includes('stain') || text.includes('damage')) {
    const detailed = text.includes('detail') || text.includes('more') || text.includes('why');
    addBotMessage(detailed ? chatbotData.faqs.safe.detailed : chatbotData.faqs.safe.short);
    showQuickReplies(["Ingredients", "How to use", "Show products"]);
    return;
  }
  
  // Ingredients
  if (text.includes('ingredient') || text.includes('chemical') || text.includes('contain')) {
    addBotMessage(chatbotData.faqs.ingredients);
    showQuickReplies(["Is it safe?", "Show products"]);
    return;
  }
  
  // Storage
  if (text.includes('storage') || text.includes('store') || text.includes('keep') || text.includes('shelf life')) {
    addBotMessage(chatbotData.faqs.storage);
    showQuickReplies(["How to use", "Show products"]);
    return;
  }
  
  // Difference from regular perfume
  if (text.includes('difference') || text.includes('regular perfume') || text.includes('body perfume')) {
    addBotMessage(chatbotData.faqs.difference);
    showQuickReplies(["Show products", "How to use"]);
    return;
  }
  
  // Issues - Not lasting
  if (text.includes('not last') || text.includes('fade') || text.includes('weak')) {
    addBotMessage(chatbotData.issues["not lasting"]);
    showQuickReplies(["Contact support", "Show products"]);
    return;
  }
  
  // Issues - Too strong
  if (text.includes('too strong') || text.includes('overpowering') || text.includes('heavy')) {
    addBotMessage(chatbotData.issues["too strong"]);
    showQuickReplies(["Show products", "How to use"]);
    return;
  }
  
  // Issues - Stain
  if (text.includes('stain') || text.includes('mark') || text.includes('spot')) {
    addBotMessage(chatbotData.issues["stain"]);
    showQuickReplies(["Contact support", "Return policy"]);
    return;
  }
  
  // Issues - Allergy
  if (text.includes('allerg') || text.includes('irritat') || text.includes('sensitive')) {
    addBotMessage(chatbotData.issues["allergic"]);
    showQuickReplies(["Ingredients", "Contact support"]);
    return;
  }
  
  // Compare products
  if (text.includes('compare') || text.includes('difference between') || text.includes('which one')) {
    addBotMessage("Product Comparison:\n\n₹599 Range (Budget-friendly):\n• Royal Cotton - Daily wear, subtle\n• Soft Cotton Cloud - Gentle, delicate\n\n₹699 Range (Premium):\n• White Tea & Woods - Evening, warm\n• Ivory Linen - Special occasions, elegant\n\nAll last 6-10 hours and are fabric-safe!");
    showQuickReplies(["Royal Cotton", "White Tea & Woods", "Soft Cotton Cloud", "Ivory Linen"]);
    return;
  }
  
  // Discount/Offer
  if (text.includes('discount') || text.includes('offer') || text.includes('coupon') || text.includes('sale')) {
    addBotMessage("Current Offers:\n\n✨ Flat 40% OFF on all products\n✨ FREE Shipping above ₹999\n✨ Buy 2 Get 1 FREE (limited time)\n\nNo coupon code needed - discount auto-applied!");
    showQuickReplies(["Show products", "Buy now"]);
    return;
  }
  
  // Track order
  if (text.includes('track') || text.includes('order status') || text.includes('where is my order')) {
    addBotMessage("Please enter your order ID (e.g., MNM12345) or email address:");
    return;
  }
  
  // Order ID pattern
  if (text.match(/mnm\d+/i)) {
    addBotMessage(`Checking order ${text.toUpperCase()}...\n\n✅ Order Confirmed\n🚚 In Transit\n📦 Expected delivery: 2-3 days\n\nTracking link will be sent to your email/SMS.");
    showQuickReplies(["Contact support", "Show products"]);
    return;
  }
  
  // Contact
  if (text.includes('contact') || text.includes('support') || text.includes('call') || text.includes('email')) {
    addBotMessage(`Contact Us:\n\n📞 ${chatbotData.contact.phone}\n📞 ${chatbotData.contact.phone2}\n📧 ${chatbotData.contact.email}\n🕒 ${chatbotData.contact.hours}\n📸 Instagram: ${chatbotData.contact.instagram}\n\nOr continue chatting here!`);
    showQuickReplies(["Show products", "Track order"]);
    return;
  }
  
  // Bulk order
  if (text.includes('bulk') || text.includes('wholesale') || text.includes('business')) {
    addBotMessage("For bulk orders (10+ units):\n\n• Special wholesale pricing\n• Custom packaging available\n• Dedicated account manager\n\nContact us at ${chatbotData.contact.email} or call ${chatbotData.contact.phone}");
    showQuickReplies(["Show products", "Contact support"]);
    return;
  }
  
  // Default response
  addBotMessage("I can help you with:\n\n• Product recommendations & comparison\n• Shipping & delivery info\n• Order tracking\n• Usage instructions & tips\n• Safety & ingredients\n• Returns & replacements\n• Troubleshooting issues\n\nWhat would you like to know?");
  showQuickReplies(["Show products", "Shipping info", "How to use", "Track order"]);
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatbot);
} else {
  initChatbot();
}
