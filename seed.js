require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./config/db');

async function seed() {
  try {
    console.log('Seeding database...');

    // Clear existing data (order matters due to FK constraints)
    await pool.query('DELETE FROM posts');
    await pool.query('DELETE FROM categories');
    await pool.query('DELETE FROM users');
    await pool.query('ALTER TABLE posts AUTO_INCREMENT = 1');
    await pool.query('ALTER TABLE categories AUTO_INCREMENT = 1');
    await pool.query('ALTER TABLE users AUTO_INCREMENT = 1');

    // Users
    const password = await bcrypt.hash('password123', 10);
    const [jason] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      ['Jason', 'jason@example.com', password]
    );
    const [olly] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      ['Olly', 'olly@example.com', password]
    );

    // Categories
    const categories = [
      { name: 'Technology', slug: 'technology' },
      { name: 'Travel', slug: 'travel' },
      { name: 'Food', slug: 'food' }
    ];
    const categoryIds = {};
    for (const c of categories) {
      const [result] = await pool.query(
        'INSERT INTO categories (name, slug) VALUES (?, ?)',
        [c.name, c.slug]
      );
      categoryIds[c.slug] = result.insertId;
    }

    // Posts
    const posts = [
      {
        title: 'Getting Started with REST APIs',
        content: 'A beginner-friendly walkthrough of building your first REST API with Express and MySQL.',
        author_id: jason.insertId,
        category_id: categoryIds.technology
      },
      {
        title: 'Five Days in Lisbon',
        content: 'Notes and recommendations from a short trip exploring Lisbon\'s neighborhoods and food scene.',
        author_id: jason.insertId,
        category_id: categoryIds.travel
      },
      {
        title: 'The Perfect Weeknight Pasta',
        content: 'A quick, reliable pasta recipe that works with whatever vegetables you have on hand.',
        author_id: olly.insertId,
        category_id: categoryIds.food
      },
      {
        title: 'Why I Switched to TypeScript',
        content: 'A look back at moving a mid-sized Node.js project from plain JavaScript to TypeScript.',
        author_id: olly.insertId,
        category_id: categoryIds.technology
      }
    ];

    for (const p of posts) {
      await pool.query(
        'INSERT INTO posts (title, content, author_id, category_id) VALUES (?, ?, ?, ?)',
        [p.title, p.content, p.author_id, p.category_id]
      );
    }

    console.log('Seed complete.');
    console.log('Test accounts:');
    console.log('  jason@example.com / password123');
    console.log('  olly@example.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();