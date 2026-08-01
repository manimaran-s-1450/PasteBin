const { pool } = require('../config/db');

async function createUser({ fullName, username, email, password }) {
  const [result] = await pool.execute(
    'INSERT INTO users (full_name, username, email, password, password_hash) VALUES (?, ?, ?, ?, ?)',
    [
      fullName ? fullName.trim() : null,
      username.toLowerCase().trim(),
      email.toLowerCase().trim(),
      password,
      password
    ]
  );
  return { id: result.insertId, full_name: fullName, username, email };
}

async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email.toLowerCase().trim()]
  );
  return rows[0] || null;
}

async function findUserByUsername(username) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE username = ?',
    [username.toLowerCase().trim()]
  );
  return rows[0] || null;
}

async function findUserById(id) {
  const [rows] = await pool.execute(
    'SELECT id, full_name, username, email, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById
};
