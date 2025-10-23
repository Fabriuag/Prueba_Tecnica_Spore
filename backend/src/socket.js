// backend/src/socket.js
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const { Vehicle } = require('../models')
require('dotenv').config();

// helper para point (lon, lat) en PostGIS
const toPoint = (lat, lon) =>
  (lat == null || lon == null) ? null : { type: 'Point', coordinates: [Number(lon), Number(lat)] }

module.exports = function attachSocket(server) {
  const io = new Server(server, {
    cors: { origin: [process.env.CLIENT_URL], credentials: true }
  })

  // Autenticación de sockets con el mismo JWT
  io.use((socket, next) => {
    try {
      let token = socket.handshake.auth?.token
      if (!token) {
        const auth = socket.handshake.headers['authorization']
        if (auth?.startsWith('Bearer ')) token = auth.slice(7)
      }
      if (!token) return next(new Error('no token'))
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret')
      socket.data.user = { id: payload.id, role: payload.role }
      socket.join(`user:${payload.id}`)
      if (payload.role === 'admin') socket.join('admins')
      next()
    } catch (e) {
      next(new Error('bad token'))
    }
  })

  io.on('connection', (socket) => {
    console.log('🟢 socket', socket.id, 'user', socket.data.user)

    socket.on('ping', () => socket.emit('pong'))

    // (Opcional) Actualizar posición por socket y persistirla
    socket.on('vehicles:updatePosition', async ({ id, lat, lon }) => {
      try {
        const v = await Vehicle.findByPk(id)
        if (!v) return
        const me = socket.data.user
        // Sólo admin o dueño puede moverlo
        if (!(me?.role === 'admin' || me?.id === v.userId)) return
        await v.update({ location: toPoint(lat, lon) })
        // Emitir sólo a admins y al dueño del vehículo
        io.to('admins').to(`user:${v.userId}`).emit('vehicles:upsert', v.toJSON())
      } catch (e) {
        console.error('vehicles:updatePosition error:', e.message)
      }
    })
  })

  return io
}
