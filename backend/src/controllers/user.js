// backend/src/controllers/user.js
const { Op } = require('sequelize');
const { User } = require('../../models');

/**
 * GET /api/users
 * Query:
 *  q, role('admin'|'regular'), status('active'|'deleted'|'all'),
 *  from(YYYY-MM-DD), to(YYYY-MM-DD),
 *  sortBy('createdAt'|'username'|'email'|'role'), sortDir('asc'|'desc'),
 *  page, limit
 */
const list = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
    const offset = (page - 1) * limit;

    const where = {};

    // texto libre
    const q = (req.query.q || '').trim();
    if (q) {
      const pat = `%${q}%`;
      where[Op.or] = [
        { username:  { [Op.iLike]: pat } },
        { email:     { [Op.iLike]: pat } },
        { firstName: { [Op.iLike]: pat } },
        { lastName:  { [Op.iLike]: pat } },
      ];
    }

    // rol
    const role = (req.query.role || '').trim().toLowerCase();
    if (role === 'admin' || role === 'regular') where.role = role;

    // rango de fechas (createdAt)
    const from = req.query.from;
    const to   = req.query.to;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(`${from}T00:00:00.000Z`);
      if (to)   where.createdAt[Op.lte] = new Date(`${to}T23:59:59.999Z`);
    }

    // estado -> activo, borrado, todos
    const status = (req.query.status || 'active').toLowerCase();
    // - active  => paranoid: true (solo activos)
    // - deleted => paranoid: false + where.deletedAt != null
    // - all     => paranoid: false (activos y borrados)
    let paranoid = true;
    if (status === 'deleted') {
      paranoid = false;
      where.deletedAt = { [Op.ne]: null };
    } else if (status === 'all') {
      paranoid = false;
    }

    // orden
    const allowedSort = new Set(['createdAt', 'username', 'email', 'role']);
    const sortBy  = allowedSort.has(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const sortDir = (String(req.query.sortDir).toLowerCase() === 'asc') ? 'ASC' : 'DESC';

    const { rows, count } = await User.findAndCountAll({
      where,
      paranoid,
      offset,
      limit,
      order: [[sortBy, sortDir]],
    });

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.max(1, Math.ceil(count / limit)),
      },
    });
  } catch (e) {
    console.error('users.list error:', e);
    res.status(500).json({ error: 'Failed to list users' });
  }
};

const changeRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'regular'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const u = await User.findByPk(req.params.id, { paranoid: false });
    if (!u) return res.status(404).json({ error: 'User not found' });

    await u.update({ role });
    res.json(u);
  } catch (e) {
    res.status(500).json({ error: 'Failed to change role' });
  }
};

const softDelete = async (req, res) => {
  try {
    const u = await User.findByPk(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });

    await u.destroy(); // paranoid:true -> marca deletedAt
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

const restore = async (req, res) => {
  try {
    const u = await User.findByPk(req.params.id, { paranoid: false });
    if (!u) return res.status(404).json({ error: 'User not found' });
    if (!u.deletedAt) return res.status(400).json({ error: 'User is not deleted' });

    await u.restore();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to restore user' });
  }
};

module.exports = { list, changeRole, softDelete, restore };
