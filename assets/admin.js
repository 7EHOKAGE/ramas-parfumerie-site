"use strict";

const categories = [
  { id:"parfums", name:"Parfums" },
  { id:"brumes", name:"Brumes corporelles" },
  { id:"huiles", name:"Huiles parfumées" },
  { id:"soins", name:"Soins du corps" },
  { id:"capillaires", name:"Produits capillaires" },
  { id:"coffrets", name:"Coffrets" },
  { id:"accessoires", name:"Accessoires" },
  { id:"thiouraye", name:"Thiouraye (Encens)" }
];

let products = [];
let editingId = null;
let activeCategory = "";
let managedProducts = false;
const byId = id => document.getElementById(id);
const categoryName = id => (categories.find(category => category.id === id) || {}).name || id;
const escapeHtml = value => String(value || "").replace(/[&<>"']/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;", "'":"&#039;"}[character]));
const adminFormatPrice = value => Number(value || 0).toLocaleString("fr-FR").replace(/\u202f/g, " ") + " FCFA";

function setNotice(message, isError) {
  const notice = byId("adminNotice");
  notice.textContent = message || "";
  notice.classList.toggle("is-error", Boolean(isError));
}
function setFormError(message) { byId("formError").textContent = message || ""; }
function fillCategorySelects() {
  byId("productCategory").innerHTML = categories.map(category => '<option value="' + category.id + '">' + category.name + '</option>').join("");
  byId("adminFamilyTabs").innerHTML = '<button class="admin-family-tab is-active" type="button" data-category="">Toutes</button>' + categories.map(category => '<button class="admin-family-tab" type="button" data-category="' + category.id + '">' + category.name + '</button>').join("");
}
function resetForm() {
  editingId = null;
  byId("productForm").reset();
  byId("productId").value = "";
  byId("productStock").checked = true;
  byId("productPopularity").value = "50";
  byId("productImageFile").value = "";
  byId("imagePreview").innerHTML = "<span>Aucune photo sélectionnée</span>";
  byId("formTitle").textContent = "Nouveau produit";
  byId("saveProductBtn").textContent = "Ajouter le produit";
  byId("saveProductTop").textContent = "Ajouter";
  setFormError("");
}
function editProduct(product) {
  editingId = product.id;
  byId("productId").value = product.id;
  byId("productName").value = product.name || "";
  byId("productCategory").value = product.categoryId;
  byId("productPrice").value = product.price || "";
  byId("productOldPrice").value = product.oldPrice || "";
  byId("productReference").value = product.reference || "";
  byId("productDescription").value = product.description || "";
  byId("productImage").value = product.image || "";
  byId("productImageFile").value = "";
  byId("imagePreview").innerHTML = product.image ? '<img src="' + escapeHtml(product.image) + '" alt="Aperçu du produit">' : "<span>Aucune photo sélectionnée</span>";
  byId("productBadge").value = product.badge || "";
  byId("productPopularity").value = product.popularity || 50;
  byId("productStock").checked = product.stock !== false;
  byId("productFeatured").checked = product.featured === true;
  byId("formTitle").textContent = "Modifier le produit";
  byId("saveProductBtn").textContent = "Enregistrer les modifications";
  byId("saveProductTop").textContent = "Enregistrer";
  byId("productFormPanel").scrollIntoView({ behavior:"smooth", block:"start" });
}
function visibleProducts() {
  const term = byId("adminSearch").value.trim().toLowerCase();
  const category = activeCategory;
  return products.filter(product => {
    if (category && product.categoryId !== category) return false;
    return !term || (product.name + " " + product.reference + " " + product.description).toLowerCase().includes(term);
  });
}
function renderProducts() {
  const list = byId("adminProductList");
  const filtered = visibleProducts();
  byId("catalogueTitle").textContent = filtered.length + " produit" + (filtered.length > 1 ? "s" : "") + " réel" + (filtered.length > 1 ? "s" : "");
  if (!filtered.length) {
    list.innerHTML = '<div class="admin-empty">Aucun produit réel pour ce filtre. Ajoutez votre premier produit avec le formulaire.</div>';
    return;
  }
  list.innerHTML = filtered.map(product => {
    const image = product.image || "assets/logo-ramas-parfumerie.png";
    const badge = product.badge ? '<span class="admin-badge ' + (product.badge === "promotion" ? "promo" : "") + '">' + (product.badge === "promotion" ? "Promotion" : "Nouveau") + '</span>' : '';
    return '<article class="admin-product-row">'
      + '<img class="admin-product-thumb" src="' + escapeHtml(image) + '" alt="">'
      + '<div class="admin-product-main"><strong>' + escapeHtml(product.name) + badge + '</strong><span>' + escapeHtml(categoryName(product.categoryId)) + ' · ' + escapeHtml(product.reference || "Sans référence") + '</span></div>'
      + '<div class="admin-product-price">' + adminFormatPrice(product.price) + (product.oldPrice ? '<span class="admin-product-meta">Ancien prix : ' + adminFormatPrice(product.oldPrice) + '</span>' : '') + '</div>'
      + '<div class="admin-product-status ' + (product.stock ? '' : 'is-out') + '">' + (product.stock ? "En stock" : "Rupture de stock") + '</div>'
      + '<div class="admin-product-actions"><button class="btn btn-secondary" type="button" data-edit="' + product.id + '">Modifier</button><button class="btn btn-ghost" type="button" data-stock="' + product.id + '">' + (product.stock ? 'Marquer rupture' : 'Remettre en stock') + '</button><button class="btn btn-ghost" type="button" data-delete="' + product.id + '">Supprimer</button></div>'
      + '</article>';
  }).join("");
}
async function loadProducts() {
  try {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error("API indisponible");
    const payload = await response.json();
    managedProducts = payload.managed;
    products = payload.managed ? payload.products : (window.STORE_PRODUCTS || []);
    renderProducts();
  } catch (error) {
    managedProducts = false;
    products = window.STORE_PRODUCTS || [];
    renderProducts();
    setNotice("Mode consultation : le serveur catalogue n'est pas connecté.", true);
  }
}
async function ensureManagedProducts() {
  if (managedProducts) return;
  const response = await fetch("/api/products", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(products) });
  if (!response.ok) throw new Error("Impossible de sauvegarder le catalogue de départ.");
  managedProducts = true;
}
function readSelectedImage() {
  const file = byId("productImageFile").files[0];
  if (!file) return Promise.resolve(byId("productImage").value.trim());
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Impossible de lire la photo sélectionnée."));
    reader.readAsDataURL(file);
  });
}
async function formProduct() {
  const image = await readSelectedImage();
  return {
    name: byId("productName").value.trim(), categoryId: byId("productCategory").value,
    price: Number(byId("productPrice").value), oldPrice: byId("productOldPrice").value,
    reference: byId("productReference").value.trim(), description: byId("productDescription").value.trim(),
    image, badge: byId("productBadge").value || null,
    popularity: Number(byId("productPopularity").value) || 50, stock: byId("productStock").checked, featured: byId("productFeatured").checked
  };
}
byId("productForm").addEventListener("submit", async event => {
  event.preventDefault(); setFormError("");
  const payload = await formProduct();
  if (!payload.name || !payload.categoryId || !payload.price || payload.price <= 0) { setFormError("Le nom, la famille et un prix valide sont obligatoires."); return; }
  const url = editingId ? "/api/products/" + editingId : "/api/products";
  try {
    await ensureManagedProducts();
    const response = await fetch(url, { method: editingId ? "PUT" : "POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Enregistrement impossible.");
    setNotice(editingId ? "Produit modifié." : "Produit ajouté.");
    resetForm(); await loadProducts();
  } catch (error) { setFormError(error.message); }
});
byId("adminProductList").addEventListener("click", async event => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");
  const stockButton = event.target.closest("[data-stock]");
  if (editButton) { const product = products.find(item => Number(item.id) === Number(editButton.dataset.edit)); if (product) editProduct(product); }
  if (stockButton) {
    const product = products.find(item => Number(item.id) === Number(stockButton.dataset.stock));
    if (!product) return;
    await ensureManagedProducts();
    const response = await fetch("/api/products/" + product.id, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ...product, stock:!product.stock }) });
    if (response.ok) { setNotice(product.stock ? "Produit marqué en rupture de stock." : "Produit remis en stock."); await loadProducts(); }
    return;
  }
  if (deleteButton) {
    const product = products.find(item => Number(item.id) === Number(deleteButton.dataset.delete));
    if (!product || !window.confirm("Supprimer « " + product.name + " » ?")) return;
    await ensureManagedProducts();
    const response = await fetch("/api/products/" + product.id, { method:"DELETE" });
    if (response.ok) { setNotice("Produit supprimé."); if (editingId === product.id) resetForm(); await loadProducts(); }
  }
});
byId("newProductBtn").addEventListener("click", () => { resetForm(); byId("productFormPanel").scrollIntoView({ behavior:"smooth" }); });
byId("resetFormBtn").addEventListener("click", resetForm);
byId("adminSearch").addEventListener("input", renderProducts);
byId("productImageFile").addEventListener("change", () => {
  const file = byId("productImageFile").files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { byId("imagePreview").innerHTML = '<img src="' + reader.result + '" alt="Aperçu du produit">'; };
  reader.readAsDataURL(file);
});
byId("adminFamilyTabs").addEventListener("click", event => {
  const tab = event.target.closest("[data-category]");
  if (!tab) return;
  activeCategory = tab.dataset.category;
  byId("adminFamilyTabs").querySelectorAll(".admin-family-tab").forEach(button => button.classList.toggle("is-active", button === tab));
  renderProducts();
});
fillCategorySelects(); resetForm(); loadProducts();
