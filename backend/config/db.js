const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

function getDbConfig() {
  const host = process.env.MYSQLHOST || process.env.DB_HOST || 'viaduct.proxy.rlwy.net';
  const isInternal = host.includes('railway.internal');
  const isLocal = host === 'localhost' || host === '127.0.0.1';

  return {
    host: host,
    port: isInternal ? 3306 : parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '35471', 10),
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'iolYRriSeXZDFNuugVUWEeOCSxcUrlOe',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00',
    ssl: (isInternal || isLocal) ? undefined : { rejectUnauthorized: false }
  };
}

const pool = mysql.createPool(getDbConfig());

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const dbConfig = getDbConfig();
    console.log(`✅ Railway MySQL Connected! [Host: ${dbConfig.host}:${dbConfig.port} | Database: ${dbConfig.database}]`);

    // 1. Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NULL,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure full_name column exists
    try {
      await connection.query(`ALTER TABLE users ADD COLUMN full_name VARCHAR(255) NULL AFTER id;`);
    } catch (e) {
      // Column already exists
    }

    // Ensure password column exists (if password_hash was used previously)
    try {
      await connection.query(`ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL AFTER email;`);
    } catch (e) {
      // Column already exists
    }

    // 2. Create pastes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pastes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        paste_code VARCHAR(8) NOT NULL UNIQUE,
        title VARCHAR(255) NULL,
        language VARCHAR(50) DEFAULT 'Plain Text',
        visibility VARCHAR(10) DEFAULT 'public',
        expires_at DATETIME NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Add user_id column to pastes if not exists
    try {
      await connection.query(`ALTER TABLE pastes ADD COLUMN user_id INT NULL AFTER paste_code;`);
    } catch (e) {
      // Column user_id already exists
    }

    // 4. Create received_pastes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS received_pastes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        paste_id INT NOT NULL,
        received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_paste_unique (user_id, paste_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Railway MySQL Database Connection Failed:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};