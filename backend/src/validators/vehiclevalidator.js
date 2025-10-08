// src/validators/vehicleValidator.js
const { body } = require('express-validator')

const validateVehicleCreate = [
  body('plates').notEmpty().withMessage('Placas requeridas'),
  body('brand').notEmpty().withMessage('Marca requerida'),
  body('model').optional().isString(),
  body('color').optional().isString(),
  body('lat').optional().isFloat().withMessage('Latitud inválida'),
  body('lon').optional().isFloat().withMessage('Longitud inválida'),
  body('userId').optional().isInt().withMessage('userId inválido'),
]

const validateVehicleUpdate = [
  body('plates').optional().isString(),
  body('brand').optional().isString(),
  body('model').optional().isString(),
  body('color').optional().isString(),
  body('lat').optional().isFloat(),
  body('lon').optional().isFloat(),
  body('userId').optional().isInt(),
]

module.exports = {
  validateVehicleCreate,
  validateVehicleUpdate
}