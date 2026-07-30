const crypto = require('crypto');

/**
 * Generates a random alphanumeric code of specified length.
 * @param {number} length - Desired length of the generated code (default 8)
 * @returns {string} Unique random alphanumeric code
 */
function generatePasteCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = crypto.randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  return code;
}

module.exports = generatePasteCode;
