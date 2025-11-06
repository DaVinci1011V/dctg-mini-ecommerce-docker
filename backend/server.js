const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

// ---------- middleware ----------
app.use(cors());
app.use(express.json());

// Serve the static frontend from /app/frontend (in Docker)
app.use(express.static(path.join(__dirname, 'frontend')));

// ---------- Swagger UI ----------
try {
  // openapi.yaml is mounted to /app/openapi.yaml
  const swaggerDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.warn('OpenAPI not loaded:', e.message);
}

// ---------- sqlite3 setup ----------
const dbFile = path.join(__dirname, 'data.db');
if (!fs.existsSync(dbFile)) fs.closeSync(fs.openSync(dbFile, 'w'));
const db = new sqlite3.Database(dbFile);

// Promisified helpers
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}
function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}
function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

// ---------- schema + seed ----------
(async () => {
  await runAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      inStock INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const row = await getAsync('SELECT COUNT(*) AS count FROM products;');
  if (!row || row.count === 0) {
    await runAsync(
      `INSERT INTO products (name, price, category, inStock) VALUES
       ('USB-C Cable', 29.90, 'Accessories', 1),
       ('Wireless Mouse', 89.00, 'Electronics', 1),
       ('Mechanical Keyboard', 350.00, 'Electronics', 0),
       ('Notebook A5', 15.00, 'Stationery', 1);`
    );
  }
})().catch(err => {
  console.error('DB init error:', err);
  process.exit(1);
});

// ---------- auth ----------
app.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ sub: username, role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const [scheme, token] = auth.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ---------- products ----------
app.get('/products', async (req, res) => {
  try {
    const { category, inStock, page = 1, limit = 10 } = req.query;
    const params = [];
    const where = [];

    if (category) { where.push('category = ?'); params.push(category); }
    if (typeof inStock !== 'undefined' && inStock !== '') {
      where.push('inStock = ?'); params.push((inStock === '1' || inStock === 'true') ? 1 : 0);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (Number(page) - 1) * Number(limit);

    const data = await allAsync(
      `SELECT * FROM products ${whereSql} ORDER BY createdAt DESC LIMIT ? OFFSET ?;`,
      [...params, Number(limit), offset]
    );
    const totalRow = await getAsync(`SELECT COUNT(*) AS total FROM products ${whereSql};`, params);

    res.json({ data, page: Number(page), limit: Number(limit), total: totalRow.total });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

app.post('/products', requireAuth, async (req, res) => {
  try {
    const { name, price, category, inStock } = req.body || {};
    if (!name || typeof price === 'undefined' || !category) {
      return res.status(400).json({ error: 'name, price, category are required' });
    }
    const stock = (inStock === false || inStock === 0) ? 0 : 1;

    const result = await runAsync(
      `INSERT INTO products (name, price, category, inStock) VALUES (?, ?, ?, ?);`,
      [name, Number(price), category, stock]
    );
    const item = await getAsync(`SELECT * FROM products WHERE id = ?;`, [result.lastID]);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// ---------- health ----------
app.get('/health', (_req, res) => res.json({ ok: true }));

// ---------- SPA fallback ----------
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ---------- start ----------
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/docs`);
});
