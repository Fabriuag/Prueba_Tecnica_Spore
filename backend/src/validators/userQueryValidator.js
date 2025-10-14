const { param, body } = require('express-validator')

// Validar que el parámetro `id` sea un número entero positivo
const validateUserIdParam = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('El ID del usuario debe ser un número entero positivo')
]

// Validar cambio de rol
const validateChangeRole = [
  body('role')
    .notEmpty().withMessage('El rol es obligatorio')
    .isIn(['admin', 'regular']).withMessage('Rol inválido')
]

// Validar actualización de usuario (campos opcionales)
const validateUpdateUser = [
  body('username').optional().isString(),
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('role').optional().isIn(['admin', 'regular']),
]

module.exports = {
  validateUserIdParam,
  validateChangeRole,
  validateUpdateUser
}
