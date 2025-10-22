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

  body('location')
    .optional()
    .isArray({ min: 2, max: 2 })
    .custom(([lon, lat]) => {
      if (typeof lon !== 'number' || lon < -180 || lon > 180) {
        throw new Error('Longitud inválida')
      }
      if (typeof lat !== 'number' || lat < -90 || lat > 90) {
        throw new Error('Latitud inválida')
      }
      return true
    }),

  body('userId')
    .optional()
    .isInt().withMessage('El ID de usuario debe ser un número entero'),
]

const validateUpdateVehicle = [
  body('plates').optional().isString().withMessage('Las placas deben ser texto'),
  body('brand').optional().isString().withMessage('La marca debe ser texto'),
  body('model').optional().isString().withMessage('Modelo inválido'),
  body('color').optional().isString().withMessage('Color inválido'),

  body('location')
    .optional()
    .isArray({ min: 2, max: 2 })
    .custom(([lon, lat]) => {
      if (typeof lon !== 'number' || lon < -180 || lon > 180) {
        throw new Error('Longitud inválida')
      }
      if (typeof lat !== 'number' || lat < -90 || lat > 90) {
        throw new Error('Latitud inválida')
      }
      return true
    }),

  body('userId')
    .optional()
    .isInt().withMessage('El ID de usuario debe ser un número entero'),
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
