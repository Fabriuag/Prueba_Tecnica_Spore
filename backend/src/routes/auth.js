const express = require('express');
const router = express.Router();
const { register, login, simpleReset } = require('../controllers/auth');

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
router.post('/login', login);

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
router.post('/register', register);

/**
 * Nueva ruta: cambio simple de contraseña
 */
router.post('/simple-reset', simpleReset);

module.exports = router;
