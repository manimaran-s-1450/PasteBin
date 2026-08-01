const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

function getDbConfig() {
  const connectionUrl = process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL || process.env.DATABASE_URL;

  if (connectionUrl && connectionUrl.startsWith('mysql')) {
    try {
      const url = new URL(connectionUrl);
      return {
        host: url.hostname,
        port: url.port ? parseInt(url.port, 10) : 3306,
        user: url.username || 'root',
        password: decodeURIComponent(url.password || ''),
        database: (url.pathname || '/railway').replace('/', '') || 'railway',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: url.hostname.includes('railway.internal') || url.hostname === 'localhost' ? undefined : { rejectUnauthorized: false }
      };
    } catch (err) {
      console.warn('[DB Config Warning]: Could not parse connection URL, falling back to individual env variables.');
    }
  }

  const host = process.env.MYSQLHOST || process.env.DB_HOST || 'mysql.railway.internal';
  const isInternalOrLocal = host.includes('railway.internal') || host === 'localhost' || host === '127.0.0.1';

  return {
    host: host,
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306', 10),
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'tZNhWOJHRRgJGJlYyIlnRzkgNjJICcSZ',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    queueLimit: 0,
    timezone: '+00:00',
    ssl: isInternalOrLocal ? undefined : { rejectUnauthorized: false }
  };
}

const pool = mysql.createPool(getDbConfig());

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const dbConfig = getDbConfig();
    console.log(`✅ Railway MySQL Connected! [Host: ${dbConfig.host}:${dbConfig.port} | Database: ${dbConfig.database}]`);

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