/* ==========================================================================
   COMPORTEMENT COMMUN À TOUTES LES PAGES
   Header, menu mobile, recherche, panier, fiche produit, commande WhatsApp.
   Chaque bloc vérifie que ses éléments existent avant de s'attacher, car
   certaines pages (ex. contact.html) n'ont pas tous les blocs (galerie...).
   ========================================================================== */
(function(){
"use strict";

/* Stockage du panier : localStorage si disponible, sinon mémoire. Le panier
   est commun à toutes les pages puisqu'il utilise localStorage. */
const CartStorage = (function(){
  let memory = [];
  let available = false;
  try {
    const k = "__ramas_test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    available = true;
  } catch(e){ available = false; }
  return {
    get(){
      if (available){
        try { return JSON.parse(localStorage.getItem("ramasCart")) || []; }
        catch(e){ return memory; }
      }
      return memory;
    },
    set(val){
      memory = val;
      if (available){
        try { localStorage.setItem("ramasCart", JSON.stringify(val)); } catch(e){}
      }
    }
  };
})();

let cart = CartStorage.get();

/* ==========================================================================
   HEADER : SCROLL, MENU MOBILE, RECHERCHE
   ========================================================================== */
const siteHeader = document.getElementById("siteHeader");
if (siteHeader){
  window.addEventListener("scroll", () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 30);
    const topBtn = document.getElementById("backToTop");
    if (topBtn) topBtn.classList.toggle("is-visible", window.scrollY > 500);
  }, { passive:true });
}

const scrim = document.getElementById("scrim");
const mobileMenu = document.getElementById("mobileMenu");
const menuToggle = document.getElementById("menuToggle");
function openMobileMenu(){ mobileMenu.classList.add("is-open"); scrim.classList.add("is-visible"); menuToggle.setAttribute("aria-expanded","true"); }
function closeMobileMenu(){ mobileMenu.classList.remove("is-open"); scrim.classList.remove("is-visible"); menuToggle.setAttribute("aria-expanded","false"); }
if (menuToggle && mobileMenu && scrim){
  menuToggle.addEventListener("click", openMobileMenu);
  document.getElementById("closeMenu").addEventListener("click", closeMobileMenu);
  scrim.addEventListener("click", closeMobileMenu);
  document.querySelectorAll(".mobile-link").forEach(a => a.addEventListener("click", closeMobileMenu));
}

/* La recherche de l'en-tête redirige vers la page catalogue de la famille
   courante (si on y est déjà) ou, sinon, vers la page "Parfums" avec le
   terme en paramètre d'URL (?q=...). Chaque page catalogue lit ce paramètre
   au chargement. Limite connue : la recherche n'interroge qu'une famille à
   la fois puisqu'il n'existe plus de catalogue global unique. */
const searchOverlay = document.getElementById("searchOverlay");
const searchToggle = document.getElementById("searchToggle");
if (searchOverlay && searchToggle){
  searchToggle.addEventListener("click", () => {
    searchOverlay.classList.add("is-open");
    document.getElementById("headerSearchInput").focus();
  });
  searchOverlay.addEventListener("click", (e) => { if (e.target === searchOverlay) searchOverlay.classList.remove("is-open"); });
  document.getElementById("headerSearchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const term = document.getElementById("headerSearchInput").value.trim();
    searchOverlay.classList.remove("is-open");
    if (window.CATALOGUE_PAGE && typeof window.applyHeaderSearch === "function"){
      window.applyHeaderSearch(term);
    } else if (term) {
      window.location.href = "produits-parfums.html?q=" + encodeURIComponent(term);
    }
  });
}

const backToTop = document.getElementById("backToTop");
if (backToTop) backToTop.addEventListener("click", () => window.scrollTo({ top:0, behavior:"smooth" }));

document.addEventListener("click", (e) => {
  const link = e.target.closest('a[href="#whatsapp-a-configurer"]');
  if (!link) return;
  e.preventDefault();
  notify("Numéro WhatsApp à configurer dans assets/data.js avant la mise en ligne");
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (searchOverlay) searchOverlay.classList.remove("is-open");
  if (mobileMenu) closeMobileMenu();
  closeCart();
  closeProductModal();
  closeCheckout();
  const lightbox = document.getElementById("lightbox");
  if (lightbox) lightbox.classList.remove("is-open");
});

/* ==========================================================================
   PRODUIT : RENDU DE CARTE (utilisé sur toutes les pages qui listent des produits)
   ========================================================================== */
function productCardHtml(p){
  const cat = CATEGORY_MAP[p.categoryId];
  const pct = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : null;
  const badgeHtml = p.badge === "nouveau"
    ? '<span class="badge badge--new">Nouveau</span>'
    : p.badge === "promotion" ? '<span class="badge badge--promo">Promotion</span>' : "";
  const outHtml = !p.stock ? '<span class="badge badge--out">Rupture de stock</span>' : "";
  return '<article class="product-card" data-id="' + p.id + '">'
    + '<div class="product-media">'
    +   '<div class="product-badges">' + badgeHtml + outHtml + '</div>'
    +   '<img src="' + placeholderImage(p.name, p.reference) + '" alt="' + escapeXml(p.name) + ', ' + escapeXml(cat.name) + '" loading="lazy" width="400" height="500">'
    + '</div>'
    + '<div class="product-body">'
    +   '<span class="product-cat">' + escapeXml(cat.name) + '</span>'
    +   '<h3 class="product-name">' + escapeXml(p.name) + '</h3>'
    +   '<p class="product-desc">' + escapeXml(p.description) + '</p>'
    +   '<div class="product-price-row">'
    +     '<span class="price-now">' + formatPrice(p.price) + '</span>'
    +     (p.oldPrice ? '<span class="price-old">' + formatPrice(p.oldPrice) + '</span><span class="price-pct">-' + pct + '%</span>' : '')
    +   '</div>'
    +   '<span class="stock-note ' + (p.stock ? '' : 'is-out') + '">' + (p.stock ? 'En stock' : 'Rupture de stock') + '</span>'
    +   '<div class="product-actions">'
    +     '<button class="btn btn-ghost" data-action="details" data-id="' + p.id + '">Voir détails</button>'
    +     '<button class="btn btn-primary" data-action="add" data-id="' + p.id + '" ' + (p.stock ? '' : 'disabled') + '>Ajouter</button>'
    +   '</div>'
    + '</div></article>';
}
window.productCardHtml = productCardHtml;

document.addEventListener("click", (e) => {
  const addBtn = e.target.closest('[data-action="add"]');
  if (addBtn){ addToCart(Number(addBtn.dataset.id), 1); return; }
  const detailsBtn = e.target.closest('[data-action="details"]');
  if (detailsBtn){ openProductModal(Number(detailsBtn.dataset.id)); return; }
});

/* ==========================================================================
   FICHE PRODUIT / MODAL
   ========================================================================== */
const productModalScrim = document.getElementById("productModalScrim");
function openProductModal(id){
  const p = getProduct(id);
  if (!p) return;
  const cat = CATEGORY_MAP[p.categoryId];
  const similar = PRODUCTS.filter(x => x.categoryId === p.categoryId && x.id !== p.id).slice(0,4);
  document.getElementById("productModalContent").innerHTML =
    '<div class="product-modal-grid">'
    + '<div class="product-modal-media"><img src="' + placeholderImage(p.name, p.reference) + '" alt="' + escapeXml(p.name) + '"></div>'
    + '<div class="product-modal-body">'
    +   '<span class="product-cat">' + escapeXml(cat.name) + '</span>'
    +   '<h2 id="productModalTitle">' + escapeXml(p.name) + '</h2>'
    +   '<p>' + escapeXml(p.description) + ' Référence : ' + escapeXml(p.reference) + '.</p>'
    +   '<div class="product-price-row">'
    +     '<span class="price-now">' + formatPrice(p.price) + '</span>'
    +     (p.oldPrice ? '<span class="price-old">' + formatPrice(p.oldPrice) + '</span>' : '')
    +   '</div>'
    +   '<span class="stock-note ' + (p.stock ? '' : 'is-out') + '">' + (p.stock ? 'En stock' : 'Rupture de stock') + '</span>'
    +   '<div class="qty-row">'
    +     '<span>Quantité</span>'
    +     '<div class="qty-stepper">'
    +       '<button type="button" id="modalQtyMinus" aria-label="Diminuer la quantité">-</button>'
    +       '<span id="modalQtyValue">1</span>'
    +       '<button type="button" id="modalQtyPlus" aria-label="Augmenter la quantité">+</button>'
    +     '</div>'
    +   '</div>'
    +   '<button class="btn btn-primary btn-block" id="modalAddToCart" ' + (p.stock ? '' : 'disabled') + '>' + (p.stock ? 'Ajouter au panier' : 'Indisponible') + '</button>'
    + '</div></div>'
    + (similar.length ? '<div class="similar-row"><h4>Vous pourriez aussi aimer</h4><div class="product-grid">' + similar.map(productCardHtml).join("") + '</div></div>' : '');

  let qty = 1;
  const qtyValue = document.getElementById("modalQtyValue");
  document.getElementById("modalQtyMinus").addEventListener("click", () => { qty = Math.max(1, qty-1); qtyValue.textContent = qty; });
  document.getElementById("modalQtyPlus").addEventListener("click", () => { qty = Math.min(20, qty+1); qtyValue.textContent = qty; });
  document.getElementById("modalAddToCart").addEventListener("click", () => { addToCart(p.id, qty); });

  productModalScrim.classList.add("is-visible");
  document.getElementById("closeProductModal").focus();
}
window.openProductModal = openProductModal;
function closeProductModal(){ if (productModalScrim) productModalScrim.classList.remove("is-visible"); }
if (productModalScrim){
  document.getElementById("closeProductModal").addEventListener("click", closeProductModal);
  productModalScrim.addEventListener("click", (e) => { if (e.target === productModalScrim) closeProductModal(); });
}

/* ==========================================================================
   PANIER
   ========================================================================== */
function addToCart(id, qty){
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ id:id, qty:qty });
  CartStorage.set(cart);
  renderCartCount();
  renderCartDrawer();
  notify("Produit ajouté au panier");
}
function changeCartQty(id, delta){
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  CartStorage.set(cart);
  renderCartCount();
  renderCartDrawer();
}
function removeFromCart(id){
  cart = cart.filter(i => i.id !== id);
  CartStorage.set(cart);
  renderCartCount();
  renderCartDrawer();
}
function clearCart(){
  cart = [];
  CartStorage.set(cart);
  renderCartCount();
  renderCartDrawer();
}
function cartTotals(){
  let subtotal = 0;
  cart.forEach(i => { const p = getProduct(i.id); if (p) subtotal += p.price * i.qty; });
  return { subtotal:subtotal, total:subtotal };
}
function renderCartCount(){
  const el = document.getElementById("cartCount");
  if (el) el.textContent = cart.reduce((a,c) => a + c.qty, 0);
}
function renderCartDrawer(){
  const container = document.getElementById("cartItems");
  if (!container) return;
  if (cart.length === 0){
    container.innerHTML = '<p class="cart-empty">Votre panier est vide pour le moment.</p>';
  } else {
    container.innerHTML = cart.map(i => {
      const p = getProduct(i.id);
      if (!p) return "";
      return '<div class="cart-item">'
        + '<img src="' + placeholderImage(p.name, p.reference) + '" alt="' + escapeXml(p.name) + '">'
        + '<div class="cart-item-info">'
        +   '<span class="cart-item-name">' + escapeXml(p.name) + '</span>'
        +   '<span>' + formatPrice(p.price) + '</span>'
        +   '<div class="qty-stepper">'
        +     '<button type="button" data-qty-minus="' + p.id + '" aria-label="Diminuer la quantité">-</button>'
        +     '<span>' + i.qty + '</span>'
        +     '<button type="button" data-qty-plus="' + p.id + '" aria-label="Augmenter la quantité">+</button>'
        +   '</div>'
        +   '<button type="button" class="remove-link" data-remove="' + p.id + '">Supprimer</button>'
        + '</div></div>';
    }).join("");
  }
  const totals = cartTotals();
  document.getElementById("cartSubtotal").textContent = formatPrice(totals.subtotal);
  document.getElementById("cartTotal").textContent = formatPrice(totals.total);
  document.getElementById("startCheckout").disabled = cart.length === 0;
}
const cartItemsEl = document.getElementById("cartItems");
if (cartItemsEl){
  cartItemsEl.addEventListener("click", (e) => {
    const minus = e.target.closest("[data-qty-minus]");
    const plus = e.target.closest("[data-qty-plus]");
    const remove = e.target.closest("[data-remove]");
    if (minus) changeCartQty(Number(minus.dataset.qtyMinus), -1);
    if (plus) changeCartQty(Number(plus.dataset.qtyPlus), 1);
    if (remove) removeFromCart(Number(remove.dataset.remove));
  });
  document.getElementById("clearCartBtn").addEventListener("click", clearCart);
}

const cartScrim = document.getElementById("cartScrim");
const cartDrawer = document.getElementById("cartDrawer");
function openCart(){ if (cartDrawer) { cartDrawer.classList.add("is-open"); cartScrim.classList.add("is-visible"); } }
function closeCart(){ if (cartDrawer) { cartDrawer.classList.remove("is-open"); cartScrim.classList.remove("is-visible"); } }
const cartToggle = document.getElementById("cartToggle");
if (cartToggle && cartDrawer){
  cartToggle.addEventListener("click", openCart);
  document.getElementById("closeCart").addEventListener("click", closeCart);
  cartScrim.addEventListener("click", closeCart);
}

/* Notification légère "Produit ajouté au panier" */
function notify(message){
  let el = document.getElementById("toastNotice");
  if (!el){
    el = document.createElement("div");
    el.id = "toastNotice";
    el.setAttribute("role","status");
    el.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#372A22;color:#FBF7F3;padding:12px 22px;border-radius:999px;font-size:0.88rem;z-index:120;opacity:0;transition:opacity .2s ease, transform .2s ease;";
    document.body.appendChild(el);
  }
  el.textContent = message;
  requestAnimationFrame(() => { el.style.opacity = "1"; el.style.transform = "translateX(-50%) translateY(0)"; });
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateX(-50%) translateY(20px)"; }, 2200);
}

/* ==========================================================================
   PROCESSUS DE COMMANDE (CHECKOUT)
   ========================================================================== */
const checkoutScrim = document.getElementById("checkoutScrim");
let checkoutState = { name:"", phone:"", zone:"dakar", address:"", district:"", city:"Dakar", notes:"", paymentMethod:null, orderId:null };
let wavePaymentStartedAt = 0;
let waveReturnListener = null;

function openCheckout(){
  if (cart.length === 0) return;
  closeCart();
  renderCheckoutCartRecap();
  goToCheckoutStep(1);
  checkoutScrim.classList.add("is-visible");
}
function closeCheckout(){ if (checkoutScrim) checkoutScrim.classList.remove("is-visible"); }
const startCheckoutBtn = document.getElementById("startCheckout");
if (startCheckoutBtn && checkoutScrim){
  startCheckoutBtn.addEventListener("click", openCheckout);
  document.getElementById("closeCheckout").addEventListener("click", closeCheckout);
  checkoutScrim.addEventListener("click", (e) => { if (e.target === checkoutScrim) closeCheckout(); });
}

function renderCheckoutCartRecap(){
  const totals = cartTotals();
  document.getElementById("checkoutCartRecap").innerHTML = cart.map(i => {
    const p = getProduct(i.id);
    return '<div class="summary-row"><span>' + escapeXml(p.name) + ' x' + i.qty + '</span><span>' + formatPrice(p.price * i.qty) + '</span></div>';
  }).join("") + '<div class="summary-row total"><span>Sous-total</span><span>' + formatPrice(totals.subtotal) + '</span></div>';
}

function goToCheckoutStep(n){
  document.querySelectorAll(".checkout-step").forEach(s => s.classList.toggle("is-active", Number(s.dataset.step) === n));
  document.querySelectorAll(".progress-step").forEach((s, idx) => s.classList.toggle("is-done", idx < n));
  if (n === 4){
    document.getElementById("paymentAmount").textContent = formatPrice(cartTotals().total);
  }
}
document.querySelectorAll("[data-prev]").forEach(btn => btn.addEventListener("click", () => goToCheckoutStep(Number(btn.dataset.prev))));

function setFieldError(fieldId, hasError){
  document.getElementById(fieldId).classList.toggle("has-error", hasError);
}

const toStep2 = document.getElementById("toStep2");
if (toStep2) toStep2.addEventListener("click", () => goToCheckoutStep(2));

const toStep3 = document.getElementById("toStep3");
if (toStep3) toStep3.addEventListener("click", () => {
  const name = document.getElementById("ckName").value.trim();
  const phone = document.getElementById("ckPhone").value.trim();
  const phoneOk = /^[0-9+ ]{9,}$/.test(phone);
  setFieldError("ckFieldName", !name);
  setFieldError("ckFieldPhone", !phoneOk);
  if (!name || !phoneOk) return;
  checkoutState.name = name;
  checkoutState.phone = phone;
  goToCheckoutStep(3);
});

const toStep4 = document.getElementById("toStep4");
if (toStep4) toStep4.addEventListener("click", () => {
  const address = document.getElementById("ckAddress").value.trim();
  setFieldError("ckFieldAddress", !address);
  if (!address) return;
  checkoutState.address = address;
  checkoutState.zone = document.getElementById("ckZone").value;
  checkoutState.district = document.getElementById("ckDistrict").value.trim();
  checkoutState.city = document.getElementById("ckCity").value.trim();
  checkoutState.notes = document.getElementById("ckNotes").value.trim();
  goToCheckoutStep(4);
});

document.querySelectorAll(".payment-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".payment-card").forEach(c => c.setAttribute("aria-pressed","false"));
    card.setAttribute("aria-pressed","true");
    checkoutState.paymentMethod = card.dataset.method;
    document.getElementById("toStep5").disabled = false;
    if (card.dataset.method === "wave") initiateWavePayment();
    if (card.dataset.method === "orange") initiateOrangeMoneyPayment();
  });
});

function initiateWavePayment(){
  const banner = document.getElementById("paymentBanner");
  const waveUrl = "https://pay.wave.com/m/M_sn_5g5xdPQdjvDw/c/sn/";
  banner.innerHTML = 'Moyen choisi : <strong>Wave</strong>. Le paiement pourra être effectué après l’envoi de la commande : <a href="' + waveUrl + '" target="_blank" rel="noopener">Payer avec Wave</a>.';
  banner.classList.add("is-visible");
}
function initiateOrangeMoneyPayment(){
  const banner = document.getElementById("paymentBanner");
  const amount = formatPrice(cartTotals().total);
  banner.textContent = "Moyen choisi : Orange Money. Après l’envoi de la commande, envoyez " + amount + " au " + STORE_CONFIG.phone + ".";
  banner.classList.add("is-visible");
}
function confirmPayment(){
  checkoutState.orderId = "RP-" + new Date().getFullYear() + "-" + Date.now().toString().slice(-6);
  return { orderId: checkoutState.orderId, status: "en attente de confirmation" };
}

const toStep5 = document.getElementById("toStep5");
if (toStep5) toStep5.addEventListener("click", () => {
  if (!checkoutState.paymentMethod) return;
  const result = confirmPayment();
  const whatsappUrl = buildWhatsAppOrderLink(result.orderId);
  window.open(whatsappUrl, "_blank", "noopener");
  renderOrderRecap(result);
  goToCheckoutStep(5);
});

function renderOrderRecap(result){
  const totals = cartTotals();
  const zoneLabels = { dakar:"Dakar", retrait:"Retrait en boutique" };
  const paymentLabels = { wave:"Wave", orange:"Orange Money" };
  document.getElementById("orderRecap").innerHTML =
    '<dt>Numéro de commande</dt><dd>' + result.orderId + '</dd>'
    + '<dt>Client</dt><dd>' + escapeXml(checkoutState.name) + '</dd>'
    + '<dt>Livraison</dt><dd>' + (checkoutState.zone === "retrait" ? "Retrait en boutique (localisation à préciser)" : zoneLabels[checkoutState.zone] + ', ' + escapeXml(checkoutState.city) + ' (1 000 à 2 000 FCFA)') + '</dd>'
    + '<dt>Mode de paiement</dt><dd>' + paymentLabels[checkoutState.paymentMethod] + '</dd>'
    + '<dt>Statut du paiement</dt><dd>' + result.status + '</dd>'
    + '<dt>Total</dt><dd>' + formatPrice(totals.total) + '</dd>';

  document.getElementById("whatsappConfirmBtn").href = buildWhatsAppOrderLink(result.orderId);
}

const closeConfirmationBtn = document.getElementById("closeConfirmation");
if (closeConfirmationBtn) closeConfirmationBtn.addEventListener("click", () => {
  closeCheckout();
  clearCart();
  checkoutState = { name:"", phone:"", zone:"dakar", address:"", district:"", city:"Dakar", notes:"", paymentMethod:null, orderId:null };
  document.querySelectorAll(".payment-card").forEach(c => c.setAttribute("aria-pressed","false"));
  document.getElementById("toStep5").disabled = true;
  document.getElementById("paymentBanner").classList.remove("is-visible");
});

/* ==========================================================================
   MESSAGE WHATSAPP DE COMMANDE
   ========================================================================== */
function buildWhatsAppOrderLink(orderId){
  const totals = cartTotals();
  const zoneLabels = { dakar:"Dakar", retrait:"Retrait en boutique" };
  const paymentLabels = { wave:"Wave", orange:"Orange Money" };
  const lines = [
    "Nouvelle commande : " + STORE_CONFIG.name,
    "Nom du client : " + checkoutState.name,
    "Téléphone : " + checkoutState.phone,
    "Adresse : " + checkoutState.address + (checkoutState.district ? (", " + checkoutState.district) : ""),
    "Mode de remise : " + (checkoutState.zone === "retrait" ? "Retrait en boutique (localisation à préciser)" : "Livraison à Dakar"),
    "Mode de paiement : " + (paymentLabels[checkoutState.paymentMethod] || ""),
    "",
    "Produits commandés :"
  ];
  cart.forEach(i => {
    const p = getProduct(i.id);
    if (p) lines.push("- " + p.name + " x" + i.qty + " : " + formatPrice(p.price * i.qty));
  });
  lines.push("");
  lines.push("Sous-total : " + formatPrice(totals.subtotal));
  lines.push(checkoutState.zone === "retrait" ? "Retrait en boutique : localisation à préciser" : "Livraison à Dakar : 1 000 à 2 000 FCFA");
  lines.push("Total : " + formatPrice(totals.total));
  lines.push("Numéro de commande : " + orderId);
  const message = encodeURIComponent(lines.join("\n"));
  if (isPlaceholder(STORE_CONFIG.whatsapp)) return "#whatsapp-a-configurer";
  if (STORE_CONFIG.whatsapp.startsWith("http")) return STORE_CONFIG.whatsapp;
  return "https://wa.me/" + STORE_CONFIG.whatsapp + "?text=" + message;
}

function generalWhatsAppLink(){
  const message = encodeURIComponent("Bonjour " + STORE_CONFIG.name + ", j'ai une question sur vos produits.");
  if (isPlaceholder(STORE_CONFIG.whatsapp)) return "#whatsapp-a-configurer";
  if (STORE_CONFIG.whatsapp.startsWith("http")) return STORE_CONFIG.whatsapp;
  return "https://wa.me/" + STORE_CONFIG.whatsapp + "?text=" + message;
}

/* ==========================================================================
   RÉSEAUX SOCIAUX (footer + flottant, présents sur toutes les pages)
   ========================================================================== */
const SOCIAL_ICONS = {
  instagram:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>',
  facebook:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9h3V6h-3a4 4 0 0 0-4 4v2H7v3h3v6h3v-6h3l1-3h-4v-2a1 1 0 0 1 1-1z"/></svg>',
  tiktok:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4v9.5a3.5 3.5 0 1 1-3-3.46"/><path d="M14 4c.5 2.5 2 4 5 4.3"/></svg>',
  whatsapp:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z" opacity="0"/><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.7 14.2c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.5-3.9-4.6-4.1-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 1-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.2.1.4 0 .6-.1.2-.2.3-.4.5-.2.2-.4.4-.5.6-.2.2-.4.4-.2.7.2.4.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.9 1.8.3.1.5.1.7-.1.2-.2.8-.9 1-1.3.2-.3.4-.3.7-.2.3.1 1.7.8 2 .9.3.1.5.2.6.3.1.2.1.9-.1 1.5z"/></svg>'
};
function renderSocialLinks(){
  const links = [
    { key:"instagram", label:"Instagram", href: STORE_CONFIG.instagram.startsWith("[") ? "#" : STORE_CONFIG.instagram },
    { key:"facebook", label:"Facebook", href: STORE_CONFIG.facebook.startsWith("[") ? "#" : STORE_CONFIG.facebook },
    { key:"tiktok", label:"TikTok", href: STORE_CONFIG.tiktok.startsWith("[") ? "#" : STORE_CONFIG.tiktok },
    { key:"whatsapp", label:"WhatsApp", href: generalWhatsAppLink() }
  ];
  const html = links.map(l => '<a class="social-pill" href="' + l.href + '" target="_blank" rel="noopener">' + SOCIAL_ICONS[l.key] + '<span>' + l.label + '</span></a>').join("");
  const socialRow = document.getElementById("socialRow");
  if (socialRow) socialRow.innerHTML = html;
  const footerSocial = document.getElementById("footerSocial");
  if (footerSocial) footerSocial.innerHTML = html;
  const whatsappFloat = document.getElementById("whatsappFloat");
  if (whatsappFloat) whatsappFloat.href = generalWhatsAppLink();
  const footerWhatsapp = document.querySelector("#footerWhatsapp a");
  if (footerWhatsapp) footerWhatsapp.href = generalWhatsAppLink();
}

/* ==========================================================================
   INITIALISATION COMMUNE
   ========================================================================== */
renderSocialLinks();
renderCartCount();
renderCartDrawer();

/* Exposés pour les scripts spécifiques à chaque page (catalogue.js, home.js) */
window.__cartApi = { addToCart, removeFromCart, changeCartQty, clearCart, cartTotals, getCart: () => cart };
window.notify = notify;

})();
