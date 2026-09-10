/* ==========================================================================
   DONNÉES DE LA BOUTIQUE — fichier chargé par toutes les pages
   Remplacez STORE_CONFIG, CATEGORIES et le contenu généré par PRODUCTS
   par vos vraies informations et votre vrai catalogue quand ils seront prêts.
   ========================================================================== */
"use strict";

/* ==========================================================================
   CONFIGURATION DE LA BOUTIQUE
   ========================================================================== */
const STORE_CONFIG = {
  name: "Rama's Parfumerie",
  whatsapp: "221781558813",
  phone: "+221 78 155 88 13",
  email: "niangramatoulaye4@gmail.com",
  address: "Thiaroye",
  instagram: "https://www.instagram.com/ramaniang81?utm_source=qr&stkn=MXZiZ2cwMnpkMDAx",
  facebook: "https://www.facebook.com/share/1DZ7AsTwfj/",
  tiktok: "https://www.tiktok.com/@ramsesse1?_r=1&_t=ZS-99XDhvMPcNk",
  deliveryFees: {
    dakar: "1 000 à 2 000 FCFA",
    retrait: "Localisation à préciser"
  }
};

/* ==========================================================================
   FAMILLES DE PRODUITS
   Chaque famille a sa propre page (onglet). "page" doit correspondre au nom
   du fichier HTML de cette famille.
   ========================================================================== */
const CATEGORIES = [
  { id:"parfums",      name:"Parfums",              description:"Des jus signature pour homme et femme.",       page:"produits-parfums.html" },
  { id:"brumes",       name:"Brumes corporelles",   description:"Une touche de fraîcheur légère au quotidien.", page:"produits-brumes.html" },
  { id:"huiles",       name:"Huiles parfumées",     description:"Des huiles nourrissantes et délicatement parfumées.", page:"produits-huiles.html" },
  { id:"soins",        name:"Soins du corps",       description:"Des textures riches pour une peau douce.",     page:"produits-soins.html" },
  { id:"capillaires",  name:"Produits capillaires", description:"Des soins pour des cheveux forts et brillants.", page:"produits-capillaires.html" },
  { id:"coffrets",     name:"Coffrets",             description:"Des sélections prêtes à offrir.",              page:"produits-coffrets.html" },
  { id:"accessoires",  name:"Accessoires",          description:"Pour prolonger et personnaliser votre routine.", page:"produits-accessoires.html" },
  { id:"thiouraye",    name:"Thiouraye (Encens)",  description:"Des encens parfumés pour une atmosphère chaleureuse.", page:"produits-thiouraye.html" }
];
const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

/* ==========================================================================
   CATALOGUE DE DÉMONSTRATION — GÉNÉRÉ AUTOMATIQUEMENT
   ------------------------------------------------------------------------
   Ceci N'EST PAS votre vrai catalogue. Le site doit pouvoir afficher des
   centaines de produits par famille : plutôt que de taper chaque produit
   à la main, ce générateur en fabrique un nombre raisonnable par famille
   à partir de listes de mots, pour que la structure (recherche, filtres,
   tri, pagination, fiche produit, panier) soit testée en conditions réelles.

   POUR PASSER À VOTRE VRAI CATALOGUE : remplacez le bloc "GÉNÉRATION" par
   un tableau PRODUCTS écrit à la main ou importé (export CSV/Excel converti
   en JSON), avec les mêmes champs que ci-dessous. Le nombre de produits par
   famille n'a pas de limite technique : le catalogue est déjà prévu pour
   des centaines d'articles (pagination "Charger plus" incluse).
   ========================================================================== */
const DEMO_WORDS = {
  parfums:     { nouns:["Ambre","Oud","Rose","Vanille","Musc Blanc","Santal","Iris","Cèdre","Fleur d'Oranger","Bergamote","Patchouli","Vétiver","Jasmin","Cardamome","Tabac Blond","Cuir","Figue","Pivoine","Safran","Noix de Coco","Bois de Gaïac","Fève Tonka","Poivre Rose","Néroli"], adjectives:["Doré","Précieux","Éternel","Intense","Signature","Royal","Nocturne","Délicat","Sauvage","Lumineux","Envoûtant","Absolu"], priceMin:22000, priceMax:52000, refPrefix:"PAR" },
  brumes:      { nouns:["Jasmin","Coco Vanille","Fleur de Cerisier","Pêche Blanche","Amande Douce","Fruits Rouges","Monoï","Karité Miel","Lotus","Mangue","Frangipanier","Citron Vert"], adjectives:["Fraîche","Légère","Douce","Estivale","Fondante","Solaire"], priceMin:9500, priceMax:16500, refPrefix:"BRU" },
  huiles:      { nouns:["Argan","Monoï","Coco","Amande Douce","Jojoba","Baobab","Sésame","Marula","Rose Musquée","Karité Liquide"], adjectives:["Sèche","Nourrissante","Précieuse","Satinée","Éclat","Réparatrice"], priceMin:10500, priceMax:19000, refPrefix:"HUI" },
  soins:       { nouns:["Karité","Beurre de Cacao","Gommage Sucre","Lait Corporel","Crème Mains","Baume Fondant","Huile de Douche","Exfoliant Doux"], adjectives:["Premium","Riche","Onctueux","Réparateur","Apaisant","Velouté"], priceMin:6500, priceMax:15000, refPrefix:"SOI" },
  capillaires: { nouns:["Sérum Brillance","Masque Nourrissant","Huile Fortifiante","Crème Coiffante","Shampoing Doux","Après-Shampoing","Spray Démêlant","Beurre Capillaire"], adjectives:["Intense","Réparateur","Fortifiant","Hydratant","Lissant"], priceMin:8000, priceMax:16500, refPrefix:"CAP" },
  coffrets:    { nouns:["Découverte Signature","Duo Brumes","Trio Parfums","Rituel Beauté","Voyage","Prestige","Cadeau Douceur","Éveil des Sens"], adjectives:["Signature","Élégant","Premium","Exclusif"], priceMin:28000, priceMax:72000, refPrefix:"COF" },
  accessoires: { nouns:["Pochette Voyage","Vaporisateur Rechargeable","Trousse Beauté","Porte-Flacon","Étui Velours","Miroir de Poche"], adjectives:["Compact","Élégant","Pratique","Voyage"], priceMin:4000, priceMax:13000, refPrefix:"ACC" },
  thiouraye:   { nouns:["Thiouraye Oud","Thiouraye Musc","Thiouraye Rose","Thiouraye Ambre","Encens Bois de Santal","Encens Vanille"], adjectives:["Oriental","Intense","Précieux","Envoûtant","Traditionnel","Doux"], priceMin:3500, priceMax:50000, refPrefix:"THI" }
};

/* Nombre de produits générés par famille. Montez ce chiffre librement
   (100, 300...) : tout le reste du site (filtres, pagination, fiches
   produit) suit automatiquement. */
const DEMO_PRODUCTS_PER_CATEGORY = 28;

function hashCode(str){
  let h = 0;
  for (let i=0; i<str.length; i++){ h = ((h<<5) - h) + str.charCodeAt(i); h |= 0; }
  return h;
}

function generateDemoProducts(){
  const list = [];
  let globalId = 1;
  CATEGORIES.forEach(cat => {
    const words = DEMO_WORDS[cat.id];
    if (!words) return;
    for (let i = 0; i < DEMO_PRODUCTS_PER_CATEGORY; i++){
      const adjective = words.adjectives[i % words.adjectives.length];
      const noun = words.nouns[(i + Math.floor(i / words.adjectives.length)) % words.nouns.length];
      const name = noun + " " + adjective;
      const seed = Math.abs(hashCode(cat.id + name + i));
      const range = words.priceMax - words.priceMin;
      const price = Math.round((words.priceMin + (seed % range)) / 500) * 500;
      const isPromo = i % 6 === 4;
      const oldPrice = isPromo ? Math.round((price * 1.18) / 500) * 500 : null;
      const isNew = !isPromo && i % 7 === 2;
      const badge = isPromo ? "promotion" : (isNew ? "nouveau" : null);
      const stock = i % 13 !== 12;
      const featured = i < 2;
      const popularity = 40 + (seed % 60);
      list.push({
        id: globalId++,
        name: name,
        categoryId: cat.id,
        description: "Un produit de la famille " + cat.name.toLowerCase() + ", pensé pour sublimer votre quotidien.",
        price: price,
        oldPrice: oldPrice,
        stock: stock,
        badge: badge,
        reference: words.refPrefix + "-" + String(i + 1).padStart(3, "0"),
        featured: featured,
        popularity: popularity
      });
    }
  });
  return list;
}

function loadManagedProducts() {
  if (typeof XMLHttpRequest === "undefined") return null;
  try {
    const request = new XMLHttpRequest();
    request.open("GET", "/api/products", false);
    request.send(null);
    if (request.status !== 200) return null;
    const payload = JSON.parse(request.responseText);
    return payload.managed ? payload.products : null;
  } catch (error) {
    return null;
  }
}

const PRODUCTS = loadManagedProducts() || generateDemoProducts();
window.STORE_PRODUCTS = PRODUCTS;

function getProduct(id){ return PRODUCTS.find(p => p.id === id); }
function getProductsByCategory(categoryId){ return PRODUCTS.filter(p => p.categoryId === categoryId); }

/* ==========================================================================
   OUTILS PARTAGÉS
   ========================================================================== */
function formatPrice(n){
  return n.toLocaleString("fr-FR").replace(/\u202f|,/g, " ") + " FCFA";
}
function escapeXml(s){
  return String(s).replace(/[<>&'"]/g, c => ({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;","\"":"&quot;"}[c]));
}
/* Génère une image de remplacement en SVG (aucune dépendance externe). */
function placeholderImage(label, seed){
  const tones = ["#E2C2B9","#DECBBD","#C2A497","#EEDFD3"];
  const bg = tones[Math.abs(hashCode(seed || label)) % tones.length];
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">'
    + '<rect width="400" height="500" fill="' + bg + '"/>'
    + '<g opacity="0.55">'
    + '<rect x="160" y="190" width="80" height="150" rx="16" fill="#FBF7F3"/>'
    + '<rect x="178" y="150" width="44" height="46" rx="8" fill="#FBF7F3"/>'
    + '<rect x="188" y="126" width="24" height="30" rx="5" fill="#5C4437"/>'
    + '</g>'
    + '<text x="200" y="440" text-anchor="middle" font-family="Work Sans, sans-serif" font-size="15" fill="#5C4437">' + escapeXml(label) + '</text>'
    + '<text x="200" y="462" text-anchor="middle" font-family="Work Sans, sans-serif" font-size="11" fill="#6E5C4F">Image à venir</text>'
    + '</svg>';
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
function isPlaceholder(value){
  return typeof value === "string" && value.trim().startsWith("[");
}
