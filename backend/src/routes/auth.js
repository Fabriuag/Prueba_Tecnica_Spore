const express = require('express');
const router = express.Router();
const { register, login, simpleReset } = require('../controllers/auth');
const {
  validateRegister,
  validateLogin,
  validateSimpleReset
} = require('../validators/userQueryValidator')
const validate = require('../middlewares/validate')





/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginRequest' }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/LoginResponse' }
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', validateLogin, validate, login)

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/LoginRequest'
 *               - type: object
 *                 properties:
 *                   role:
 *                     type: string
 *                     enum: [admin, regular]
 *     responses:
 *       201:
 *         description: Creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/LoginResponse' }
 *       400: { description: Error de validación }
 */
router.post('/register', validateRegister, validate, register)

/**
 * Nueva ruta: cambio simple de contraseña
 */
router.post('/simple-reset', validateSimpleReset, validate, simpleReset)

module.exports = router;
