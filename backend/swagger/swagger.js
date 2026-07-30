const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

// Ensure glob patterns use forward slashes for cross-platform / Windows compatibility
const routesPath = path.join(__dirname, '../routes/*.js').replace(/\\/g, '/');

/**
 * OpenAPI 3.0 Configuration Options for PasteBin API
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PasteBin API',
      version: '1.0.0',
      description: 'REST API documentation for the PasteBin project.'
    },
    servers: [
      {
        url: process.env.SERVER_URL || 'http://localhost:5000',
        description: 'Development Server'
      }
    ]
  },
  apis: [routesPath]
};

// Initialize swagger-jsdoc specification
const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec
};
