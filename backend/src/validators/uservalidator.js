// src/validators/userValidator.js
const { body } = require('express-validator')

const validateRegister = [
  body('username').notEmpty().withMessage('El usuario es obligatorio'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('email').optional().isEmail().withMessage('Correo inválido'),
]

const validateLogin = [
  body('username').notEmpty().withMessage('Usuario requerido'),
  body('password').notEmpty().withMessage('Contraseña requerida'),
]

const validatePasswordReset = [
  body('username').notEmpty().withMessage('Usuario requerido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña inválida'),
]

const validateUserUpdate = [
  body('username').optional().isString(),
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('role').optional().isIn(['admin', 'regular']),
]

module.exports = {
  validateRegister,
  validateLogin,
  validatePasswordReset,
  validateUserUpdate
}