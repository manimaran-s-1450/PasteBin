const express = require('express');
const cors = require('cors');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');
const { swaggerUi, swaggerSpec } = require('./swagger/swagger');

const app = express();

// 1. Configure Cross-Origin Resource Sharing (CORS)
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// 2. Body Parser Middleware for JSON and Form URL-encoded Payloads (5MB limit for large snippets)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// 3. Swagger API Documentation Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 4. Health Check Verification Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'PasteBin API Service is active and operational',
        timestamp: new Date().toISOString()
    });
});

// 5. API Routes Mount Point
const authRoutes = require('./routes/authRoutes');
const pasteRoutes = require('./routes/pasteRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/pastes', pasteRoutes);

// 6. 404 Catch-All Middleware for undefined routes
app.use(notFoundHandler);

// 7. Global Error Middleware
app.use(errorHandler);

module.exports = app;