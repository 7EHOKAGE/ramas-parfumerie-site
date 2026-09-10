const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || 'true') === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;
const TO_EMAIL = process.env.TO_EMAIL || 'niangramatoulaye4@gmail.com';
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function readManagedProducts() {
  if (!fs.existsSync(PRODUCTS_FILE)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Products file read failed:', error);
    return [];
  }
}

function writeManagedProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2) + '\n', 'utf8');
}

function normalizeProduct(input, id) {
  const price = Number(input.price);
  const oldPrice = input.oldPrice === '' || input.oldPrice == null ? null : Number(input.oldPrice);
  return {
    id,
    name: String(input.name || '').trim(),
    categoryId: String(input.categoryId || '').trim(),
    description: String(input.description || '').trim(),
    price: Number.isFinite(price) ? price : 0,
    oldPrice: Number.isFinite(oldPrice) ? oldPrice : null,
    stock: input.stock !== false,
    badge: ['nouveau', 'promotion'].includes(input.badge) ? input.badge : null,
    reference: String(input.reference || '').trim(),
    image: String(input.image || '').trim(),
    featured: input.featured === true,
    popularity: Number(input.popularity) || 50
  };
}

app.get('/api/products', (_req, res) => {
  const products = readManagedProducts();
  res.json({ managed: products !== null, products: products || [] });
});

app.put('/api/products', (req, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ ok: false, message: 'Le catalogue doit être un tableau de produits.' });
  }
  writeManagedProducts(req.body);
  res.json({ ok: true, count: req.body.length });
});

app.post('/api/products', (req, res) => {
  const products = readManagedProducts() || [];
  const product = normalizeProduct(req.body || {}, products.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1);
  if (!product.name || !product.categoryId || product.price <= 0) {
    return res.status(400).json({ ok: false, message: 'Nom, famille et prix sont obligatoires.' });
  }
  products.push(product);
  writeManagedProducts(products);
  res.status(201).json({ ok: true, product });
});

app.put('/api/products/:id', (req, res) => {
  const products = readManagedProducts() || [];
  const id = Number(req.params.id);
  const index = products.findIndex(item => Number(item.id) === id);
  if (index < 0) return res.status(404).json({ ok: false, message: 'Produit introuvable.' });
  const product = normalizeProduct(req.body || {}, id);
  if (!product.name || !product.categoryId || product.price <= 0) {
    return res.status(400).json({ ok: false, message: 'Nom, famille et prix sont obligatoires.' });
  }
  products[index] = product;
  writeManagedProducts(products);
  res.json({ ok: true, product });
});

app.delete('/api/products/:id', (req, res) => {
  const products = readManagedProducts() || [];
  const id = Number(req.params.id);
  const remaining = products.filter(item => Number(item.id) !== id);
  if (remaining.length === products.length) return res.status(404).json({ ok: false, message: 'Produit introuvable.' });
  writeManagedProducts(remaining);
  res.json({ ok: true });
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.static(__dirname));

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

app.post('/api/newsletter', async (req, res) => {
  const email = (req.body && (req.body.email || req.body.Email)) || '';

  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, message: 'Adresse e-mail invalide.' });
  }

  if (!SMTP_USER || !SMTP_PASS) {
    return res.status(500).json({
      ok: false,
      message: 'SMTP non configuré. Ajoute SMTP_USER et SMTP_PASS dans le fichier .env.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: SMTP_FROM,
      to: TO_EMAIL,
      replyTo: email,
      subject: 'Nouvelle inscription newsletter - Rama\'s Parfumerie',
      text: [
        'Nouvelle inscription newsletter.',
        '',
        'Email : ' + email,
        '',
        'Merci.',
      ].join('\n'),
      html: `
        <h3>Nouvelle inscription newsletter</h3>
        <p><strong>Email :</strong> ${email}</p>
        <p>Merci.</p>
      `,
    });

    return res.status(200).json({ ok: true, message: 'Inscription enregistrée.' });
  } catch (error) {
    console.error('Newsletter send failed:', error);
    return res.status(500).json({
      ok: false,
      message: 'Échec de l\'envoi. Vérifie les identifiants SMTP et le mot de passe d\'application Gmail.'
    });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, status: 'server-running' });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
