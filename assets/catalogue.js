/* ==========================================================================
   CATALOGUE D'UNE FAMILLE DE PRODUITS
   Chaque page produits-*.html définit window.CATALOGUE_CATEGORY avant de
   charger ce script. Prévu pour des centaines de produits : la pagination
   "Charger plus" évite d'afficher toute la famille d'un coup.
   ========================================================================== */
(function(){
"use strict";
window.CATALOGUE_PAGE = true;

const categoryId = window.CATALOGUE_CATEGORY;
const PAGE_SIZE = 24;
const PRICE_LIMITS = { parfums:70000, brumes:70000, huiles:70000, soins:65000, capillaires:50000, coffrets:65000, accessoires:30000 };

const urlParams = new URLSearchParams(window.location.search);

let filters = {
  search: urlParams.get("q") || "",
  maxPrice: 80000,
  onlyNew: false,
  onlyPromo: false,
  onlyStock: false,
  sort: "popularite"
};
let visibleCount = PAGE_SIZE;

const allInCategory = getProductsByCategory(categoryId);
const maxPriceInCategory = allInCategory.reduce((max, p) => Math.max(max, p.price), 0);
const priceLimit = PRICE_LIMITS[categoryId] || maxPriceInCategory || 80000;
filters.maxPrice = priceLimit;

function getFilteredProducts(){
  let list = allInCategory.filter(p => {
    if (filters.onlyNew && p.badge !== "nouveau") return false;
    if (filters.onlyPromo && p.badge !== "promotion") return false;
    if (filters.onlyStock && !p.stock) return false;
    if (p.price > filters.maxPrice) return false;
    if (filters.search){
      const term = filters.search.toLowerCase();
      const haystack = (p.name + " " + p.description).toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
  switch (filters.sort){
    case "prix-asc": list.sort((a,b) => a.price - b.price); break;
    case "prix-desc": list.sort((a,b) => b.price - a.price); break;
    case "nouveautes": list.sort((a,b) => (b.badge === "nouveau") - (a.badge === "nouveau") || b.id - a.id); break;
    default: list.sort((a,b) => b.popularity - a.popularity);
  }
  return list;
}

function renderCatalogue(){
  const results = getFilteredProducts();
  const container = document.getElementById("catalogueResults");
  const loadMoreRow = document.getElementById("loadMoreRow");
  if (results.length === 0){
    container.innerHTML = '<div class="empty-state"><p>Aucun produit ne correspond à votre recherche dans cette famille.</p><button class="btn btn-secondary" id="resetFilters">Réinitialiser les filtres</button></div>';
    document.getElementById("resetFilters").addEventListener("click", resetFilters);
    loadMoreRow.innerHTML = "";
    return;
  }
  const shown = results.slice(0, visibleCount);
  container.innerHTML = '<div class="product-grid">' + shown.map(productCardHtml).join("") + '</div>';

  if (shown.length < results.length){
    loadMoreRow.innerHTML =
      '<span class="load-more-count">' + shown.length + ' sur ' + results.length + ' produits affichés</span>'
      + '<button class="btn btn-secondary" id="loadMoreBtn" type="button">Charger plus de produits</button>';
    document.getElementById("loadMoreBtn").addEventListener("click", () => {
      visibleCount += PAGE_SIZE;
      renderCatalogue();
    });
  } else {
    loadMoreRow.innerHTML = '<span class="load-more-count">' + results.length + ' produit' + (results.length > 1 ? 's' : '') + ' au total dans cette famille</span>';
  }
}

function resetFilters(){
  filters = { search:"", maxPrice: priceLimit, onlyNew:false, onlyPromo:false, onlyStock:false, sort:"popularite" };
  visibleCount = PAGE_SIZE;
  document.getElementById("catalogueSearch").value = "";
  document.getElementById("filterNew").checked = false;
  document.getElementById("filterPromo").checked = false;
  document.getElementById("filterStock").checked = false;
  document.getElementById("maxPrice").max = filters.maxPrice;
  document.getElementById("maxPrice").value = filters.maxPrice;
  document.getElementById("maxPriceValue").textContent = formatPrice(filters.maxPrice);
  document.getElementById("sortSelect").value = "popularite";
  renderCatalogue();
}

document.getElementById("catalogueSearch").addEventListener("input", (e) => { filters.search = e.target.value; visibleCount = PAGE_SIZE; renderCatalogue(); });
document.getElementById("clearSearch").addEventListener("click", () => { filters.search = ""; document.getElementById("catalogueSearch").value = ""; visibleCount = PAGE_SIZE; renderCatalogue(); });
document.getElementById("filterNew").addEventListener("change", (e) => { filters.onlyNew = e.target.checked; visibleCount = PAGE_SIZE; renderCatalogue(); });
document.getElementById("filterPromo").addEventListener("change", (e) => { filters.onlyPromo = e.target.checked; visibleCount = PAGE_SIZE; renderCatalogue(); });
document.getElementById("filterStock").addEventListener("change", (e) => { filters.onlyStock = e.target.checked; visibleCount = PAGE_SIZE; renderCatalogue(); });
document.getElementById("maxPrice").addEventListener("input", (e) => {
  filters.maxPrice = Number(e.target.value);
  document.getElementById("maxPriceValue").textContent = formatPrice(filters.maxPrice);
  visibleCount = PAGE_SIZE;
  renderCatalogue();
});
document.getElementById("sortSelect").addEventListener("change", (e) => { filters.sort = e.target.value; visibleCount = PAGE_SIZE; renderCatalogue(); });

/* Reçoit une recherche envoyée depuis la barre de recherche de l'en-tête. */
window.applyHeaderSearch = function(term){
  filters.search = term;
  document.getElementById("catalogueSearch").value = term;
  visibleCount = PAGE_SIZE;
  renderCatalogue();
  document.getElementById("catalogueToolbar").scrollIntoView({ behavior:"smooth" });
};

/* ==========================================================================
   INITIALISATION DE LA PAGE
   ========================================================================== */
document.getElementById("catalogueSearch").value = filters.search;
document.getElementById("maxPrice").max = filters.maxPrice;
document.getElementById("maxPrice").value = filters.maxPrice;
document.getElementById("maxPriceValue").textContent = formatPrice(filters.maxPrice);
document.getElementById("familyProductCount").textContent = allInCategory.length + " produit" + (allInCategory.length > 1 ? "s" : "");
renderCatalogue();

})();
