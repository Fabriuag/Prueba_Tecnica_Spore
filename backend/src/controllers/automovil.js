// backend/src/controllers/automovil.js
const { Automovil, User } = require('../../models')

const list = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page  || '1', 10), 1)
    const limit = Math.max(parseInt(req.query.limit || '10', 10), 1)
    const offset = (page - 1) * limit

    const { rows, count } = await Automovil.findAndCountAll({
      include: [{ model: User, as: 'User', attributes: ['id', 'username', 'role'] }],
      limit,
      offset,
      order: [['id', 'ASC']],
    })

    res.json({
      data: rows,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    })
  } catch (err) {
    console.error('Automovil list error:', err?.stack || err)
    res.status(500).json({ error: 'Error al listar automóviles' })
  }
}

const getById = async (req, res) => {
  try {
    const car = await Automovil.findByPk(req.params.id, {
      include: [{ model: User, as: 'User', attributes: ['id', 'username', 'role'] }],
    })
    if (!car) return res.status(404).json({ error: 'Automóvil no encontrado' })
    res.json(car)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener automóvil' })
  }
}

const create = async (req, res) => {
  try {
    const { places, marca, color, modelo, latitud, longitud, userId } = req.body
    if (places == null || !marca) {
      return res.status(400).json({ error: 'places y marca son requeridos' })
    }
    const car = await Automovil.create({ places, marca, color, modelo, latitud, longitud, userId })
    res.status(201).json(car)
  } catch (err) {
    res.status(500).json({ error: 'Error al crear automóvil' })
  }
}

const update = async (req, res) => {
  try {
    const car = await Automovil.findByPk(req.params.id)
    if (!car) return res.status(404).json({ error: 'Automóvil no encontrado' })
    await car.update(req.body)
    res.json(car)
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar automóvil' })
  }
}

const remove = async (req, res) => {
  try {
    const car = await Automovil.findByPk(req.params.id)
    if (!car) return res.status(404).json({ error: 'Automóvil no encontrado' })
    await car.destroy()
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar automóvil' })
  }
}

const updatePosition = async (req, res) => {
  try {
    const { latitud, longitud } = req.body
    if (latitud == null || longitud == null) {
      return res.status(400).json({ error: 'latitud y longitud son requeridos' })
    }
    const car = await Automovil.findByPk(req.params.id)
    if (!car) return res.status(404).json({ error: 'Automóvil no encontrado' })
    await car.update({ latitud, longitud })
    res.json(car)
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar posición' })
  }
}

module.exports = { list, getById, create, update, remove, updatePosition }
