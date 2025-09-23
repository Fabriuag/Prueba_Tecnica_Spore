// backend/server.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')

const app = express()
app.use(express.json())
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }))

// Rutas
const authRoutes = require('./src/routes/auth')
const adminRoutes = require('./src/routes/admin')
const vehicleRoutes = require('./src/routes/vehicle')
const userRoutes = require('./src/routes/user')

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/users', userRoutes)

app.use('/api/automoviles', vehicleRoutes) // alias temporal
app.get('/health', (_req, res) => res.json({ ok: true }))

// Swagger
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./src/docs/swagger')
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// --- monta socket sobre el server HTTP ---
const server = http.createServer(app)
const attachSocket = require('./src/socket')
const io = attachSocket(server)

// haz accesible io desde los controladores a través de req.app.get('io')
app.set('io', io)

// Arranque
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`🚀 API en http://localhost:${PORT}`)
})
