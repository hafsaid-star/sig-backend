// ==========================================================
// Backend du Portail SIG Remembrement
// Expose une API qui lit les données depuis Supabase
// ==========================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- Route de test ---
app.get('/', (req, res) => {
  res.json({ message: 'API du Portail SIG Remembrement en ligne ✅' });
});

// --- Secteurs (renvoie du GeoJSON, compatible directement avec Leaflet) ---
app.get('/api/secteurs', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, secteur, surface, type, situation, bo_ouverture,
             ST_AsGeoJSON(geom) AS geometry
      FROM secteurs
    `);
    res.json({
      type: 'FeatureCollection',
      features: rows.map(r => ({
        type: 'Feature',
        properties: {
          id: r.id,
          Secteur: r.secteur,
          Surface: r.surface,
          Type: r.type,
          Situation: r.situation,
          'BO ouvertu': r.bo_ouverture
        },
        geometry: JSON.parse(r.geometry)
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Projets ---
app.get('/api/projects', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM projects ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API démarrée sur http://localhost:${PORT}`);
});
