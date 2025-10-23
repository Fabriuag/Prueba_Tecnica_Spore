const { param, body, query } = require('express-validator')

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

// Validar registro de usuario
const validateRegister = [
  body('username')
    .notEmpty().withMessage('El nombre de usuario es obligatorio')
    .isString().withMessage('El nombre de usuario debe ser texto'),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role')
    .optional()
    .isIn(['admin', 'regular']).withMessage('Rol inválido'),
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('phone').optional().isString(),
]

// Validar login de usuario
const validateLogin = [
  body('username')
    .notEmpty().withMessage('El nombre de usuario es obligatorio'),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
]

// Validar cambio simple de contraseña
const validateSimpleReset = [
  body('username')
    .notEmpty().withMessage('El nombre de usuario es obligatorio'),
  body('password')
    .notEmpty().withMessage('La nueva contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
]

// Validar filtros de lista de usuarios
const validateListUsersQuery = [
  query('role')
    .optional()
    .isIn(['admin', 'regular']).withMessage('Rol inválido'),
  query('status')
    .optional()
    .isIn(['active', 'deleted', 'all']).withMessage('Estatus inválido'),
  query('from')
    .optional()
    .isISO8601().withMessage('Fecha "from" inválida'),
  query('to')
    .optional()
    .isISO8601().withMessage('Fecha "to" inválida'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'username', 'email', 'role']).withMessage('Campo de ordenamiento inválido'),
  query('sortDir')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Dirección de ordenamiento inválida'),
  query('page')
    .optional()
    .isInt({ gt: 0 }).withMessage('El número de página debe ser un entero positivo'),
  query('limit')
    .optional()
    .isInt({ gt: 0 }).withMessage('El límite debe ser un entero positivo'),
]

module.exports = {
  validateUserIdParam,
  validateChangeRole,
  validateUpdateUser,
  validateRegister,
  validateLogin,
  validateSimpleReset,
  validateListUsersQuery
}
