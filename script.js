// Global API Base
window.API_BASE = "https://mnm-orders-api.mistnmatter.workers.dev";

// Auth Token Management
const AuthManager = {
  getToken: () => localStorage.getItem('mm_auth_token'),
  setToken: (token) => localStorage.setItem('mm_auth_token', token),
  removeToken: () => localStorage.removeItem('mm_auth_token'),
  isLoggedIn: () => !!localStorage.getItem('mm_auth_token'),
  getHeaders: () => {
    const token = AuthManager.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};

// API Helper
const API = {
  async call(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...AuthManager.getHeaders(),
      ...options.headers
    };
    
    const response = await fetch(`${window.API_BASE}${endpoint}`, {
      ...options,
      headers
    });
    
    return response.json();
  },
  
  get: (endpoint) => API.call(endpoint, { method: 'GET' }),
  post: (endpoint, data) => API.call(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => API.call(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => API.call(endpoint, { method: 'DELETE' })
};

// Product Images Data
const productImages = {
  "Royal Cotton Fabric Perfume": [
    "royal_img/royalcotton2.png",
    "royal_img/royal_bgw.png",
    "royal_img/royal_bottom_left.png",
    "royal_img/royal_bottom_right.png",
    "royal_img/royal_top_left.png",
    "royal_img/royal_top_right.png",
    "royal_img/royal_des.png"
  ],
  "White Tea & Woods Fabric Perfume": [
    "tea_img/tea.png",
    "tea_img/tea_bgw.png",
    "tea_img/white_bottom_left.png",
    "tea_img/white_bottom_right.png",
    "tea_img/white_top_left.png",
    "tea_img/white_top_right.png",
    "tea_img/tea_des.png"
  ],
  "Soft Cotton Cloud Fabric Perfume": [
    "soft_img/softcotton.png",
    "soft_img/soft_bgw.png",
    "soft_img/soft_bottom_left.png",
    "soft_img/soft_bottom_right.png",
    "soft_img/soft_top_left.png",
    "soft_img/soft_top_right.png",
    "soft_img/soft_des.png"
  ],
  "Ivory Linen Fabric Perfume": [
    "ivory_img/ivorylinen.png",
    "ivory_img/ivory_bgw.png",
    "ivory_img/bottom_left.png",
    "ivory_img/bottom_right.png",
    "ivory_img/top_left.png",
    "ivory_img/top_right.png",
    "ivory_img/ivory_des.png"
  ]
};

const productInfo = {
  "Royal Cotton Fabric Perfume": "Royal Cotton captures the calm of freshly washed linen drying under soft morning light.",
  "White Tea & Woods Fabric Perfume": "A gentle blend of white tea wrapped in soft woody warmth.",
  "Soft Cotton Cloud Fabric Perfume": "Comforting cotton freshness with a smooth finish.",
  "Ivory Linen Fabric Perfume": "Crisp linen softened by airy florals."
};

// Product size variants with pricing
const productSizes = {
  "Royal Cotton Fabric Perfume": [
    { size: "30ml", price: 199, mrp: 349 },
    { size: "50ml", price: 399, mrp: 649 },
    { size: "100ml", price: 599, mrp: 999 }
  ],
  "White Tea & Woods Fabric Perfume": [
    { size: "30ml", price: 379, mrp: 429 },
    { size: "50ml", price: 449, mrp: 749 },
    { size: "100ml", price: 699, mrp: 1299 }
  ],
  "Soft Cotton Cloud Fabric Perfume": [
    { size: "30ml", price: 199, mrp: 349 },
    { size: "50ml", price: 399, mrp: 649 },
    { size: "100ml", price: 599, mrp: 999 }
  ],
  "Ivory Linen Fabric Perfume": [
    { size: "30ml", price: 379, mrp: 429 },
    { size: "50ml", price: 449, mrp: 749 },
    { size: "100ml", price: 699, mrp: 1299 }
  ]
};

// Cart Management
let cart;
const drawer = document.getElementById("drawer");
const drawerTitle = document.getElementById("drawerTitle");
const drawerContent = document.getElementById("drawerContent");
const cartOverlay = document.getElementById("cartOverlay");
const API_URL = 'https://mnm-orders-api.mistnmatter.workers.dev';

// Initialize
document.addEventListener("DOMContentLoaded", async function () {
  // Quick UI setup first
  updateCartCount();
  checkAuth();
  initProductCards();
  initDiscountBadges();
  initScrollEffects();
  
  // Load cart from localStorage immediately
  try {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  } catch (e) {
    cart = [];
  }
  updateCartCount();
  
  // Async operations in background
  if (AuthManager.isLoggedIn()) {
    // Don't wait for these
    loadUserProfile().catch(err => console.error('Profile load error:', err));
    updateWishlistIcons().catch(err => console.error('Wishlist load error:', err));
    loadCartFromAPI().catch(err => console.error('Cart sync error:', err));
    syncUserDataFromDB().catch(err => console.error('Sync error:', err));
  }
  
  if (localStorage.getItem("mm_repeat_buyer")) {
    showMiniConfirm("Welcome back 🤍 Enjoy 10% off today");
  }
  
  // Load products in background
  loadProductsFromAPI().catch(err => console.error('Products load error:', err));
  
  // Load review counts dynamically
  loadAllReviewCounts().catch(err => console.error('Review counts load error:', err));
  
  // Check for hash navigation
  if (window.location.hash === '#profile-addresses') {
    handleAuthClick();
    setTimeout(() => {
      viewAddresses();
    }, 500);
  }
});

// Scroll Effects
function initScrollEffects() {
  const header = document.querySelector("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

// Product Cards Initialization
function initProductCards() {
  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", function (e) {
      if (e.target.closest(".add-cart") || e.target.closest(".wishlist-heart")) return;
      
      window.lastScrollY = window.scrollY;
      history.pushState({ drawer: "product" }, "", "#product");
      
      openProduct({
        name: this.dataset.name,
        price: Number(this.dataset.price),
        mrp: Number(this.dataset.mrp),
        img: this.dataset.img,
        rating: this.dataset.rating,
        category: this.dataset.category
      });
    });
    
    const addBtn = card.querySelector(".add-cart");
    addBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      const size = card.dataset.size || '50ml';
      addToCart(
        `${card.dataset.name} - ${size}`,
        Number(card.dataset.price),
        Number(card.dataset.mrp),
        card.dataset.img
      );
    });
  });
}

// Discount Badges
function initDiscountBadges() {
  document.querySelectorAll(".product-card").forEach(card => {
    const mrp = Number(card.dataset.mrp);
    const selling = Number(card.dataset.price);
    const discount = Math.round(((mrp - selling) / mrp) * 100);
    const badge = card.querySelector(".discount-badge");
    
    if (discount > 0) {
      badge.innerText = `${discount}% OFF`;
      badge.style.display = "block";
    } else {
      badge.style.display = "none";
    }
  });
}

// Cart Functions
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  
  // Sync to API if logged in
  if (AuthManager.isLoggedIn()) {
    syncCartToAPI();
  }
}

async function syncCartToAPI() {
  const userPhone = localStorage.getItem('mm_user_phone');
  if (!userPhone) return;
  
  try {
    await API.post('/api/cart', { userPhone, cart });
  } catch (error) {
    console.error('Cart sync error:', error);
  }
}

async function loadCartFromAPI() {
  const userPhone = localStorage.getItem('mm_user_phone');
  if (!userPhone) return;
  
  try {
    const result = await API.get(`/api/cart?phone=${userPhone}`);
    if (result.success && result.cart.length > 0) {
      cart = result.cart;
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
    }
  } catch (error) {
    console.error('Load cart error:', error);
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  }
}

async function loadUserProfile() {
  const userPhone = localStorage.getItem('mm_user_phone');
  if (!userPhone) return;
  
  try {
    const result = await API.get(`/api/users/${userPhone}`);
    if (result.success) {
      // Sync localStorage with database
      localStorage.setItem('mm_user_name', result.user.name);
      localStorage.setItem('mm_user_email', result.user.email || '');
      if (result.user.dob) localStorage.setItem('mm_user_dob', result.user.dob);
      checkAuth(); // Update UI after data loaded
    }
  } catch (error) {
    console.error('Load profile error:', error);
  }
}

async function syncUserDataFromDB() {
  const userPhone = localStorage.getItem('mm_user_phone');
  if (!userPhone) return;
  
  try {
    const result = await API.get(`/api/users/${userPhone}`);
    if (result.success && result.user) {
      // Update localStorage with latest DB data
      localStorage.setItem('mm_user_name', result.user.name || '');
      localStorage.setItem('mm_user_email', result.user.email || '');
      if (result.user.dob) localStorage.setItem('mm_user_dob', result.user.dob);
      checkAuth(); // Update UI
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
}

async function loadProductsFromAPI() {
  try {
    const result = await API.get('/api/products');
    if (result.success && result.products.length > 0) {
      // Products loaded from API - can update UI dynamically
      console.log('Products loaded:', result.products.length);
    }
  } catch (error) {
    console.error('Load products error:', error);
  }
}

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (!el || !Array.isArray(cart)) return;
  
  let count = 0;
  cart.forEach(item => {
    count += Number(item.qty) || 0;
  });
  
  el.innerText = count;
}

function addToCart(name, price, mrp, img, qty = 1) {
  let item = cart.find(p => p.name === name);
  let isRepeat = localStorage.getItem("mm_repeat_buyer") === "true";
  let finalPrice = isRepeat ? Math.round(price * 0.9) : price;
  
  if (item) {
    item.qty += qty;
  } else {
    cart.push({ name, price, mrp, img, qty: qty });
  }
  
  saveCart();
  updateCartCount();
  showMiniConfirm("Added to cart");
}

function changeQty(i, d) {
  cart[i].qty += d;
  if (cart[i].qty <= 0) cart.splice(i, 1);
  saveCart();
  updateCartCount();
  renderCart();
}

function renderCart() {
  if (cart.length === 0) {
    openDrawer("Your Cart", `
      <div style="text-align:center;padding:40px 10px;">
        <p style="font-size:.95rem;">Your cart is empty</p>
        <p style="font-size:.8rem;color:#777;margin:10px 0 20px;">
          Discover subtle fragrances crafted for everyday comfort.
        </p>
        <button class="btn dark" onclick="closeDrawer();goToProducts()">EXPLORE PRODUCTS</button>
      </div>
    `);
    return;
  }
  
  let html = "";
  let subtotal = 0;
  let totalMrp = 0;
  
  // Group by size for Buy 2 Get 1 Free
  const sizeGroups = {};
  cart.forEach(item => {
    const size = item.name.match(/(30ml|50ml|100ml)/i)?.[0] || '100ml';
    if (!sizeGroups[size]) sizeGroups[size] = [];
    sizeGroups[size].push(item);
  });
  
  let buy2get1Discount = 0;
  let offerApplied = false;
  
  // Calculate discount per size group
  Object.keys(sizeGroups).forEach(size => {
    const items = sizeGroups[size];
    const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
    
    if (totalQty >= 3) {
      const freeItems = Math.floor(totalQty / 3);
      // Sort by price and make cheapest items free
      const sortedItems = [...items].sort((a, b) => a.price - b.price);
      let remaining = freeItems;
      
      for (const item of sortedItems) {
        if (remaining <= 0) break;
        const freeFromThis = Math.min(remaining, item.qty);
        buy2get1Discount += item.price * freeFromThis;
        remaining -= freeFromThis;
      }
      
      offerApplied = true;
    }
  });
  
  cart.forEach((i, idx) => {
    subtotal += i.price * i.qty;
    totalMrp += i.mrp * i.qty;
    
    html += `
      <div class="cart-row">
        <img src="${i.img}" class="cart-img">
        <div class="cart-info">
          <strong>${i.name}</strong>
          <div class="cart-price">₹${i.price} × ${i.qty}</div>
        </div>
        <div class="qty">
          <button onclick="changeQty(${idx},-1)">−</button>
          <span>${i.qty}</span>
          <button onclick="changeQty(${idx},1)">+</button>
        </div>
      </div>
    `;
  });
  
  const discountedSubtotal = subtotal - buy2get1Discount;
  const savings = totalMrp - discountedSubtotal;
  const shipping = discountedSubtotal >= 999 ? 0 : 99;
  const grandTotal = discountedSubtotal + shipping;
  
  html += `
    <div style="margin-top:20px;padding-top:20px;border-top:1px solid #e5e7eb;">
      <div class="cart-trust-strip">
        <span>🚚 Free Shipping ₹999+</span>
        <span>🔒 Secure</span>
        <span>🇮🇳 Made in India</span>
      </div>
      ${offerApplied ? `<div style="background:#d1fae5;color:#065f46;padding:10px;border-radius:8px;font-size:.8rem;margin:10px 0;text-align:center;font-weight:600;">🎉 Buy 2 Get 1 FREE Applied! You saved ₹${buy2get1Discount}</div>` : `<div style="background:#fef3c7;color:#92400e;padding:10px;border-radius:8px;font-size:.8rem;margin:10px 0;text-align:center;">🎁 Buy 2 of same size, Get 1 FREE! (30ml, 50ml or 100ml)</div>`}
      <div class="cart-urgency">
        Selling fast · Dispatched in 24 hrs
      </div>
      <div class="cart-line">
        <span>Subtotal</span>
        <strong>₹${subtotal}</strong>
      </div>
      ${buy2get1Discount > 0 ? `<div class="cart-line" style="color:#10b981;"><span>Buy 2 Get 1 FREE</span><strong>-₹${buy2get1Discount}</strong></div>` : ''}
      <div class="cart-line">
        <span>Shipping</span>
        <strong>${shipping === 0 ? "FREE" : `₹${shipping}`}</strong>
      </div>
      ${savings > 0 ? `<div class="cart-savings">You saved ₹${savings}</div>` : ""}
      <div class="cart-total">
        <span>Total</span>
        <strong>₹${grandTotal}</strong>
      </div>
      <p class="checkout-trust">🔒 Secure checkout · COD available</p>
      <div class="cart-checkout-box">
        <button class="cart-primary-btn" onclick="openSmartCheckout()">PROCEED TO CHECKOUT</button>
        <button class="cart-whatsapp-btn" onclick="openWhatsApp()">ORDER VIA WHATSAPP</button>
      </div>
    </div>
  `;
  
  openDrawer("Your Cart", html);
}

function openCart() {
  closeMobileMenu();
  if (!Array.isArray(cart)) cart = [];
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartCount();
  renderCart();
}

// Drawer Functions
function openDrawer(title, html) {
  drawerTitle.innerText = title;
  drawerContent.innerHTML = html;
  drawer.classList.add("open");
  cartOverlay.classList.add("active");
  document.body.classList.add("drawer-open");
}

function closeDrawer() {
  drawer.classList.remove("open");
  cartOverlay.classList.remove("active");
  document.body.classList.remove("drawer-open");
}

cartOverlay.addEventListener("click", closeDrawer);

// Product Detail
let currentProduct = {};
let pdQty = 1;
let selectedSize = null;

function openProduct(product) {
  closeMobileMenu();
  currentProduct = product;
  pdQty = 1;
  
  // Set default size to 50ml (index 1)
  const sizes = productSizes[product.name];
  selectedSize = sizes ? sizes[1] : { size: "50ml", price: product.price, mrp: product.mrp };
  
  document.body.classList.add("drawer-open");
  
  const img = document.getElementById("pdImg");
  img.src = product.img;
  
  document.getElementById("pdTitle").innerText = product.name;
  document.getElementById("pdCategory").innerText = product.category;
  document.getElementById("pdRating").innerText = product.rating;
  document.getElementById("pdQty").innerText = pdQty;
  
  // Render size selector
  renderSizeSelector(product.name);
  
  // Update price based on selected size
  updateProductPrice();
  
  loadProductImages(product.name);
  
  const infoBox = document.getElementById("pdInfoText");
  if (infoBox && productInfo[product.name]) {
    infoBox.innerText = productInfo[product.name];
  }
  
  const addBtn = document.querySelector('.pd-cart');
  if (addBtn) {
    addBtn.textContent = 'ADD TO CART';
    addBtn.onclick = addProductFromDetail;
  }
  
  loadProductReviews(product.name);
  
  document.getElementById("productDrawer").classList.add("open");
}

function renderSizeSelector(productName) {
  const sizeSelector = document.getElementById("sizeSelector");
  const sizes = productSizes[productName];
  
  if (!sizes || !sizeSelector) return;
  
  sizeSelector.innerHTML = '';
  
  sizes.forEach((sizeOption, index) => {
    const btn = document.createElement('button');
    btn.textContent = sizeOption.size;
    btn.style.cssText = `
      padding: 12px 20px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s;
      flex: 1;
      min-width: 80px;
    `;
    
    // Default select 50ml (index 1)
    if (index === 1) {
      btn.style.borderColor = '#667eea';
      btn.style.background = '#667eea';
      btn.style.color = 'white';
    }
    
    btn.onclick = () => selectSize(productName, index);
    sizeSelector.appendChild(btn);
  });
}

function selectSize(productName, sizeIndex) {
  const sizes = productSizes[productName];
  selectedSize = sizes[sizeIndex];
  
  // Update button styles
  const buttons = document.querySelectorAll('#sizeSelector button');
  buttons.forEach((btn, idx) => {
    if (idx === sizeIndex) {
      btn.style.borderColor = '#667eea';
      btn.style.background = '#667eea';
      btn.style.color = 'white';
    } else {
      btn.style.borderColor = '#e5e7eb';
      btn.style.background = 'white';
      btn.style.color = '#111';
    }
  });
  
  // Update price
  updateProductPrice();
}

function updateProductPrice() {
  if (!selectedSize) return;
  
  document.getElementById("pdPrice").innerText = `₹${selectedSize.price}`;
  document.getElementById("pdMrp").innerText = `₹${selectedSize.mrp}`;
  
  const discount = Math.round(((selectedSize.mrp - selectedSize.price) / selectedSize.mrp) * 100);
  document.getElementById("pdOff").innerText = `${discount}% OFF`;
}

function closeProduct() {
  document.getElementById("productDrawer").classList.remove("open");
  document.body.classList.remove("drawer-open");
  
  window.scrollTo({
    top: window.lastScrollY || 0,
    behavior: "smooth"
  });
  
  const lens = document.querySelector(".img-magnifier-lens");
  if (lens) lens.remove();
}

function qtyChange(val) {
  pdQty = Math.max(1, pdQty + val);
  document.getElementById("pdQty").innerText = pdQty;
}

function addProductFromDetail() {
  if (!selectedSize) {
    showMiniConfirm('Please select a size');
    return;
  }
  
  addToCart(
    `${currentProduct.name} - ${selectedSize.size}`,
    selectedSize.price,
    selectedSize.mrp,
    currentProduct.img,
    pdQty
  );
}

async function buyNow() {
  if (!selectedSize) {
    showMiniConfirm('Please select a size');
    return;
  }
  
  // Create temporary cart with only this product
  const buyNowCart = [{
    name: `${currentProduct.name} - ${selectedSize.size}`,
    price: selectedSize.price,
    mrp: selectedSize.mrp,
    img: currentProduct.img,
    qty: pdQty
  }];
  
  // Calculate totals
  const subtotal = selectedSize.price * pdQty;
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;
  
  // Save checkout data
  localStorage.setItem('checkout_data', JSON.stringify({
    cart: buyNowCart,
    subtotal: subtotal,
    shipping: shipping,
    total: total
  }));
  
  closeProduct();
  
  // Check if user is logged in
  const loggedIn = localStorage.getItem('mm_user_logged_in') === 'true';
  
  if (!loggedIn) {
    window.location.href = 'auth.html';
    return;
  }
  
  // Check if address exists in database
  const userPhone = localStorage.getItem('mm_user_phone');
  
  try {
    const response = await fetch(`${API_URL}/api/users/${userPhone}`);
    const result = await response.json();
    
    if (result.success && result.addresses && result.addresses.length > 0) {
      // Address exists - go directly to checkout
      window.location.href = 'smart-checkout.html';
    } else {
      // No address - go to address page
      window.location.href = 'checkout-address.html';
    }
  } catch (err) {
    console.error('Address check error:', err);
    // Fallback - go to address page
    window.location.href = 'checkout-address.html';
  }
}

// Image Magnifier
function enableMagnifier(imgID, zoom) {
  const img = document.getElementById(imgID);
  if (!img) return;
  
  const oldLens = img.parentElement.querySelector(".img-magnifier-lens");
  if (oldLens) oldLens.remove();
  
  const lens = document.createElement("div");
  lens.className = "img-magnifier-lens";
  img.parentElement.appendChild(lens);
  
  lens.style.backgroundImage = `url('${img.src}')`;
  
  const cx = zoom;
  const cy = zoom;
  
  lens.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";
  
  const w = lens.offsetWidth / 2;
  const h = lens.offsetHeight / 2;
  
  img.addEventListener("mousemove", moveLens);
  lens.addEventListener("mousemove", moveLens);
  img.addEventListener("mouseenter", () => lens.style.display = "block");
  img.addEventListener("mouseleave", () => lens.style.display = "none");
  
  function moveLens(e) {
    e.preventDefault();
    const rect = img.getBoundingClientRect();
    let x = e.clientX - rect.left - w;
    let y = e.clientY - rect.top - h;
    
    if (x > img.width - lens.offsetWidth) x = img.width - lens.offsetWidth;
    if (x < 0) x = 0;
    if (y > img.height - lens.offsetHeight) y = img.height - lens.offsetHeight;
    if (y < 0) y = 0;
    
    lens.style.left = x + "px";
    lens.style.top = y + "px";
    lens.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
  }
}

function loadProductImages(productName) {
  const images = productImages[productName] || [];
  const thumbs = document.getElementById("pdThumbs");
  const mainImg = document.getElementById("pdImg");
  
  thumbs.innerHTML = "";
  
  if (images.length === 0) return;
  
  mainImg.src = images[0];
  
  images.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    
    if (index === 0) img.classList.add("active");
    
    img.onclick = () => {
      document.querySelectorAll(".pd-thumbs img").forEach(t => t.classList.remove("active"));
      img.classList.add("active");
      mainImg.src = src;
      enableImageSwipe(images);
    };
    
    thumbs.appendChild(img);
  });
}

// Navigation
function goToProducts() {
  closeMobileMenu();
  closeProduct();
  
  window.scrollTo({
    top: document.getElementById("products").offsetTop - 60,
    behavior: "smooth"
  });
}

function goHome() {
  if (typeof closeDrawer === "function") closeDrawer();
  if (typeof closeProduct === "function") closeProduct();
  if (typeof closeMobileMenu === "function") closeMobileMenu();
  
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// Mobile Menu
let menuOpen = false;

function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  menuOpen = !menuOpen;
  menu.style.display = menuOpen ? "flex" : "none";
}

function closeMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  menu.style.display = "none";
  menuOpen = false;
}

document.addEventListener("click", function(e) {
  const menu = document.getElementById("mobileMenu");
  if (menuOpen && !menu.contains(e.target) && !e.target.closest(".icon-btn")) {
    closeMobileMenu();
  }
});

// WhatsApp Order
function openWhatsApp() {
  let text = "Hi, I want to order:\n\n";
  let subtotal = 0;
  cart.forEach(i => {
    text += `${i.name} × ${i.qty} = ₹${i.price * i.qty}\n`;
    subtotal += i.price * i.qty;
  });
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;
  
  text += `\nSubtotal: ₹${subtotal}`;
  text += `\nShipping: ${shipping === 0 ? 'FREE' : '₹' + shipping}`;
  text += `\nTotal: ₹${total}`;
  
  window.open(
    "https://wa.me/919834690921?text=" + encodeURIComponent(text),
    "_blank"
  );
  localStorage.setItem("mm_repeat_buyer", "true");
}

// Info Drawer
function openInfo(type) {
  const content = {
    story: `<p><strong>Our Story</strong></p><p>Mist & Matter began with a simple observation — most fragrances were designed to be noticed, not lived with.</p>`,
    mission: `<p><strong>Mission</strong></p><p>To create thoughtful fabric care products that bring calm into everyday life.</p>`,
    vision: `<p><strong>Vision</strong></p><p>To redefine freshness quietly and intentionally.</p>`
  };
  openDrawer(type.toUpperCase(), content[type]);
}

// Mini Confirm Toast
function showMiniConfirm(msg) {
  const div = document.createElement("div");
  div.innerText = msg;
  div.style.cssText = `
    position:fixed;
    bottom:90px;
    left:50%;
    transform:translateX(-50%);
    background:#111;
    color:#fff;
    padding:10px 16px;
    font-size:.75rem;
    border-radius:20px;
    z-index:2000;
    animation:fadeInUp .3s ease;
  `;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 1800);
}

// Back Button Support
window.addEventListener("popstate", function () {
  if (document.getElementById("drawer").classList.contains("open")) {
    closeDrawer();
    return;
  }
  
  if (document.getElementById("productDrawer").classList.contains("open")) {
    closeProduct();
    return;
  }
});

// Image Swipe for Mobile
let imgIndex = 0;
let startX = 0;

function enableImageSwipe(images) {
  const img = document.getElementById("pdImg");
  
  img.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });
  
  img.addEventListener("touchend", e => {
    const diff = e.changedTouches[0].clientX - startX;
    
    if (Math.abs(diff) > 40) {
      imgIndex += diff < 0 ? 1 : -1;
      if (imgIndex < 0) imgIndex = images.length - 1;
      if (imgIndex >= images.length) imgIndex = 0;
      img.src = images[imgIndex];
    }
  });
}

// Swipe to Close Drawers
let touchStartX = 0;
let touchEndX = 0;

function handleSwipeClose(startX, endX, closeFn) {
  const deltaX = endX - startX;
  if (deltaX > 70) {
    closeFn();
  }
}

const cartDrawer = document.getElementById("drawer");
if (cartDrawer) {
  cartDrawer.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  cartDrawer.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeClose(touchStartX, touchEndX, closeDrawer);
  });
}

const productDrawer = document.getElementById("productDrawer");
if (productDrawer) {
  productDrawer.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  productDrawer.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeClose(touchStartX, touchEndX, closeProduct);
  });
}

// Mobile Bar Visibility
window.addEventListener("scroll", () => {
  const bar = document.querySelector(".pd-mobile-bar");
  if (!bar) return;
  bar.style.display = window.scrollY > 200 ? "flex" : "none";
});

// Make functions globally accessible
window.openCart = openCart;
window.closeDrawer = closeDrawer;
window.closeProduct = closeProduct;
window.goToProducts = goToProducts;
window.goHome = goHome;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.openInfo = openInfo;
window.changeQty = changeQty;
window.qtyChange = qtyChange;
window.addProductFromDetail = addProductFromDetail;
window.buyNow = buyNow;
window.openWhatsApp = openWhatsApp;
window.logout = logout;

// Auth Functions
function checkAuth(){
  const loggedIn = localStorage.getItem('mm_user_logged_in');
  const userName = localStorage.getItem('mm_user_name');
  const authLink = document.getElementById('authLink');
  const mobileAuthLink = document.getElementById('mobileAuthLink');
  
  if (loggedIn === 'true' && userName) {
    const displayName = userName.split(' ')[0]; // First name only
    if (authLink) {
      authLink.textContent = displayName.toUpperCase();
      authLink.style.cursor = 'pointer';
    }
    if (mobileAuthLink) {
      mobileAuthLink.textContent = displayName;
      mobileAuthLink.style.cursor = 'pointer';
    }
  } else {
    if (authLink) {
      authLink.textContent = 'LOGIN';
      authLink.style.cursor = 'pointer';
    }
    if (mobileAuthLink) {
      mobileAuthLink.textContent = 'Login';
      mobileAuthLink.style.cursor = 'pointer';
    }
  }
}

function handleAuthClick() {
  const loggedIn = localStorage.getItem('mm_user_logged_in');
  
  if (loggedIn === 'true') {
    // Show account menu with logout option
    openAccountMenu();
  } else {
    // Redirect to new auth page
    window.location.href = 'auth.html';
  }
}

function openAccountMenu(){
  const userName = localStorage.getItem('mm_user_name') || 'User';
  const userPhone = localStorage.getItem('mm_user_phone') || '';
  const userEmail = localStorage.getItem('mm_user_email') || '';
  
  const html = `
    <div style="padding:30px;">
      <div style="text-align:center;margin-bottom:30px;">
        <div style="width:80px;height:80px;background:#667eea;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold;margin:0 auto 15px;">${userName.charAt(0).toUpperCase()}</div>
        <h3 style="margin-bottom:5px;">${userName}</h3>
        <p style="font-size:.85rem;color:#666;">${userPhone}</p>
        ${userEmail ? `<p style="font-size:.85rem;color:#666;">${userEmail}</p>` : ''}
      </div>
      
      <div style="background:#f9fafb;padding:15px;border-radius:10px;margin-bottom:15px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
          <span style="color:#666;">Total Orders</span>
          <strong>0</strong>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#666;">Total Spent</span>
          <strong>₹0</strong>
        </div>
      </div>
      
      <button class="btn dark" onclick="viewProfile()" style="width:100%;margin-bottom:10px;background:#667eea;">MY PROFILE</button>
      <button class="btn dark" onclick="viewOrders('current')" style="width:100%;margin-bottom:10px;background:#667eea;">MY ORDERS</button>
      <button class="btn dark" onclick="viewWishlist()" style="width:100%;margin-bottom:10px;background:#667eea;">MY WISHLIST</button>
      <button class="btn dark" onclick="viewAddresses()" style="width:100%;margin-bottom:10px;background:#667eea;">SAVED ADDRESSES</button>
      <button class="btn dark" onclick="logout()" style="width:100%;background:#ef4444;">LOGOUT</button>
    </div>
  `;
  openDrawer('My Account', html);
}

async function viewOrders(filter = 'current') {
  const userPhone = localStorage.getItem('mm_user_phone');
  
  if (!userPhone) {
    closeDrawer();
    showMiniConfirm('Please login to view orders');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/orders?phone=${userPhone}`);
    const result = await response.json();
    
    if (result.success && result.orders && result.orders.length > 0) {
      const currentOrders = result.orders.filter(o => o.status !== 'rejected');
      const canceledOrders = result.orders.filter(o => o.status === 'rejected');
      const orders = filter === 'current' ? currentOrders : canceledOrders;
      
      let html = `
        <div style="padding:24px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
            <button onclick="openAccountMenu()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#666;">←</button>
            <h3 style="font-size:20px;color:#111;">My Orders</h3>
          </div>
          <div style="display:flex;gap:8px;margin-bottom:20px;">
            <button onclick="viewOrders('current')" style="flex:1;padding:10px;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;background:${filter === 'current' ? '#667eea' : '#f3f4f6'};color:${filter === 'current' ? 'white' : '#666'};">CURRENT (${currentOrders.length})</button>
            <button onclick="viewOrders('canceled')" style="flex:1;padding:10px;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;background:${filter === 'canceled' ? '#667eea' : '#f3f4f6'};color:${filter === 'canceled' ? 'white' : '#666'};">CANCELED (${canceledOrders.length})</button>
          </div>
      `;
      
      if (orders.length === 0) {
        html += `<div style="text-align:center;padding:40px 20px;color:#999;">No ${filter} orders</div>`;
      }
      
      orders.forEach(order => {
        const statusColor = order.status === 'verified' ? '#10b981' : order.status === 'rejected' ? '#fbbf24' : '#fbbf24';
        const statusBg = order.status === 'verified' ? '#d1fae5' : order.status === 'rejected' ? '#fef3c7' : '#fef3c7';
        const statusText = order.status === 'verified' ? '✅ Verified' : order.status === 'rejected' ? '⚠️ Canceled' : '⏳ Pending';
        
        html += `
          <div style="border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:16px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <div>
                <strong style="font-size:15px;color:#111;">Order #${order.id}</strong>
                <div style="font-size:12px;color:#999;margin-top:4px;">${new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
              <span style="background:${statusBg};color:${statusColor};padding:6px 12px;border-radius:20px;font-size:12px;font-weight:600;">${statusText}</span>
            </div>
            
            <div style="background:#f9fafb;padding:12px;border-radius:8px;margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
                <span style="color:#666;">Amount</span>
                <strong style="color:#111;">₹${order.total}</strong>
              </div>
              <div style="font-size:12px;color:#666;">
                ${order.items ? order.items.map(item => `${item.product_name} x${item.quantity}`).join(', ') : 'Items'}
              </div>
            </div>
            
            ${order.status === 'verified' ? `
              <div style="background:#d1fae5;padding:10px 12px;border-radius:8px;font-size:13px;color:#065f46;margin-bottom:10px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                  <span style="font-size:18px;">🚚</span>
                  <span>Order will be dispatched within 24 hours</span>
                </div>
                ${order.tracking_number ? `
                  <div style="background:#fff;padding:8px;border-radius:6px;margin-top:8px;">
                    <div style="font-size:11px;color:#666;margin-bottom:4px;">Tracking Number</div>
                    <div style="font-weight:600;color:#111;">${order.tracking_number}</div>
                    ${order.courier_name ? `<div style="font-size:11px;color:#666;margin-top:2px;">via ${order.courier_name}</div>` : ''}
                  </div>
                ` : ''}
              </div>
            ` : ''}
            
            ${order.status === 'pending' ? `
              <div style="background:#fef3c7;padding:10px 12px;border-radius:8px;font-size:13px;color:#92400e;margin-bottom:10px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-size:18px;">⏳</span>
                  <span>Payment verification in progress</span>
                </div>
              </div>
              <button onclick="cancelOrder('${order.id}')" style="width:100%;background:#ef4444;color:white;border:none;padding:10px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;margin-top:10px;">CANCEL ORDER</button>
            ` : ''}
            
            ${order.status === 'rejected' ? `
              <div style="background:#fef3c7;padding:10px 12px;border-radius:8px;font-size:13px;color:#92400e;display:flex;align-items:center;gap:8px;">
                <span style="font-size:18px;">⚠️</span>
                <span>${order.rejected_reason || 'Order canceled'}</span>
              </div>
            ` : ''}
          </div>
        `;
      });
      
      html += '</div>';
      openDrawer('My Orders', html);
    } else {
      let html = `
        <div style="padding:60px 24px;text-align:center;">
          <button onclick="openAccountMenu()" style="position:absolute;top:20px;left:20px;background:none;border:none;font-size:20px;cursor:pointer;color:#666;">←</button>
          <div style="font-size:64px;margin-bottom:16px;opacity:0.3;">📦</div>
          <h3 style="color:#111;margin-bottom:8px;">No Orders Yet</h3>
          <p style="color:#666;font-size:14px;margin-bottom:24px;">Start shopping to see your orders here</p>
          <button class="btn dark" onclick="closeDrawer();goToProducts()" style="padding:12px 32px;">EXPLORE PRODUCTS</button>
        </div>
      `;
      openDrawer('My Orders', html);
    }
  } catch (error) {
    console.error('Orders fetch error:', error);
    closeDrawer();
    showMiniConfirm('Error loading orders');
  }
}

async function viewAddresses() {
  const userPhone = localStorage.getItem('mm_user_phone');
  
  if (!userPhone) {
    closeDrawer();
    showMiniConfirm('Please login to view addresses');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/users/${userPhone}`);
    const result = await response.json();
    
    if (result.success && result.addresses && result.addresses.length > 0) {
      let html = '<div style="padding:24px;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">';
      html += '<div style="display:flex;align-items:center;gap:12px;">';
      html += '<button onclick="openAccountMenu()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#666;">←</button>';
      html += '<h3 style="font-size:20px;color:#111;">Saved Addresses</h3>';
      html += '</div>';
      html += '<button onclick="addNewAddress()" style="background:#667eea;color:white;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">+ ADD NEW</button>';
      html += '</div>';
      
      result.addresses.forEach((addr, index) => {
        html += '<div style="border:1px solid #e5e7eb;border-radius:12px;padding:18px;margin-bottom:14px;background:#fff;position:relative;box-shadow:0 2px 8px rgba(0,0,0,0.04);">';
        if (addr.is_default) {
          html += '<div style="position:absolute;top:12px;right:12px;background:#10b981;color:white;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:600;">DEFAULT</div>';
        }
        html += '<div style="margin-bottom:12px;">';
        html += '<strong style="font-size:15px;color:#111;">' + addr.full_name + '</strong>';
        html += '<div style="font-size:12px;color:#999;margin-top:4px;">' + addr.phone + '</div>';
        html += '</div>';
        html += '<div style="font-size:13px;color:#666;line-height:1.6;margin-bottom:14px;">';
        html += addr.address + '<br>' + addr.city + ', ' + addr.state + ' - ' + addr.pincode;
        if (addr.landmark) html += '<br><span style="color:#999;">Landmark: ' + addr.landmark + '</span>';
        html += '</div>';
        html += '<div style="display:flex;gap:8px;">';
        html += '<button onclick="editAddress(' + addr.id + ')" style="flex:1;background:#667eea;color:white;border:none;padding:10px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">✏️ EDIT</button>';
        html += '<button onclick="deleteAddress(' + addr.id + ')" style="flex:1;background:#ef4444;color:white;border:none;padding:10px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">🗑️ DELETE</button>';
        html += '</div></div>';
      });
      
      html += '</div>';
      openDrawer('Saved Addresses', html);
    } else {
      let html = '<div style="padding:60px 24px;text-align:center;">';
      html += '<button onclick="openAccountMenu()" style="position:absolute;top:20px;left:20px;background:none;border:none;font-size:20px;cursor:pointer;color:#666;">←</button>';
      html += '<div style="font-size:64px;margin-bottom:16px;opacity:0.3;">📍</div>';
      html += '<h3 style="color:#111;margin-bottom:8px;">No Saved Addresses</h3>';
      html += '<p style="color:#666;font-size:14px;margin-bottom:24px;">Add an address for faster checkout</p>';
      html += '<button class="btn dark" onclick="addNewAddress()" style="padding:12px 32px;">+ ADD ADDRESS</button>';
      html += '</div>';
      openDrawer('Saved Addresses', html);
    }
  } catch (error) {
    console.error('Addresses fetch error:', error);
    closeDrawer();
    showMiniConfirm('Error loading addresses');
  }
}

function addNewAddress() {
  closeDrawer();
  // Clear any saved address and edit mode
  localStorage.removeItem('mm_delivery_address');
  localStorage.removeItem('edit_address_id');
  // Clear checkout data to indicate coming from profile
  localStorage.removeItem('checkout_data');
  window.location.href = 'checkout-address.html';
}

function editAddress(addressId) {
  closeDrawer();
  localStorage.setItem('edit_address_id', addressId);
  window.location.href = 'checkout-address.html';
}

async function deleteAddress(addressId) {
  if (!confirm('Are you sure you want to delete this address?')) return;
  
  const userPhone = localStorage.getItem('mm_user_phone');
  
  try {
    const response = await fetch(`${API_URL}/api/users/address/${addressId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    
    if (result.success) {
      showMiniConfirm('Address deleted successfully');
      // Refresh addresses list
      viewAddresses();
    } else {
      showMiniConfirm('Error deleting address');
    }
  } catch (error) {
    console.error('Delete error:', error);
    showMiniConfirm('Error deleting address');
  }
}

function logout(){
  if (confirm('Are you sure you want to logout?')) {
    // Clear all user data
    localStorage.removeItem('mm_user_name');
    localStorage.removeItem('mm_user_phone');
    localStorage.removeItem('mm_user_email');
    localStorage.removeItem('mm_user_logged_in');
    localStorage.removeItem('mm_user_id');
    localStorage.removeItem('mm_user_dob');
    localStorage.removeItem('mm_auth_token');
    localStorage.removeItem('mm_delivery_address');
    localStorage.removeItem('checkout_data');
    
    // Clear cart
    cart = [];
    localStorage.removeItem('cart');
    updateCartCount();
    
    closeDrawer();
    checkAuth();
    showMiniConfirm('Logged out successfully');
  }
}

// Smart Checkout Integration
async function openSmartCheckout() {
  let subtotal = 0;
  cart.forEach(i => {
    subtotal += i.price * i.qty;
  });
  const shipping = subtotal >= 999 ? 0 : 99;
  const grandTotal = subtotal + shipping;
  
  // Check stock via API (silent check)
  try {
    const stockResult = await API.get('/api/stock');
    if (stockResult.success) {
      const stock = stockResult.stock;
      for (const item of cart) {
        if (!stock[item.name] || stock[item.name].available < item.qty) {
          showMiniConfirm(`❌ ${item.name} - Only ${stock[item.name]?.available || 0} available`);
          return;
        }
      }
    }
  } catch (error) {
    console.error('Stock check error:', error);
  }
  
  localStorage.setItem('checkout_data', JSON.stringify({
    cart: cart,
    subtotal: subtotal,
    shipping: shipping,
    total: grandTotal
  }));
  
  const loggedIn = localStorage.getItem('mm_user_logged_in') === 'true';
  const hasAddress = localStorage.getItem('mm_delivery_address');
  
  if (loggedIn) {
    if (hasAddress) {
      window.location.href = 'smart-checkout.html';
    } else {
      window.location.href = 'checkout-address.html';
    }
  } else {
    window.location.href = 'auth.html';
  }
}

window.openSmartCheckout = openSmartCheckout;
window.handleAuthClick = handleAuthClick;


// Product Search
function searchProducts() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    const productName = card.dataset.name.toLowerCase();
    const productCategory = card.dataset.category.toLowerCase();
    
    if (productName.includes(searchTerm) || productCategory.includes(searchTerm)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

window.searchProducts = searchProducts;


// Cancel Order
async function cancelOrder(orderId) {
  if (!confirm('Are you sure you want to cancel this order?')) return;
  
  try {
    const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected', reason: 'Cancelled by customer' })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showMiniConfirm('Order cancelled successfully');
      viewOrders(); // Refresh orders list
    } else {
      showMiniConfirm('Error cancelling order');
    }
  } catch (error) {
    console.error('Cancel error:', error);
    showMiniConfirm('Error cancelling order');
  }
}

async function viewProfile() {
  const userPhone = localStorage.getItem('mm_user_phone');
  
  if (!userPhone) {
    closeDrawer();
    showMiniConfirm('Please login to view profile');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/users/${userPhone}`);
    const result = await response.json();
    
    if (result.success && result.user) {
      const user = result.user;
      
      // Update localStorage with latest data
      localStorage.setItem('mm_user_name', user.name || '');
      localStorage.setItem('mm_user_email', user.email || '');
      if (user.dob) localStorage.setItem('mm_user_dob', user.dob);
      
      let html = `
        <div style="padding:24px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
            <button onclick="openAccountMenu()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#666;">←</button>
            <h3 style="font-size:20px;color:#111;">My Profile</h3>
          </div>
          
          <form id="profileForm" style="margin-bottom:20px;">
            <div style="margin-bottom:16px;">
              <label style="display:block;font-size:13px;color:#666;margin-bottom:6px;font-weight:500;">Full Name</label>
              <input type="text" id="profileName" value="${user.name || ''}" style="width:100%;padding:12px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;" required>
            </div>
            
            <div style="margin-bottom:16px;">
              <label style="display:block;font-size:13px;color:#666;margin-bottom:6px;font-weight:500;">Date of Birth</label>
              <input type="date" id="profileDob" value="${user.dob || ''}" style="width:100%;padding:12px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;">
            </div>
            
            <div style="margin-bottom:16px;">
              <label style="display:block;font-size:13px;color:#666;margin-bottom:6px;font-weight:500;">Phone Number</label>
              <input type="tel" value="${user.phone || ''}" style="width:100%;padding:12px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;background:#f9fafb;" disabled>
              <p style="font-size:11px;color:#999;margin-top:4px;">Phone number cannot be changed</p>
            </div>
            
            <div style="margin-bottom:16px;">
              <label style="display:block;font-size:13px;color:#666;margin-bottom:6px;font-weight:500;">Email</label>
              <input type="email" id="profileEmail" value="${user.email || ''}" style="width:100%;padding:12px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;" required>
            </div>
            
            <button type="button" onclick="updateProfile()" class="btn dark" style="width:100%;background:#667eea;color:white;border:none;padding:14px;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;margin-bottom:10px;">UPDATE PROFILE</button>
          </form>
          
          <div style="border-top:2px solid #e5e7eb;padding-top:20px;">
            <h4 style="font-size:16px;color:#111;margin-bottom:16px;">Change Password</h4>
            <form id="passwordForm">
              <div style="margin-bottom:16px;">
                <label style="display:block;font-size:13px;color:#666;margin-bottom:6px;font-weight:500;">Current Password</label>
                <input type="password" id="currentPassword" placeholder="Enter current password" style="width:100%;padding:12px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;" required>
              </div>
              
              <div style="margin-bottom:16px;">
                <label style="display:block;font-size:13px;color:#666;margin-bottom:6px;font-weight:500;">New Password</label>
                <input type="password" id="newPassword" placeholder="Enter new password (min 6 characters)" minlength="6" style="width:100%;padding:12px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;" required>
              </div>
              
              <button type="button" onclick="changePassword()" class="btn dark" style="width:100%;background:#667eea;color:white;border:none;padding:14px;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;">CHANGE PASSWORD</button>
            </form>
          </div>
        </div>
      `;
      
      openDrawer('My Profile', html);
    } else {
      closeDrawer();
      showMiniConfirm('Error loading profile');
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    closeDrawer();
    showMiniConfirm('Error loading profile');
  }
}

async function updateProfile() {
  const name = document.getElementById('profileName').value.trim();
  const dob = document.getElementById('profileDob').value;
  const email = document.getElementById('profileEmail').value.trim();
  const userPhone = localStorage.getItem('mm_user_phone');
  
  if (!name || !email) {
    showMiniConfirm('❌ Please fill all required fields');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: userPhone, name, dob, email })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Update localStorage immediately
      localStorage.setItem('mm_user_name', name);
      localStorage.setItem('mm_user_email', email);
      if (dob) localStorage.setItem('mm_user_dob', dob);
      
      // Update header display
      checkAuth();
      
      showMiniConfirm('✅ Profile updated successfully!');
      setTimeout(() => viewProfile(), 1000);
    } else {
      showMiniConfirm('❌ ' + (result.error || 'Update failed'));
    }
  } catch (error) {
    console.error('Update error:', error);
    showMiniConfirm('❌ Error updating profile');
  }
}

async function changePassword() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const userEmail = localStorage.getItem('mm_user_email');
  
  if (!currentPassword || !newPassword) {
    showMiniConfirm('❌ Please fill all fields');
    return;
  }
  
  if (newPassword.length < 6) {
    showMiniConfirm('❌ Password must be at least 6 characters');
    return;
  }
  
  try {
    // First verify current password
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, password: currentPassword })
    });
    
    const loginResult = await loginResponse.json();
    
    if (!loginResult.success) {
      showMiniConfirm('❌ Current password is incorrect');
      return;
    }
    
    // Update password
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, newPassword })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showMiniConfirm('✅ Password changed successfully!');
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
    } else {
      showMiniConfirm('❌ Password change failed');
    }
  } catch (error) {
    console.error('Password change error:', error);
    showMiniConfirm('❌ Error changing password');
  }
}

window.viewProfile = viewProfile;
window.updateProfile = updateProfile;
window.changePassword = changePassword;


// Wishlist Functions
async function toggleWishlist(productName, productPrice, productMrp, productImg) {
  console.log('toggleWishlist called:', productName);
  const userPhone = localStorage.getItem('mm_user_phone');
  console.log('User phone:', userPhone);
  
  if (!userPhone) {
    showMiniConfirm('Please login to use wishlist');
    setTimeout(() => { window.location.href = 'auth.html'; }, 1500);
    return;
  }
  
  const heartBtn = document.querySelector(`[data-product="${productName}"]`);
  console.log('Heart button found:', heartBtn);
  
  try {
    console.log('Sending wishlist request...');
    const response = await fetch(`${API_URL}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userPhone, 
        productName,
        productPrice,
        productMrp,
        productImg
      })
    });
    
    const result = await response.json();
    console.log('Wishlist API response:', result);
    
    if (result.success) {
      if (result.action === 'added') {
        if (heartBtn) {
          heartBtn.textContent = '❤️';
          heartBtn.classList.add('active');
        }
        showMiniConfirm('❤️ Added to wishlist');
        await updateWishlistIcons();
      } else {
        if (heartBtn) {
          heartBtn.textContent = '🤍';
          heartBtn.classList.remove('active');
        }
        showMiniConfirm('Removed from wishlist');
        await updateWishlistIcons();
      }
    } else {
      console.error('Wishlist error:', result.error);
      showMiniConfirm('❌ ' + (result.error || 'Failed'));
    }
  } catch (error) {
    console.error('Wishlist error:', error);
    showMiniConfirm('❌ Error updating wishlist');
  }
}

async function updateWishlistIcons() {
  const userPhone = localStorage.getItem('mm_user_phone');
  if (!userPhone) return;
  
  try {
    const response = await fetch(`${API_URL}/api/wishlist?phone=${userPhone}`);
    const result = await response.json();
    
    if (result.success) {
      const wishlistNames = result.wishlist.map(item => item.product_name);
      
      document.querySelectorAll('.wishlist-heart').forEach(heart => {
        const productName = heart.getAttribute('data-product');
        
        if (wishlistNames.includes(productName)) {
          heart.textContent = '❤️';
          heart.classList.add('active');
        } else {
          heart.textContent = '🤍';
          heart.classList.remove('active');
        }
      });
    }
  } catch (error) {
    console.error('Wishlist fetch error:', error);
  }
}

async function viewWishlist() {
  const userPhone = localStorage.getItem('mm_user_phone');
  
  if (!userPhone) {
    closeDrawer();
    showMiniConfirm('Please login to view wishlist');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/wishlist?phone=${userPhone}`);
    const result = await response.json();
    
    if (result.success && result.wishlist && result.wishlist.length > 0) {
      let html = '<div style="padding:24px;">';
      html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">';
      html += '<button onclick="openAccountMenu()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#666;">←</button>';
      html += '<h3 style="font-size:20px;color:#111;">My Wishlist</h3>';
      html += '</div>';
      
      result.wishlist.forEach(item => {
        html += '<div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:14px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.04);">';
        html += '<div style="display:flex;gap:16px;margin-bottom:12px;">';
        html += '<img src="' + item.img + '" style="width:100px;height:100px;object-fit:cover;border-radius:8px;">';
        html += '<div style="flex:1;">';
        html += '<strong style="font-size:15px;color:#111;display:block;margin-bottom:6px;">' + item.product_name + '</strong>';
        html += '<div style="font-size:16px;color:#667eea;font-weight:600;margin-bottom:4px;">₹' + item.price + '</div>';
        html += '<div style="font-size:12px;color:#999;text-decoration:line-through;">₹' + item.mrp + '</div>';
        html += '</div></div>';
        html += '<div style="display:flex;gap:8px;">';
        html += '<button onclick="addToCartFromWishlist(\'' + item.product_name + '\', ' + item.price + ', ' + item.mrp + ', \'' + item.img + '\')"; style="flex:1;background:#667eea;color:white;border:none;padding:12px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">ADD TO CART</button>';
        html += '<button onclick="buyNowFromWishlist(\'' + item.product_name + '\', ' + item.price + ', ' + item.mrp + ', \'' + item.img + '\')"; style="flex:1;background:#10b981;color:white;border:none;padding:12px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">BUY NOW</button>';
        html += '<button onclick="removeFromWishlist(\'' + item.product_name + '\')"; style="background:#ef4444;color:white;border:none;padding:12px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">🗑️</button>';
        html += '</div></div>';
      });
      
      html += '</div>';
      openDrawer('My Wishlist', html);
    } else {
      let html = '<div style="padding:60px 24px;text-align:center;">';
      html += '<button onclick="openAccountMenu()" style="position:absolute;top:20px;left:20px;background:none;border:none;font-size:20px;cursor:pointer;color:#666;">←</button>';
      html += '<div style="font-size:64px;margin-bottom:16px;opacity:0.3;">🤍</div>';
      html += '<h3 style="color:#111;margin-bottom:8px;">Your Wishlist is Empty</h3>';
      html += '<p style="color:#666;font-size:14px;margin-bottom:24px;">Save your favorite products here</p>';
      html += '<button class="btn dark" onclick="closeDrawer();goToProducts()" style="padding:12px 32px;">EXPLORE PRODUCTS</button>';
      html += '</div>';
      openDrawer('My Wishlist', html);
    }
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    closeDrawer();
    showMiniConfirm('Error loading wishlist');
  }
}

function addToCartFromWishlist(name, price, mrp, img) {
  addToCart(name, price, mrp, img, 1);
}

async function buyNowFromWishlist(name, price, mrp, img) {
  // Create temporary cart with only this product
  const buyNowCart = [{
    name: name,
    price: price,
    mrp: mrp,
    img: img,
    qty: 1
  }];
  
  // Calculate totals
  const subtotal = price;
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;
  
  // Save checkout data
  localStorage.setItem('checkout_data', JSON.stringify({
    cart: buyNowCart,
    subtotal: subtotal,
    shipping: shipping,
    total: total
  }));
  
  closeDrawer();
  
  // Check if user is logged in
  const loggedIn = localStorage.getItem('mm_user_logged_in') === 'true';
  
  if (!loggedIn) {
    window.location.href = 'auth.html';
    return;
  }
  
  // Check if address exists in database
  const userPhone = localStorage.getItem('mm_user_phone');
  
  try {
    const response = await fetch(`${API_URL}/api/wishlist?phone=${userPhone}`);
    const result = await response.json();
    
    if (result.success && result.addresses && result.addresses.length > 0) {
      // Address exists - go directly to checkout
      window.location.href = 'smart-checkout.html';
    } else {
      // No address - go to address page
      window.location.href = 'checkout-address.html';
    }
  } catch (err) {
    console.error('Address check error:', err);
    // Fallback - go to address page
    window.location.href = 'checkout-address.html';
  }
}

async function removeFromWishlist(productName) {
  const userPhone = localStorage.getItem('mm_user_phone');
  
  try {
    await fetch(`${API_URL}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userPhone, productName })
    });
    
    showMiniConfirm('Removed from wishlist');
    await updateWishlistIcons();
    viewWishlist();
  } catch (error) {
    console.error('Remove error:', error);
  }
}

window.toggleWishlist = toggleWishlist;
window.viewWishlist = viewWishlist;
window.addToCartFromWishlist = addToCartFromWishlist;
window.buyNowFromWishlist = buyNowFromWishlist;
window.removeFromWishlist = removeFromWishlist;


// Reviews Functions
async function loadProductReviews(productName) {
  const userPhone = localStorage.getItem('mm_user_phone');
  
  try {
    const response = await fetch(`${API_URL}/api/reviews?product=${encodeURIComponent(productName)}`);
    const result = await response.json();
    
    if (result.success && result.reviews.length > 0) {
      let html = '<div style="margin-top:30px;padding-top:30px;border-top:2px solid #e5e7eb;">';
      html += '<h3 style="font-size:18px;margin-bottom:20px;color:#111;">Customer Reviews (' + result.reviews.length + ')</h3>';
      
      result.reviews.forEach(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const isOwnReview = userPhone && review.user_phone === userPhone;
        
        html += '<div style="border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:12px;background:#f9fafb;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
        html += '<strong style="font-size:14px;color:#111;">' + review.user_name + '</strong>';
        html += '<div style="display:flex;align-items:center;gap:8px;">';
        html += '<span style="color:#fbbf24;font-size:14px;">' + stars + '</span>';
        if (isOwnReview) {
          html += '<button onclick="editReview(' + review.id + ', \'' + productName + '\', ' + review.rating + ', \'' + review.review_text.replace(/'/g, "\\'") + '\')"; style="background:#667eea;color:white;border:none;padding:4px 10px;border-radius:5px;cursor:pointer;font-size:11px;font-weight:600;">EDIT</button>';
        }
        html += '</div></div>';
        html += '<p style="font-size:13px;color:#666;line-height:1.6;margin-bottom:6px;">' + review.review_text + '</p>';
        html += '<div style="font-size:11px;color:#999;">' + new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + '</div>';
        html += '</div>';
      });
      
      html += '</div>';
      
      const pdInfo = document.querySelector('.pd-info');
      const existingReviews = pdInfo.querySelector('.reviews-section');
      if (existingReviews) existingReviews.remove();
      
      const reviewsDiv = document.createElement('div');
      reviewsDiv.className = 'reviews-section';
      reviewsDiv.innerHTML = html;
      pdInfo.appendChild(reviewsDiv);
    }
  } catch (error) {
    console.error('Reviews fetch error:', error);
  }
}

async function submitReview(productName) {
  const userPhone = localStorage.getItem('mm_user_phone');
  const userName = localStorage.getItem('mm_user_name');
  
  if (!userPhone) {
    showMiniConfirm('Please login to write a review');
    return;
  }
  
  const rating = document.getElementById('reviewRating').value;
  const reviewText = document.getElementById('reviewText').value.trim();
  
  if (!reviewText) {
    showMiniConfirm('Please write a review');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName,
        userPhone,
        userName,
        rating: parseInt(rating),
        reviewText
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showMiniConfirm('✓ Review submitted successfully!');
      document.getElementById('reviewText').value = '';
      document.getElementById('reviewRating').value = '5';
      // Immediately reload reviews
      await loadProductReviews(productName);
    } else {
      showMiniConfirm(result.error || 'Error submitting review');
    }
  } catch (error) {
    console.error('Review submit error:', error);
    showMiniConfirm('Error submitting review');
  }
}

function editReview(reviewId, productName, rating, reviewText) {
  document.getElementById('reviewRating').value = rating;
  document.getElementById('reviewText').value = reviewText;
  
  const submitBtn = document.querySelector('.pd-info button[onclick*="submitReview"]');
  submitBtn.textContent = 'UPDATE REVIEW';
  submitBtn.onclick = () => updateReview(reviewId, productName);
  
  showMiniConfirm('Edit your review and click UPDATE');
}

async function updateReview(reviewId, productName) {
  const rating = document.getElementById('reviewRating').value;
  const reviewText = document.getElementById('reviewText').value.trim();
  
  if (!reviewText) {
    showMiniConfirm('Please write a review');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: parseInt(rating),
        reviewText
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showMiniConfirm('✓ Review updated successfully!');
      document.getElementById('reviewText').value = '';
      document.getElementById('reviewRating').value = '5';
      
      const submitBtn = document.querySelector('.pd-info button[onclick*="updateReview"]');
      submitBtn.textContent = 'SUBMIT REVIEW';
      submitBtn.onclick = () => submitReview(productName);
      
      loadProductReviews(productName);
    } else {
      showMiniConfirm(result.error || 'Error updating review');
    }
  } catch (error) {
    console.error('Review update error:', error);
    showMiniConfirm('Error updating review');
  }
}

window.submitReview = submitReview;
window.editReview = editReview;
window.updateReview = updateReview;

// ============ ADMIN ACCESS ============

function openAdminAccess() {
  const password = prompt('🔒 Enter Admin Password:');
  
  const adminCredentials = {
    'FOUNDER1': { name: 'CEO Vijay Mahato', role: 'CEO' },
    'COFOUNDER1': { name: 'CTO Rohan Lad', role: 'CTO' },
    'COFOUNDER2': { name: 'COO Gaurav Goswami', role: 'COO' },
    'COFOUNDER3': { name: 'CFO Manish Sarode', role: 'CFO' }
  };
  
  if (password && adminCredentials[password]) {
    const admin = adminCredentials[password];
    localStorage.setItem('admin_access', 'true');
    localStorage.setItem('admin_name', admin.name);
    localStorage.setItem('admin_role', admin.role);
    showMiniConfirm(`✅ Welcome ${admin.name}`);
    setTimeout(() => {
      window.location.href = 'admin-fixed.html';
    }, 1000);
  } else if (password) {
    showMiniConfirm('❌ Invalid password');
  }
}

window.openAdminAccess = openAdminAccess;

// ============ PHASE 4: GROWTH FUNCTIONS ============

// Newsletter Subscription
async function subscribeNewsletter(event) {
  event.preventDefault();
  
  const name = document.getElementById('subName').value.trim();
  const email = document.getElementById('subEmail').value.trim();
  const phone = document.getElementById('subPhone').value.trim();
  const msgEl = document.getElementById('newsletterMsg');
  
  if (!name || !email) {
    msgEl.textContent = '❌ Please fill required fields';
    msgEl.style.color = '#ef4444';
    return;
  }
  
  try {
    const result = await API.post('/api/newsletter/subscribe', { email, name, phone });
    
    if (result.success) {
      msgEl.textContent = '✅ Subscribed! Check your email for exclusive offers';
      msgEl.style.color = '#10b981';
      document.getElementById('newsletterForm').reset();
      
      // Track conversion
      if (window.gtag) {
        gtag('event', 'newsletter_subscribe', { method: 'website' });
      }
    } else {
      msgEl.textContent = result.error || '❌ Subscription failed';
      msgEl.style.color = '#ef4444';
    }
  } catch (error) {
    msgEl.textContent = '❌ Error. Please try again';
    msgEl.style.color = '#ef4444';
  }
}

window.subscribeNewsletter = subscribeNewsletter;

// Load review counts for all products on page load
async function loadAllReviewCounts(){
  const products=['Royal Cotton Fabric Perfume','White Tea & Woods Fabric Perfume','Soft Cotton Cloud Fabric Perfume','Ivory Linen Fabric Perfume'];
  
  for(const productName of products){
    try{
      const res=await fetch(`${API_URL}/api/reviews?product=${encodeURIComponent(productName)}`);
      const data=await res.json();
      
      if(data.success){
        const count=data.reviews.length;
        
        // Update product card count
        const cards=document.querySelectorAll('.product-card');
        cards.forEach(card=>{
          if(card.dataset.name===productName){
            const ratingSpan=card.querySelector('.rating span:last-child');
            if(ratingSpan)ratingSpan.textContent=`(${count} Reviews)`;
          }
        });
      }
    }catch(e){
      console.error('Error loading review count for',productName,e);
    }
  }
}

window.loadAllReviewCounts=loadAllReviewCounts;

// Abandoned Cart Tracking
let abandonedCartTimer;

function trackAbandonedCart() {
  clearTimeout(abandonedCartTimer);
  
  if (!AuthManager.isLoggedIn() || !cart || cart.length === 0) return;
  
  abandonedCartTimer = setTimeout(async () => {
    const userPhone = localStorage.getItem('mm_user_phone');
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    try {
      await API.post('/api/abandoned-cart', { userPhone, cart, total });
    } catch (error) {
      console.error('Abandoned cart tracking error:', error);
    }
  }, 300000); // 5 minutes
}

// Track cart changes
const originalSaveCart = saveCart;
saveCart = function() {
  originalSaveCart();
  trackAbandonedCart();
};

// WhatsApp Order Notification
async function sendOrderWhatsApp(orderId, phone) {
  const message = `🎉 Order Confirmed!\n\nOrder ID: ${orderId}\nThank you for shopping with Mist & Matter.\n\nTrack your order: https://mnm-website.pages.dev`;
  
  try {
    await API.post('/api/whatsapp/notify', { phone, message, orderId });
  } catch (error) {
    console.error('WhatsApp notification error:', error);
  }
}

window.sendOrderWhatsApp = sendOrderWhatsApp;

// Analytics Tracking
function trackEvent(eventName, params = {}) {
  if (window.gtag) {
    gtag('event', eventName, params);
  }
}

// Track product views
const originalOpenProduct = openProduct;
openProduct = function(product) {
  originalOpenProduct(product);
  trackEvent('view_item', {
    items: [{
      item_name: product.name,
      price: product.price,
      currency: 'INR'
    }]
  });
};

// Track add to cart
const originalAddToCart = addToCart;
addToCart = function(name, price, mrp, img, qty = 1) {
  originalAddToCart(name, price, mrp, img, qty);
  trackEvent('add_to_cart', {
    items: [{
      item_name: name,
      price: price,
      quantity: qty,
      currency: 'INR'
    }]
  });
};

// Track checkout
window.addEventListener('load', () => {
  if (window.location.pathname.includes('smart-checkout')) {
    trackEvent('begin_checkout', {
      value: parseFloat(localStorage.getItem('checkout_total') || 0),
      currency: 'INR'
    });
  }
});
