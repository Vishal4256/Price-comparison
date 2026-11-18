const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PriceSmart API',
      version: '1.0.0',
      description: 'API documentation for PriceSmart AI Price Intelligence Platform',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Search', description: 'Search and Autocomplete' },
      { name: 'Products', description: 'Product and comparison endpoints' },
      { name: 'AI', description: 'AI explanations and summaries' },
      { name: 'Predictions', description: 'Price predictions' },
      { name: 'Alerts', description: 'Price drops and restock alerts' },
      { name: 'Admin', description: 'Administrative and dashboard endpoints' },
      { name: 'Jobs', description: 'Background job triggers' },
      { name: 'Health', description: 'System health and uptime' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/v1/*.js'], // files containing annotations
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
