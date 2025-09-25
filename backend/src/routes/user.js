// backend/src/routes/user.js
const express = require('express');
const router = express.Router();

const { authenticate, isAdmin } = require('../middlewares/auth');
const ctrl = require('../controllers/user');

// Sanidad: asegúrate de que todo son funciones
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

// LISTAR (solo admin)
router.get('/', authenticate, isAdmin, ctrl.list);

// CAMBIAR ROL
router.put('/:id/role', authenticate, isAdmin, ctrl.changeRole);

//ACTUALIZAR A UN NUEVO USUARIO
router.put('/:id', authenticate, isAdmin, ctrl.updateUser);

// SOFT DELETE
router.delete('/:id', authenticate, isAdmin, ctrl.softDelete);

// RESTORE
router.post('/:id/restore', authenticate, isAdmin, ctrl.restore);

module.exports = router;
