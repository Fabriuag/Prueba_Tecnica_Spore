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

router.get('/', authenticate, ctrl.list)
router.get('/:id', authenticate, ctrl.getById)
router.get('/:id/image', authenticate, ctrl.image)

router.post('/', authenticate, upload.single('image'), ctrl.create)
router.put('/:id', authenticate, upload.single('image'), ctrl.update)

// Soft delete por defecto; hard delete con ?force=true (solo admin)
router.delete('/:id', authenticate, ctrl.remove)

// ✅ Restaurar
router.post('/:id/restore', authenticate, ctrl.restore)

module.exports = router
