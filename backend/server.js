const dotenv = require('dotenv');
const path = require('path');

// Load environment configuration from .env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const { testConnection } = require('./config/db');

// Force PORT 5000 to match Railway Public Networking target port
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`================================================`);
    console.log(`🚀 PasteBin Express API Server Started on PORT ${PORT}`);
    console.log(`================================================`);

    testConnection().then(connected => {
        if (connected) {
            console.log('✅ Railway MySQL Database Connected.');
        }
    }).catch(err => {
        console.error('❌ DB Error:', err.message);
    });
});