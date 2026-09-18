const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const { rows } = await pool.query(`
      SELECT id, secteur, surface, type, situation, bo_ouverture,
             ST_AsGeoJSON(geom) AS geometry
      FROM secteurs
    `);
    res.status(200).json({
      type: 'FeatureCollection',
      features: rows.map(r => ({
        type: 'Feature',
        properties: {
          id: r.id, Secteur: r.secteur, Surface: r.surface,
          Type: r.type, Situation: r.situation, 'BO ouvertu': r.bo_ouverture
        },
        geometry: JSON.parse(r.geometry)
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
