const pool = require('../config/db');

const POST_SELECT = `
  SELECT
    p.id, p.title, p.content, p.created_at, p.updated_at,
    u.id AS author_id, u.name AS author_name,
    c.id AS category_id, c.name AS category_name, c.slug AS category_slug
  FROM posts p
  JOIN users u ON p.author_id = u.id
  LEFT JOIN categories c ON p.category_id = c.id
`;

function shapePost(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: { id: row.author_id, name: row.author_name },
    category: row.category_id
      ? { id: row.category_id, name: row.category_name, slug: row.category_slug }
      : null
  };
}

// GET /api/posts?category=slug&page=1&limit=10
exports.getPosts = async (req, res) => {
  try {
    const { category } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const offset = (page - 1) * limit;

    let query = POST_SELECT;
    const params = [];

    if (category) {
      query += ' WHERE c.slug = ?';
      params.push(category);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    res.json({ page, limit, count: rows.length, posts: rows.map(shapePost) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching posts.' });
  }
};

// GET /api/posts/:id
exports.getPostById = async (req, res) => {
  try {
    const [rows] = await pool.query(`${POST_SELECT} WHERE p.id = ?`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Post not found.' });
    res.json(shapePost(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching post.' });
  }
};

// POST /api/posts (auth required)
exports.createPost = async (req, res) => {
  try {
    const { title, content, category_id } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'title and content are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO posts (title, content, author_id, category_id) VALUES (?, ?, ?, ?)',
      [title, content, req.user.id, category_id || null]
    );

    const [rows] = await pool.query(`${POST_SELECT} WHERE p.id = ?`, [result.insertId]);
    res.status(201).json(shapePost(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating post.' });
  }
};

// PUT /api/posts/:id (auth required, must own post)
exports.updatePost = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Post not found.' });

    const post = rows[0];
    if (post.author_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own posts.' });
    }

    const title = req.body.title ?? post.title;
    const content = req.body.content ?? post.content;
    const category_id = req.body.category_id !== undefined ? req.body.category_id : post.category_id;

    await pool.query(
      'UPDATE posts SET title = ?, content = ?, category_id = ? WHERE id = ?',
      [title, content, category_id, post.id]
    );

    const [updated] = await pool.query(`${POST_SELECT} WHERE p.id = ?`, [post.id]);
    res.json(shapePost(updated[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating post.' });
  }
};

// DELETE /api/posts/:id (auth required, must own post)
exports.deletePost = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Post not found.' });

    const post = rows[0];
    if (post.author_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own posts.' });
    }

    await pool.query('DELETE FROM posts WHERE id = ?', [post.id]);
    res.json({ message: 'Post deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting post.' });
  }
};
