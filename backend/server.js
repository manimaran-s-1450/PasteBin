const dotenv = require('dotenv');
const path = require('path');

// Load environment configuration from .env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
    // Test MySQL connection prior to opening HTTP port
    const isDbConnected = await testConnection();
    if (!isDbConnected) {
        console.warn('⚠️  Notice: Server initialized without active MySQL connection. Verify MySQL service configuration.');
    }

    app.listen(PORT, () => {
        console.log(`================================================`);
        console.log(`🚀 PasteBin Express API Server Started`);
        console.log(`🌐 URL: http://localhost:${PORT}`);
        console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`================================================`);
    });
}

startServer();