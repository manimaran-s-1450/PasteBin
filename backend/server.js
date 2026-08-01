const dotenv = require('dotenv');
const path = require('path');

// Load environment configuration from .env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Start listening immediately so Railway healthcheck passes
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`================================================`);
    console.log(`🚀 PasteBin Express API Server Started`);
    console.log(`🌐 Listening on 0.0.0.0:${PORT}`);
    console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`================================================`);

    // Asynchronously verify MySQL database schema & connection
    testConnection().then(connected => {
        if (connected) {
            console.log('✅ Railway MySQL Database Ready.');
        } else {
            console.warn('⚠️  Notice: Database initialization pending.');
        }
    }).catch(err => {
        console.error('❌ DB Init Warning:', err.message);
    });
});