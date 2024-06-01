const { pool } = require('../db/database');

module.exports = {
  users: async () => {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows;
  },
  posts: async () => {
    const [rows] = await pool.query('SELECT * FROM posts');
    return rows;
  }
};
