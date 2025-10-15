// src/validators/vehicleValidator.js
const { body, param, query } = require('express-validator')

const validateVehicleId = [
  param('id').isInt().withMessage('El ID del vehículo debe ser un número entero válido'),
]

const validateCreateVehicle = [
  body('plates')
    .notEmpty().withMessage('Las placas son obligatorias')
    .isString().withMessage('Las placas deben ser texto'),
  body('brand')
    .notEmpty().withMessage('La marca es obligatoria')
    .isString().withMessage('La marca debe ser texto'),
  body('model').optional().isString().withMessage('Modelo inválido'),
  body('color').optional().isString().withMessage('Color inválido'),
  body('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  body('lon').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  body('userId').optional().isInt().withMessage('El ID de usuario debe ser numero entero'),
]

const validateUpdateVehicle = [
  body('plates').optional().isString().withMessage('Las placas deben ser texto'),
  body('brand').optional().isString().withMessage('La marca debe ser texto'),
  body('model').optional().isString().withMessage('Modelo inválido'),
  body('color').optional().isString().withMessage('Color inválido'),
  body('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  body('lon').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  body('userId').optional().isInt().withMessage('El ID de usuario debe ser entero'),
]

const validateForceDelete = [
  query('force')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('El parámetro force debe ser "true" o "false"'),
]

module.exports = {
  validateVehicleId,
  validateCreateVehicle,
  validateUpdateVehicle,
  validateForceDelete
}
