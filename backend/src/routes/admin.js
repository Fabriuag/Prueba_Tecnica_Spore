const express = require('express')
const router = express.Router()
const { authenticate, isAdmin } = require('../middlewares/auth')
const { metrics } = require('../controllers/admin')

// Ping protegido para el dashboard
router.get('/dashboard', authenticate, isAdmin, (_req, res) => {
  res.json({ message: 'OK' })
})

// Métricas del dashboard
router.get('/metrics', authenticate, isAdmin, metrics)

module.exports = router
