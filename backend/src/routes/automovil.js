// src/routes/automovil.js
const path = require('path')
const express = require('express')
const router = express.Router()

// CARGA CONTROLADOR y MIDDLEWARES
const ctrlPath = path.join(__dirname, '..', 'controllers', 'automovil')
const ctrl = require(ctrlPath)
const { authenticate, isAdmin } = require('../middlewares/auth')

// --- DIAGNÓSTICO AL ARRANCAR ---
console.log('[routes/automovil] controller file ->', require.resolve(ctrlPath))
console.log('[routes/automovil] ctrl keys ->', Object.keys(ctrl || {}))
console.log('[routes/automovil] typeof authenticate:', typeof authenticate, 'typeof isAdmin:', typeof isAdmin)

// Validaciones: si algo no es función, detenemos aquí con mensaje claro
const mustBeFn = (fn, name) => {
  if (typeof fn !== 'function') {
    throw new Error(`[routes/automovil] "${name}" no es función. Revisa exports de middlewares/controllers.`)
  }
}
mustBeFn(authenticate, 'authenticate')
mustBeFn(isAdmin, 'isAdmin')
;['list', 'getById', 'create', 'update', 'remove', 'updatePosition'].forEach(k => mustBeFn(ctrl[k], k))

// --- Rutas ---
router.get('/', authenticate, ctrl.list)
router.get('/:id', authenticate, ctrl.getById)
router.post('/', authenticate, isAdmin, ctrl.create)
router.put('/:id', authenticate, isAdmin, ctrl.update)
router.delete('/:id', authenticate, isAdmin, ctrl.remove)
router.post('/:id/position', authenticate, ctrl.updatePosition)

module.exports = router


