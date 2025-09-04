// ========== CONFIGURA TU WHATSAPP AQUÍ ==========
// Formato sugerido: 52155XXXXXXXX (código de país 52 + 1 + 10 dígitos)
const WHATSAPP_NUMBER = "52 222 630 96 10"; // <-- REEMPLAZA ESTE NÚMERO
// ================================================

const PRODUCTS = [
  { id: 1, name: "Bomba de Agua para Lavadora", price: 349.00, category: "Lavadoras", img: "img/lavadora2.png", sku: "LAV-BA-001" },
  { id: 2, name: "Bandas para Lavadora (Pack 2)", price: 199.00, category: "Lavadoras", img: "img/lavadora1.png", sku: "LAV-BD-002" },
  { id: 3, name: "Perilla de Estufa Universal", price: 149.00, category: "Estufas", img: "img/estufa1.png", sku: "EST-PR-010" },
  { id: 4, name: "Encendedor Piezoeléctrico Estufa", price: 129.00, category: "Estufas", img: "img/estufa2.png", sku: "EST-EN-011" },
  { id: 5, name: "Vaso de Licuadora Repuesto 1.5L", price: 329.00, category: "Licuadoras", img: "img/licuadora1.png", sku: "LIC-VS-020" },
  { id: 6, name: "Cuchillas de Licuadora Inox", price: 189.00, category: "Licuadoras", img: "img/licuadora2.png", sku: "LIC-CK-021" },
  { id: 7, name: "Empaque de Puerta Refrigerador", price: 379.00, category: "Refrigeradores", img: "img/refrigerador1.png", sku: "REF-EM-030" },
  { id: 8, name: "Termostato Universal", price: 259.00, category: "Refrigeradores", img: "img/refrigerador2.png", sku: "REF-TR-031" },
  { id: 9, name: "Filtro Universal de Agua", price: 139.00, category: "Otros", img: "img/otros1.png", sku: "OTR-FL-040" },
];

const state = {
  filter: "all",
  search: "",
  cart: loadCart(),
};

function loadCart(){
  try{
    const raw = localStorage.getItem("cart");
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    return [];
  }
}
function saveCart(){
  localStorage.setItem("cart", JSON.stringify(state.cart));
  updateCartCount();
}

function formatCurrency(n){
  return n.toLocaleString("es-MX",{ style:"currency", currency:"MXN"});
}

function createCard(p){
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <img src="${p.img}" alt="${p.name}" loading="lazy">
    <div class="card-body">
      <h3>${p.name}</h3>
      <div class="meta">
        <span>${p.category}</span>
        <span>SKU: ${p.sku}</span>
      </div>
      <div class="price">${formatCurrency(p.price)}</div>
      <button class="btn btn-primary" data-add="${p.id}">Agregar</button>
    </div>
  `;
  return card;
}

function renderCatalog(){
  const grid = document.getElementById("catalogo");
  grid.innerHTML = "";
  const q = state.search.trim().toLowerCase();
  const filtered = PRODUCTS.filter(p => {
    const byCat = state.filter === "all" ? true : p.category === state.filter;
    const bySearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    return byCat && bySearch;
  });
  if(filtered.length === 0){
    const empty = document.createElement("p");
    empty.textContent = "No hay productos que coincidan.";
    empty.style.opacity = .8;
    grid.appendChild(empty);
    return;
  }
  filtered.forEach(p => grid.appendChild(createCard(p)));
}

function updateCartCount(){
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cartCount").textContent = count;
}

function addToCart(id){
  const product = PRODUCTS.find(p => p.id === id);
  if(!product) return;
  const existing = state.cart.find(i => i.id === id);
  if(existing){ existing.qty += 1; }
  else { state.cart.push({ id, qty: 1 }); }
  saveCart();
  openDrawer();
  renderCart();
}

function removeFromCart(id){
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function changeQty(id, delta){
  const item = state.cart.find(i => i.id === id);
  if(!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  renderCart();
}

function renderCart(){
  const wrap = document.getElementById("cartItems");
  wrap.innerHTML = "";
  if(state.cart.length === 0){
    wrap.innerHTML = "<p style='opacity:.8'>Tu carrito está vacío.</p>";
    document.getElementById("cartTotal").textContent = formatCurrency(0);
    return;
  }
  let total = 0;
  state.cart.forEach(({id, qty})=>{
    const p = PRODUCTS.find(x => x.id === id);
    const line = p.price * qty;
    total += line;
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div>
        <h4>${p.name}</h4>
        <div class="meta"><span>${p.category}</span> <span>SKU: ${p.sku}</span></div>
        <div>${formatCurrency(p.price)} x ${qty} = <strong>${formatCurrency(line)}</strong></div>
      </div>
      <div class="qty">
        <button data-q="-1">-</button>
        <span>${qty}</span>
        <button data-q="+1">+</button>
        <button data-remove>🗑️</button>
      </div>
    `;
    el.querySelector("[data-q='-1']").addEventListener("click", ()=> changeQty(id, -1));
    el.querySelector("[data-q='+1']").addEventListener("click", ()=> changeQty(id, +1));
    el.querySelector("[data-remove]").addEventListener("click", ()=> removeFromCart(id));
    wrap.appendChild(el);
  });
  document.getElementById("cartTotal").textContent = formatCurrency(total);
}

function openDrawer(){ document.getElementById("cartDrawer").classList.add("open"); }
function closeDrawer(){ document.getElementById("cartDrawer").classList.remove("open"); }

function buildWhatsAppLink(prefixText="Hola, me interesa comprar:"){
  if(!WHATSAPP_NUMBER || WHATSAPP_NUMBER.length < 12){
    return "#";
  }
  if(state.cart.length === 0){
    const msg = encodeURIComponent("Hola, tengo una consulta.");
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  }
  const lines = state.cart.map(({id, qty})=>{
    const p = PRODUCTS.find(x=>x.id===id);
    return `• ${p.name} (SKU ${p.sku}) x${qty} — ${formatCurrency(p.price*qty)}`;
  });
  const total = state.cart.reduce((sum,{id,qty})=>{
    const p = PRODUCTS.find(x=>x.id===id); return sum + p.price*qty;
  },0);
  const text = `${prefixText}%0A%0A${encodeURIComponent(lines.join("\n"))}%0A%0ATotal: ${encodeURIComponent(formatCurrency(total))}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

function initEvents(){
  // Navbar filter
  document.querySelectorAll(".nav-link").forEach(a => {
    a.addEventListener("click", (e)=>{
      e.preventDefault();
      document.querySelectorAll(".nav-link").forEach(n=> n.classList.remove("active"));
      a.classList.add("active");
      state.filter = a.dataset.filter;
      renderCatalog();
    });
  });

  // Global add buttons (event delegation)
  document.getElementById("catalogo").addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-add]");
    if(!btn) return;
    const id = parseInt(btn.dataset.add, 10);
    addToCart(id);
  });

  // Drawer controls
  document.getElementById("cartButton").addEventListener("click", openDrawer);
  document.getElementById("closeDrawer").addEventListener("click", closeDrawer);
  document.getElementById("clearCart").addEventListener("click", ()=>{
    state.cart = [];
    saveCart();
    renderCart();
  });

  // Search
  document.getElementById("search").addEventListener("input", (e)=>{
    state.search = e.target.value;
    renderCatalog();
  });

  // Checkout
  const checkout = document.getElementById("checkoutBtn");
  checkout.addEventListener("click", (e)=>{
    checkout.setAttribute("href", buildWhatsAppLink("Hola, me interesa cotizar estos productos:"));
  });

  const waBtn = document.getElementById("whatsappBtn");
  waBtn.setAttribute("href", buildWhatsAppLink("Hola, tengo una consulta sobre refacciones."));

  // Year
  document.getElementById("year").textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", ()=>{
  renderCatalog();
  renderCart();
  updateCartCount();
  initEvents();
});
