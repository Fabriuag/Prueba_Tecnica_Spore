// src/docs/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Prueba Técnica API',
      version: '1.0.0',
      description: 'API de auth, admin y automóviles',
    },
    servers: [
      { url: process.env.VITE_URL, description: 'Dev' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'regular'] },
          },
        },
        Automovil: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            places: { type: 'string' }, // si ya migraste a string
            marca: { type: 'string' },
            modelo: { type: 'string' },
            color: { type: 'string' },
            latitud: { type: 'number', format: 'float' },
            longitud: { type: 'number', format: 'float' },
            userId: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            pages: { type: 'integer' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
      },
    },
  },
  // Archivos donde pondrás comentarios JSDoc con @swagger
  apis: [
    './src/routes/*.js',       // rutas
    './src/controllers/*.js',  // (opcional) si documentas aquí
  ],
};

module.exports = swaggerJSDoc(options);
