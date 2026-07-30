const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

/**
 * MySQL 8 Connection Pool Setup
 * Uses mysql2 promise wrapper for non-blocking async/await queries and connection reuse.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pastebin_db',
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT, 10) : 10,
  queueLimit: 0,
  timezone: '+00:00'
});

/**
 * Verifies database connection on application startup
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL Database connected successfully [Database: ${process.env.DB_NAME || 'pastebin_db'}]`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database Connection Failed:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};