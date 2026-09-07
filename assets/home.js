/* ==========================================================================
   PAGE D'ACCUEIL
   ========================================================================== */
(function(){
"use strict";

function renderRow(elementId, list){
  document.getElementById(elementId).innerHTML = list.map(productCardHtml).join("");
}
function renderNewArrivals(){ renderRow("newArrivalsRow", PRODUCTS.filter(p => p.badge === "nouveau").slice(0, 12)); }

document.getElementById("heroImage").src = placeholderImage("Rama's Parfumerie", "hero");
renderNewArrivals();

})();
