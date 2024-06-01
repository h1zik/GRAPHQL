const bcrypt = require('bcryptjs');
const { pool } = require('../db/database');
const { generateToken, getUserFromToken } = require('../utils/auth');

module.exports = {
  createUser: async (_, { name, email, password }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    return { id: result.insertId, name, email };
  },
  loginUser: async (_, { email, password }) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) {
      throw new Error('User not found');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid password');
    }
    return generateToken(user);
  },
  createPost: async (_, { title, description }, { token }) => {
    if (!token) {
      throw new Error('You must be logged in to create a post');
    }
    const user = getUserFromToken(token);
    const [result] = await pool.query('INSERT INTO posts (title, description, user_id) VALUES (?, ?, ?)', [title, description, user.id]);
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [user.id]);
    const postUser = rows[0];
    return { id: result.insertId, title, description, user: postUser };
  },
  updatePost: async (_, { id, title, description }, { token }) => {
    if (!token) {
      throw new Error('You must be logged in to update a post');
    }
    const user = getUserFromToken(token);
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ? AND user_id = ?', [id, user.id]);
    if (rows.length === 0) {
      throw new Error('Post not found or you are not authorized to update it');
    }
    await pool.query('UPDATE posts SET title = ?, description = ? WHERE id = ?', [title || rows[0].title, description || rows[0].description, id]);
    const [updatedRows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    return updatedRows[0];
  },
  deletePost: async (_, { id }, { token }) => {
    if (!token) {
      throw new Error('You must be logged in to delete a post');
    }
    const user = getUserFromToken(token);
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ? AND user_id = ?', [id, user.id]);
    if (rows.length === 0) {
      throw new Error('Post not found or you are not authorized to delete it');
    }
    await pool.query('DELETE FROM posts WHERE id = ?', [id]);
    return rows[0];
  }
};
