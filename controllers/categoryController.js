const pool = require('../config/db');

exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching categories.' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required.' });

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const [result] = await pool.query(
      'INSERT INTO categories (name, slug) VALUES (?, ?)',
      [name, slug]
    );
    res.status(201).json({ id: result.insertId, name, slug });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Category already exists.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error creating category.' });
  }
};
