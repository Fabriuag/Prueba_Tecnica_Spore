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
/**
 * @swagger
 * /api/automoviles:
 *   get:
 *     tags: [Automóviles]
 *     summary: Listar automóviles
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Automovil' }
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401: { description: No autenticado }
 */
router.get('/', authenticate, ctrl.list);
router.get('/:id', authenticate, ctrl.getById)
/**
 * @swagger
 * /api/automoviles:
 *   post:
 *     tags: [Automóviles]
 *     summary: Crear automóvil (solo admin)
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [places, marca]
 *             properties:
 *               places: { type: string }
 *               marca:  { type: string }
 *               modelo: { type: string }
 *               color:  { type: string }
 *               latitud:  { type: number, format: float }
 *               longitud: { type: number, format: float }
 *               userId: { type: integer, nullable: true }
 *     responses:
 *       201:
 *         description: Creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Automovil' }
 *       401: { description: No autenticado }
 *       403: { description: No autorizado (solo admin) }
 */
router.post('/', authenticate, isAdmin, ctrl.create);
router.put('/:id', authenticate, isAdmin, ctrl.update)
router.delete('/:id', authenticate, isAdmin, ctrl.remove)
router.post('/:id/position', authenticate, ctrl.updatePosition)

module.exports = router


