// src/middlewares/auth.js
const authCtrl = require('../controllers/auth')

exports.authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) return res.status(403).json({ error: 'Token no proporcionado' })

  const decoded = authCtrl.verifyToken(token)
  if (!decoded) return res.status(401).json({ error: 'Token inválido o expirado' })

  req.user = decoded
  next()
}

exports.isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: se requiere rol de admin' })
  }
  next()
}
