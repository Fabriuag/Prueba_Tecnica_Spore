const express = require('express');
const router = express.Router();

const { authenticate, isAdmin } = require('../middlewares/auth');
const ctrl = require('../controllers/user');
const validate = require('../middlewares/validate');

const {
  validateUserIdParam,
  validateChangeRole,
  validateUpdateUser,
  validateListUsersQuery
} = require('../validators/userQueryValidator')

router.get('/', authenticate, isAdmin, validateListUsersQuery, validate, ctrl.list)


// Seguridad: validar que todas las funciones estén bien importadas
const mustBeFn = (fn, name) => {
  if (typeof fn !== 'function') {
    throw new Error(`[routes/user] "${name}" no es función. Revisa exports/imports.`);
  }
};

[
  ['authenticate', authenticate],
  ['isAdmin',      isAdmin],
  ['list',         ctrl.list],
  ['changeRole',   ctrl.changeRole],
  ['softDelete',   ctrl.softDelete],
  ['restore',      ctrl.restore],
  ['updateUser',   ctrl.updateUser],
].forEach(([n, f]) => mustBeFn(f, n));

// === RUTAS ===

// ✅ LISTAR USUARIOS (solo admin)
router.get('/', authenticate, isAdmin, ctrl.list);

// ✅ CAMBIAR ROL DE USUARIO
router.put(
  '/:id/role',
  authenticate,
  isAdmin,
  validateUserIdParam,
  validateChangeRole,
  validate,
  ctrl.changeRole
);

// ✅ ACTUALIZAR USUARIO (campos opcionales)
router.put(
  '/:id',
  authenticate,
  isAdmin,
  validateUserIdParam,
  validateUpdateUser,
  validate,
  ctrl.updateUser
);

// ✅ ELIMINAR USUARIO (soft delete)
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  validateUserIdParam,
  validate,
  ctrl.softDelete
);

// ✅ RESTAURAR USUARIO
router.post(
  '/:id/restore',
  authenticate,
  isAdmin,
  validateUserIdParam,
  validate,
  ctrl.restore
);

module.exports = router;
