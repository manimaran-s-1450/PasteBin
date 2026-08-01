const { pool } = require('../config/db');

async function createUser({ fullName, username, email, password }) {
  const [result] = await pool.execute(
    'INSERT INTO users (full_name, username, email, password, password_hash, auth_provider) VALUES (?, ?, ?, ?, ?, ?)',
    [
      fullName ? fullName.trim() : null,
      username.toLowerCase().trim(),
      email.toLowerCase().trim(),
      password,
      password,
      'local'
    ]
  );
  return { id: result.insertId, full_name: fullName, username, email, auth_provider: 'local' };
}

async function findUserByGoogleId(googleId) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE google_id = ?',
    [googleId]
  );
  return rows[0] || null;
}

async function createGoogleUser({ fullName, username, email, googleId, profileImage }) {
  const [result] = await pool.execute(
    'INSERT INTO users (full_name, username, email, password, password_hash, google_id, profile_image, auth_provider) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?)',
    [
      fullName ? fullName.trim() : username,
      username.toLowerCase().trim(),
      email.toLowerCase().trim(),
      googleId,
      profileImage || null,
      'google'
    ]
  );
  return { id: result.insertId, full_name: fullName, username, email, google_id: googleId, profile_image: profileImage, auth_provider: 'google' };
}

async function updateGoogleDetails(userId, { googleId, profileImage }) {
  await pool.execute(
    'UPDATE users SET google_id = COALESCE(google_id, ?), profile_image = COALESCE(profile_image, ?) WHERE id = ?',
    [googleId, profileImage, userId]
  );
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
    'SELECT id, full_name, username, email, google_id, profile_image, auth_provider, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  createUser,
  findUserByGoogleId,
  createGoogleUser,
  updateGoogleDetails,
  findUserByEmail,
  findUserByUsername,
  findUserById
};
