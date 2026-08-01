const { pool } = require('../config/db');
const generatePasteCode = require('../utils/generateCode');

/**
 * Helper to calculate MySQL DATETIME string for paste expiration
 */
function calculateExpiresAt(expiresIn) {
  if (!expiresIn || expiresIn === 'never' || expiresIn === 'Never') return null;

  const now = new Date();
  const lower = String(expiresIn).toLowerCase().trim();

  if (lower.includes('10m') || lower.includes('10 min')) {
    now.setMinutes(now.getMinutes() + 10);
  } else if (lower.includes('1h') || lower.includes('1 hour')) {
    now.setHours(now.getHours() + 1);
  } else if (lower.includes('1d') || lower.includes('1 day')) {
    now.setDate(now.getDate() + 1);
  } else if (lower.includes('1w') || lower.includes('1 week')) {
    now.setDate(now.getDate() + 7);
  } else {
    return null;
  }

  return now.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Helper to auto-delete expired pastes from MySQL
 */
async function deleteExpiredPastes() {
  try {
    await pool.execute(`DELETE FROM pastes WHERE expires_at IS NOT NULL AND expires_at <= NOW()`);
  } catch (e) {
    // Ignore error if column not created yet
  }
}

/**
 * Inserts a new paste record into the database using parameterized queries.
 * @param {Object} pasteData
 * @param {string|null} pasteData.title - Title of the paste
 * @param {string} pasteData.language - Programming language or format
 * @param {string} pasteData.visibility - Visibility (public or private)
 * @param {string} pasteData.expires_in - Expiration option (never, 10m, 1h, 1d, 1w)
 * @param {string} pasteData.content - Main code/text snippet content
 * @returns {Promise<Object>} Created paste details
 */
async function createPaste({ title, language, visibility, expires_in, content }) {
  await deleteExpiredPastes();
  let pasteCode;
  let isInserted = false;
  let attempts = 0;
  const maxAttempts = 5;

  let lastResult;
  const expiresAt = calculateExpiresAt(expires_in);

  while (!isInserted && attempts < maxAttempts) {
    pasteCode = generatePasteCode(8);
    attempts++;

    try {
      const query = `
        INSERT INTO pastes (paste_code, title, language, visibility, expires_at, content)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [
        pasteCode,
        title || null,
        language || 'Plain Text',
        visibility || 'public',
        expiresAt,
        content
      ];

      const [result] = await pool.execute(query, values);
      isInserted = true;
      lastResult = result;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' && attempts < maxAttempts) {
        continue;
      }
      throw error;
    }
  }

  return {
    id: lastResult.insertId,
    paste_code: pasteCode,
    title: title || null,
    language: language || 'Plain Text',
    visibility: visibility || 'public',
    expires_at: expiresAt,
    content,
    created_at: new Date().toISOString()
  };
}

/**
 * Retrieves a paste record by paste_code or id safely
 * @param {string} pasteCode
 * @returns {Promise<Object|null>}
 */
async function findByCode(pasteCode) {
  const isNumeric = /^\d+$/.test(String(pasteCode).trim());
  const query = isNumeric
    ? `SELECT id, paste_code, title, language, visibility, expires_at, content, created_at FROM pastes WHERE id = ? OR paste_code = ? LIMIT 1`
    : `SELECT id, paste_code, title, language, visibility, expires_at, content, created_at FROM pastes WHERE paste_code = ? LIMIT 1`;
  const params = isNumeric ? [pasteCode, pasteCode] : [pasteCode];

  const [rows] = await pool.execute(query, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Retrieves history list of all unexpired pastes ordered by newest first
 * @returns {Promise<Array>} Array of paste summary objects
 */
async function getAllPastes() {
  const query = `
    SELECT id, paste_code, title, language, visibility, expires_at, content, created_at
    FROM pastes
    ORDER BY created_at DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
}

/**
 * Deletes a paste record by paste_code or id safely
 * @param {string} pasteCode - Unique 8-character paste code or ID
 * @returns {Promise<boolean>} Returns true if paste existed and was deleted, false if not found
 */
async function deletePasteByCode(pasteCode) {
  const isNumeric = /^\d+$/.test(String(pasteCode).trim());
  const checkQuery = isNumeric
    ? `SELECT id FROM pastes WHERE id = ? OR paste_code = ? LIMIT 1`
    : `SELECT id FROM pastes WHERE paste_code = ? LIMIT 1`;
  const checkParams = isNumeric ? [pasteCode, pasteCode] : [pasteCode];
  const [existing] = await pool.execute(checkQuery, checkParams);

  if (existing.length === 0) {
    return false;
  }

  const deleteQuery = isNumeric
    ? `DELETE FROM pastes WHERE id = ? OR paste_code = ?`
    : `DELETE FROM pastes WHERE paste_code = ?`;
  const [result] = await pool.execute(deleteQuery, checkParams);

  return result.affectedRows > 0;
}

/**
 * Updates an existing paste record by paste_code or id safely
 * @param {string} pasteCode - Unique 8-character paste code or ID
 * @param {Object} pasteData
 * @param {string|null} pasteData.title - Updated title
 * @param {string} pasteData.language - Updated language
 * @param {string} pasteData.visibility - Updated visibility
 * @param {string} pasteData.content - Updated content
 * @returns {Promise<Object|null>} Updated paste record or null if not found
 */
async function updatePasteByCode(pasteCode, { title, language, visibility, content }) {
  const isNumeric = /^\d+$/.test(String(pasteCode).trim());
  const checkQuery = isNumeric
    ? `SELECT id FROM pastes WHERE id = ? OR paste_code = ? LIMIT 1`
    : `SELECT id FROM pastes WHERE paste_code = ? LIMIT 1`;
  const checkParams = isNumeric ? [pasteCode, pasteCode] : [pasteCode];
  const [existing] = await pool.execute(checkQuery, checkParams);

  if (existing.length === 0) {
    return null;
  }

  const updateQuery = isNumeric
    ? `UPDATE pastes SET title = ?, language = ?, visibility = ?, content = ? WHERE id = ? OR paste_code = ?`
    : `UPDATE pastes SET title = ?, language = ?, visibility = ?, content = ? WHERE paste_code = ?`;
  const updateParams = isNumeric
    ? [title || null, language || 'Plain Text', visibility || 'public', content, pasteCode, pasteCode]
    : [title || null, language || 'Plain Text', visibility || 'public', content, pasteCode];

  await pool.execute(updateQuery, updateParams);

  const selectQuery = isNumeric
    ? `SELECT id, paste_code, title, language, visibility, expires_at, content, created_at FROM pastes WHERE id = ? OR paste_code = ? LIMIT 1`
    : `SELECT id, paste_code, title, language, visibility, expires_at, content, created_at FROM pastes WHERE paste_code = ? LIMIT 1`;
  const [rows] = await pool.execute(selectQuery, checkParams);
  return rows[0];
}

module.exports = {
  createPaste,
  findByCode,
  getAllPastes,
  deletePasteByCode,
  updatePasteByCode
};



