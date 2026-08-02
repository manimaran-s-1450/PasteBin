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
  } else if (lower.includes('24h') || lower.includes('1d') || lower.includes('1 day') || lower.includes('24 hours')) {
    now.setDate(now.getDate() + 1);
  } else if (lower.includes('7d') || lower.includes('1w') || lower.includes('1 week') || lower.includes('7 days')) {
    now.setDate(now.getDate() + 7);
  } else if (lower.includes('30d') || lower.includes('1m') || lower.includes('1 month') || lower.includes('30 days')) {
    now.setDate(now.getDate() + 30);
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
 */
async function createPaste({ title, language, visibility, expires_in, content, user_id }) {
  await deleteExpiredPastes();
  let pasteCode;
  let isInserted = false;
  let attempts = 0;
  const maxAttempts = 5;

  let lastResult;
  const expiresAt = calculateExpiresAt(expires_in);
  const userIdStr = user_id ? String(user_id) : null;

  while (!isInserted && attempts < maxAttempts) {
    pasteCode = generatePasteCode(8);
    attempts++;

    try {
      const query = `
        INSERT INTO pastes (paste_code, user_id, title, language, visibility, expires_at, content)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        pasteCode,
        userIdStr,
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
    user_id: userIdStr,
    title: title || null,
    language: language || 'Plain Text',
    visibility: visibility || 'public',
    expires_at: expiresAt,
    content,
    created_at: new Date().toISOString()
  };
}

/**
 * Retrieves a paste record by paste_code or id safely (excluding expired pastes)
 */
async function findByCode(pasteCode) {
  await deleteExpiredPastes();
  const codeStr = String(pasteCode).trim();
  const isNumeric = /^\d+$/.test(codeStr);
  const query = isNumeric
    ? `SELECT id, paste_code, user_id, title, language, visibility, expires_at, content, created_at FROM pastes WHERE (id = ? OR paste_code = ?) AND (expires_at IS NULL OR expires_at > NOW()) LIMIT 1`
    : `SELECT id, paste_code, user_id, title, language, visibility, expires_at, content, created_at FROM pastes WHERE paste_code = ? AND (expires_at IS NULL OR expires_at > NOW()) LIMIT 1`;
  const params = isNumeric ? [codeStr, codeStr] : [codeStr];

  const [rows] = await pool.execute(query, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Retrieves history list of all unexpired pastes ordered by newest first
 */
async function getAllPastes() {
  await deleteExpiredPastes();
  const query = `
    SELECT id, paste_code, user_id, title, language, visibility, expires_at, content, created_at
    FROM pastes
    WHERE expires_at IS NULL OR expires_at > NOW()
    ORDER BY created_at DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
}

/**
 * Retrieves ONLY the authenticated user's created pastes ordered by newest first
 */
async function getUserPastes(userId) {
  if (!userId) return [];
  await deleteExpiredPastes();
  const query = `
    SELECT id, paste_code, user_id, title, language, visibility, expires_at, content, created_at
    FROM pastes
    WHERE user_id = ? AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at DESC
  `;
  const [rows] = await pool.execute(query, [String(userId)]);
  return rows;
}

/**
 * Records a viewed/received paste for an authenticated user
 */
async function recordReceivedPaste(userId, pasteCode) {
  if (!userId || !pasteCode) return;
  try {
    const query = `
      INSERT INTO received_pastes (user_id, paste_code, viewed_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE viewed_at = NOW()
    `;
    await pool.execute(query, [String(userId), String(pasteCode)]);
  } catch (e) {
    console.warn('Record received paste error:', e.message);
  }
}

/**
 * Retrieves history list of unexpired pastes received/viewed by an authenticated user
 */
async function getReceivedPastes(userId) {
  if (!userId) return [];
  await deleteExpiredPastes();
  try {
    const query = `
      SELECT p.id, p.paste_code, p.user_id, p.title, p.language, p.visibility, p.expires_at, p.content, rp.viewed_at AS created_at
      FROM received_pastes rp
      JOIN pastes p ON rp.paste_code = p.paste_code
      WHERE rp.user_id = ? AND (p.expires_at IS NULL OR p.expires_at > NOW())
      ORDER BY rp.viewed_at DESC
    `;
    const [rows] = await pool.execute(query, [String(userId)]);
    return rows;
  } catch (e) {
    return [];
  }
}

/**
 * Deletes a paste record by paste_code or id safely (verifying user ownership)
 */
async function deletePasteByCode(pasteCode, userId = null) {
  const codeStr = String(pasteCode).trim();
  const isNumeric = /^\d+$/.test(codeStr);
  const checkQuery = isNumeric
    ? `SELECT id, paste_code, user_id FROM pastes WHERE id = ? OR paste_code = ? LIMIT 1`
    : `SELECT id, paste_code, user_id FROM pastes WHERE paste_code = ? LIMIT 1`;
  const checkParams = isNumeric ? [codeStr, codeStr] : [codeStr];
  const [existing] = await pool.execute(checkQuery, checkParams);

  if (existing.length === 0) {
    return { found: false, owner: false };
  }

  const paste = existing[0];

  // Verify ownership: if paste belongs to a user, caller must be that user
  if (paste.user_id && String(paste.user_id) !== String(userId)) {
    return { found: true, owner: false };
  }

  const targetCode = paste.paste_code || codeStr;
  const targetId = paste.id;

  // Clean up any references in received_pastes table first
  try {
    await pool.execute(
      `DELETE FROM received_pastes WHERE paste_code = ? OR paste_id = ?`,
      [targetCode, targetId]
    );
  } catch (e) {}

  // Delete paste from pastes table safely
  const deleteQuery = isNumeric
    ? `DELETE FROM pastes WHERE id = ? OR paste_code = ?`
    : `DELETE FROM pastes WHERE paste_code = ?`;
  const [result] = await pool.execute(deleteQuery, checkParams);

  return { found: true, owner: result.affectedRows > 0 };
}

/**
 * Updates an existing paste record safely (verifying user ownership)
 */
async function updatePasteByCode(pasteCode, { title, language, visibility, expires_in, content }, userId = null) {
  const isNumeric = /^\d+$/.test(String(pasteCode).trim());
  const checkQuery = isNumeric
    ? `SELECT id, user_id FROM pastes WHERE id = ? OR paste_code = ? LIMIT 1`
    : `SELECT id, user_id FROM pastes WHERE paste_code = ? LIMIT 1`;
  const checkParams = isNumeric ? [pasteCode, pasteCode] : [pasteCode];
  const [existing] = await pool.execute(checkQuery, checkParams);

  if (existing.length === 0) {
    return { found: false, owner: false, data: null };
  }

  const paste = existing[0];
  if (userId && paste.user_id && String(paste.user_id) !== String(userId)) {
    return { found: true, owner: false, data: null };
  }

  const expiresAt = expires_in !== undefined ? calculateExpiresAt(expires_in) : undefined;

  let updateQuery;
  let updateParams;

  if (expiresAt !== undefined) {
    updateQuery = isNumeric
      ? `UPDATE pastes SET title = ?, language = ?, visibility = ?, expires_at = ?, content = ? WHERE id = ? OR paste_code = ?`
      : `UPDATE pastes SET title = ?, language = ?, visibility = ?, expires_at = ?, content = ? WHERE paste_code = ?`;
    updateParams = isNumeric
      ? [title || null, language || 'Plain Text', visibility || 'public', expiresAt, content, pasteCode, pasteCode]
      : [title || null, language || 'Plain Text', visibility || 'public', expiresAt, content, pasteCode];
  } else {
    updateQuery = isNumeric
      ? `UPDATE pastes SET title = ?, language = ?, visibility = ?, content = ? WHERE id = ? OR paste_code = ?`
      : `UPDATE pastes SET title = ?, language = ?, visibility = ?, content = ? WHERE paste_code = ?`;
    updateParams = isNumeric
      ? [title || null, language || 'Plain Text', visibility || 'public', content, pasteCode, pasteCode]
      : [title || null, language || 'Plain Text', visibility || 'public', content, pasteCode];
  }

  await pool.execute(updateQuery, updateParams);

  const selectQuery = isNumeric
    ? `SELECT id, paste_code, user_id, title, language, visibility, expires_at, content, created_at FROM pastes WHERE id = ? OR paste_code = ? LIMIT 1`
    : `SELECT id, paste_code, user_id, title, language, visibility, expires_at, content, created_at FROM pastes WHERE paste_code = ? LIMIT 1`;
  const [rows] = await pool.execute(selectQuery, checkParams);
  return { found: true, owner: true, data: rows[0] };
}

module.exports = {
  createPaste,
  findByCode,
  getAllPastes,
  getUserPastes,
  recordReceivedPaste,
  getReceivedPastes,
  deletePasteByCode,
  updatePasteByCode
};
