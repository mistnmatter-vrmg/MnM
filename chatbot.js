// Custom AI Chatbot for Mist & Matter
const chatbotData = {
  products: [
    { name: "Royal Cotton", price: 599, desc: "Clean cotton freshness" },
    { name: "White Tea & Woods", price: 699, desc: "Soft white tea with woody warmth" },
    { name: "Soft Cotton Cloud", price: 599, desc: "Smooth comforting finish" },
    { name: "Ivory Linen", price: 699, desc: "Clean linen with airy florals" }
  ],
  faqs: {
    "shipping": "Free shipping on orders above ₹999. Delivery in 3-5 business days.",
    "return": "No returns due to hygiene. Replacement only if damaged in transit.",
    "cod": "Yes, Cash on Delivery is available.",
    "safe": "All products are fabric-safe and non-staining.",
    "usage": "Spray lightly from 20-30cm on fabric, let air dry for 2 minutes."
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
      response += `🌸 ${p.name} - ₹${p.price}\n${p.desc}\n\n`;
    });
    response += "Which one interests you?";
    addBotMessage(response);
    showQuickReplies(chatbotData.products.map(p => p.name));
    return;
  }
  
  // Shipping
  if (text.includes('ship') || text.includes('deliver')) {
    addBotMessage(chatbotData.faqs.shipping);
    showQuickReplies(["Show products", "Return policy", "COD available?"]);
    return;
  }
  
  // Return policy
  if (text.includes('return') || text.includes('refund')) {
    addBotMessage(chatbotData.faqs.return);
    showQuickReplies(["Show products", "Shipping info"]);
    return;
  }
  
  // COD
  if (text.includes('cod') || text.includes('cash')) {
    addBotMessage(chatbotData.faqs.cod);
    showQuickReplies(["Show products", "Shipping info"]);
    return;
  }
  
  // Usage
  if (text.includes('use') || text.includes('apply') || text.includes('spray')) {
    addBotMessage(chatbotData.faqs.usage);
    showQuickReplies(["Show products", "Is it safe?"]);
    return;
  }
  
  // Safety
  if (text.includes('safe') || text.includes('stain')) {
    addBotMessage(chatbotData.faqs.safe);
    showQuickReplies(["Show products", "How to use"]);
    return;
  }
  
  // Track order
  if (text.includes('track') || text.includes('order')) {
    addBotMessage("Please enter your order ID (e.g., MNM12345):");
    return;
  }
  
  // Order ID pattern
  if (text.match(/mnm\d+/i)) {
    addBotMessage(`Checking order ${text.toUpperCase()}...\n\nYour order is being processed and will be shipped within 24 hours. 📦`);
    showQuickReplies(["Show products", "Contact support"]);
    return;
  }
  
  // Contact
  if (text.includes('contact') || text.includes('support') || text.includes('help')) {
    addBotMessage("📞 Call us: +91 98346 90921\n📧 Email: mistnmatter@gmail.com\n\nOr continue chatting here!");
    showQuickReplies(["Show products", "Shipping info"]);
    return;
  }
  
  // Default response
  addBotMessage("I can help you with:\n• Product recommendations\n• Shipping & delivery\n• Order tracking\n• Usage instructions\n\nWhat would you like to know?");
  showQuickReplies(["Show products", "Shipping info", "How to use", "Track order"]);
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatbot);
} else {
  initChatbot();
}
