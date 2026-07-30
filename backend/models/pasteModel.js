const { pool } = require('../config/db');
const generatePasteCode = require('../utils/generateCode');

/**
 * Inserts a new paste record into the database using parameterized queries.
 * @param {Object} pasteData
 * @param {string|null} pasteData.title - Title of the paste
 * @param {string} pasteData.language - Programming language or format
 * @param {string} pasteData.content - Main code/text snippet content
 * @returns {Promise<Object>} Created paste details
 */
async function createPaste({ title, language, content }) {
  let pasteCode;
  let isInserted = false;
  let attempts = 0;
  const maxAttempts = 5;

  let lastResult;

  while (!isInserted && attempts < maxAttempts) {
    pasteCode = generatePasteCode(8);
    attempts++;

    try {
      const query = `
        INSERT INTO pastes (paste_code, title, language, content)
        VALUES (?, ?, ?, ?)
      `;
      const values = [
        pasteCode,
        title || null,
        language || 'Plain Text',
        content
      ];

      const [result] = await pool.execute(query, values);
      isInserted = true;
      lastResult = result;
    } catch (error) {
      // If code collision occurs, retry with a new code
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
    content,
    created_at: new Date().toISOString()
  };
}

/**
 * Retrieves a paste record by paste_code
 * @param {string} pasteCode
 * @returns {Promise<Object|null>}
 */
async function findByCode(pasteCode) {
  const query = `
    SELECT id, paste_code, title, language, content, created_at
    FROM pastes
    WHERE paste_code = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [pasteCode]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Retrieves history list of all pastes ordered by newest first (excluding content)
 * @returns {Promise<Array>} Array of paste summary objects
 */
async function getAllPastes() {
  const query = `
    SELECT id, paste_code, title, language, created_at
    FROM pastes
    ORDER BY created_at DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
}

/**
 * Deletes a paste record by paste_code
 * @param {string} pasteCode - Unique 8-character paste code
 * @returns {Promise<boolean>} Returns true if paste existed and was deleted, false if not found
 */
async function deletePasteByCode(pasteCode) {
  // Step 1: Check whether paste exists
  const checkQuery = `
    SELECT id
    FROM pastes
    WHERE paste_code = ?
    LIMIT 1
  `;
  const [existing] = await pool.execute(checkQuery, [pasteCode]);

  if (existing.length === 0) {
    return false;
  }

  // Step 2: Delete the paste
  const deleteQuery = `
    DELETE FROM pastes
    WHERE paste_code = ?
  `;
  const [result] = await pool.execute(deleteQuery, [pasteCode]);

  return result.affectedRows > 0;
}

/**
 * Updates an existing paste record by paste_code
 * @param {string} pasteCode - Unique 8-character paste code
 * @param {Object} pasteData
 * @param {string|null} pasteData.title - Updated title
 * @param {string} pasteData.language - Updated language
 * @param {string} pasteData.content - Updated content
 * @returns {Promise<Object|null>} Updated paste record or null if not found
 */
async function updatePasteByCode(pasteCode, { title, language, content }) {
  // Step 1: Check whether paste exists
  const checkQuery = `
    SELECT id
    FROM pastes
    WHERE paste_code = ?
    LIMIT 1
  `;
  const [existing] = await pool.execute(checkQuery, [pasteCode]);

  if (existing.length === 0) {
    return null;
  }

  // Step 2: Update the record
  const updateQuery = `
    UPDATE pastes
    SET title = ?,
        language = ?,
        content = ?
    WHERE paste_code = ?
  `;
  await pool.execute(updateQuery, [
    title || null,
    language || 'Plain Text',
    content,
    pasteCode
  ]);

  // Step 3: Retrieve and return updated record
  const selectQuery = `
    SELECT id, paste_code, title, language, content, created_at
    FROM pastes
    WHERE paste_code = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(selectQuery, [pasteCode]);
  return rows[0];
}

module.exports = {
  createPaste,
  findByCode,
  getAllPastes,
  deletePasteByCode,
  updatePasteByCode
};



