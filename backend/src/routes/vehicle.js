// backend/src/routes/vehicle.js
const express = require('express')
const router = express.Router()

const { authenticate } = require('../middlewares/auth')
const ctrl = require('../controllers/vehicle')

const multer = require('multer')
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\//.test(file.mimetype)) return cb(new Error('Only images are allowed'))
    cb(null, true)
  }
})

const validate = require('../middlewares/validate')
const {
  validateVehicleId,
  validateCreateVehicle,
  validateUpdateVehicle,
  validateForceDelete
} = require('../validators/vehiclevalidator') // Asegúrate de que el nombre del archivo tenga la V mayúscula

// Listar vehículos
router.get('/', authenticate, ctrl.list)

// Obtener vehículo por ID
router.get('/:id', authenticate, validateVehicleId, validate, ctrl.getById)

// Obtener imagen
router.get('/:id/image', authenticate, validateVehicleId, validate, ctrl.image)

// Crear vehículo
router.post('/', authenticate, upload.single('image'), validateCreateVehicle, validate, ctrl.create)

// Actualizar vehículo
router.put('/:id', authenticate, upload.single('image'), validateVehicleId, validateUpdateVehicle, validate, ctrl.update)

// Eliminar vehículo (soft/hard)
router.delete('/:id', authenticate, validateVehicleId, validateForceDelete, validate, ctrl.remove)

// Restaurar vehículo
router.post('/:id/restore', authenticate, validateVehicleId, validate, ctrl.restore)

module.exports = router
