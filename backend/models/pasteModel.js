const { pool } = require('../config/db');
const generatePasteCode = require('../utils/generateCode');

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

async function deleteExpiredPastes() {
  try {
    await pool.execute(`DELETE FROM pastes WHERE expires_at IS NOT NULL AND expires_at <= NOW()`);
  } catch (e) {
    // Ignore error if column not created yet
  }
}

async function createPaste({ userId, title, language, visibility, expires_in, content }) {
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
        INSERT INTO pastes (user_id, paste_code, title, language, visibility, expires_at, content)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        userId || null,
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
    user_id: userId || null,
    paste_code: pasteCode,
    title: title || null,
    language: language || 'Plain Text',
    visibility: visibility || 'public',
    expires_at: expiresAt,
    content,
    created_at: new Date().toISOString()
  };
}

async function findByCode(pasteCode) {
  const isNumeric = /^\d+$/.test(String(pasteCode).trim());
  const query = isNumeric
    ? `SELECT id, user_id, paste_code, title, language, visibility, expires_at, content, created_at FROM pastes WHERE id = ? OR paste_code = ? LIMIT 1`
    : `SELECT id, user_id, paste_code, title, language, visibility, expires_at, content, created_at FROM pastes WHERE paste_code = ? LIMIT 1`;
  const params = isNumeric ? [pasteCode, pasteCode] : [pasteCode];

  const [rows] = await pool.execute(query, params);
  return rows.length > 0 ? rows[0] : null;
}

async function getAllPastes(userId = null) {
  if (userId) {
    const query = `
      SELECT id, user_id, paste_code, title, language, visibility, expires_at, content, created_at
      FROM pastes
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  }

  const query = `
    SELECT id, user_id, paste_code, title, language, visibility, expires_at, content, created_at
    FROM pastes
    ORDER BY created_at DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
}

async function getPastesByUserId(userId) {
  const query = `
    SELECT id, user_id, paste_code, title, language, visibility, expires_at, content, created_at
    FROM pastes
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;
  const [rows] = await pool.execute(query, [userId]);
  return rows;
}

async function addReceivedPaste(userId, pasteId) {
  try {
    await pool.execute(
      `INSERT IGNORE INTO received_pastes (user_id, paste_id) VALUES (?, ?)`,
      [userId, pasteId]
    );
  } catch (e) {
    // Ignore duplicate received entries
  }
}

async function getReceivedPastes(userId) {
  const query = `
    SELECT p.id, p.user_id, p.paste_code, p.title, p.language, p.visibility, p.expires_at, p.content, p.created_at, rp.received_at
    FROM received_pastes rp
    JOIN pastes p ON rp.paste_id = p.id
    WHERE rp.user_id = ?
    ORDER BY rp.received_at DESC
  `;
  const [rows] = await pool.execute(query, [userId]);
  return rows;
}

async function deletePasteByCode(pasteCode, userId = null) {
  const isNumeric = /^\d+$/.test(String(pasteCode).trim());
  
  if (userId) {
    const checkQuery = isNumeric
      ? `SELECT id, user_id FROM pastes WHERE (id = ? OR paste_code = ?) AND user_id = ? LIMIT 1`
      : `SELECT id, user_id FROM pastes WHERE paste_code = ? AND user_id = ? LIMIT 1`;
    const checkParams = isNumeric ? [pasteCode, pasteCode, userId] : [pasteCode, userId];
    const [existing] = await pool.execute(checkQuery, checkParams);

    if (existing.length === 0) {
      return false;
    }

    const deleteQuery = isNumeric
      ? `DELETE FROM pastes WHERE (id = ? OR paste_code = ?) AND user_id = ?`
      : `DELETE FROM pastes WHERE paste_code = ? AND user_id = ?`;
    const [result] = await pool.execute(deleteQuery, checkParams);
    return result.affectedRows > 0;
  }

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
    ? `SELECT id, user_id, paste_code, title, language, visibility, expires_at, content, created_at FROM pastes WHERE id = ? OR paste_code = ? LIMIT 1`
    : `SELECT id, user_id, paste_code, title, language, visibility, expires_at, content, created_at FROM pastes WHERE paste_code = ? LIMIT 1`;
  const [rows] = await pool.execute(selectQuery, checkParams);
  return rows[0];
}

module.exports = {
  createPaste,
  findByCode,
  getAllPastes,
  getPastesByUserId,
  addReceivedPaste,
  getReceivedPastes,
  deletePasteByCode,
  updatePasteByCode
};
