const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');

// ── DATABASE SETUP ──────────────────────────────────────────
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS app_data (
    id   INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL DEFAULT '{}'
  );
  INSERT OR IGNORE INTO app_data (id, data) VALUES (1, '{"stores":[]}');
`);

const getStmt  = db.prepare('SELECT data FROM app_data WHERE id = 1');
const saveStmt = db.prepare('UPDATE app_data SET data = ? WHERE id = 1');

// ── MIDDLEWARE ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── API ─────────────────────────────────────────────────────
app.get('/api/data', (req, res) => {
  const row = getStmt.get();
  res.json(JSON.parse(row.data));
});

app.post('/api/data', (req, res) => {
  saveStmt.run(JSON.stringify(req.body));
  res.json({ ok: true });
});

// ── START ───────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
