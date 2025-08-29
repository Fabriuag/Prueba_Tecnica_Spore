// backend/server.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }))

// Rutas
const authRoutes = require('./src/routes/auth')
const adminRoutes = require('./src/routes/admin')          // si no existe, comenta esta línea y el app.use
const automovilRoutes = require('./src/routes/automovil')

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)                        // comenta si no tienes adminRoutes
app.use('/api/automoviles', automovilRoutes)

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }))

// Arranque (OJO: app.listen, NO server.listen)
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 API en http://localhost:${PORT}`)
})

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/docs/swagger');

// ...
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// listo: http://localhost:3000/docs
