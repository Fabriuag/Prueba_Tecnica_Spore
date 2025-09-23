// backend/src/controllers/vehicle.js
const { Op } = require('sequelize')
const { Vehicle, User } = require('../../models')

const toPoint = (lat, lon) =>
  (lat == null || lon == null)
    ? null
    : { type: 'Point', coordinates: [Number(lon), Number(lat)] }

/**
 * GET /api/vehicles
 * Query opcionales:
 *  - status: "active" | "deleted" | "all"   (default "active")
 *  - page, limit
 */
const list = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page  || '1', 10), 1)
    const limit = Math.max(parseInt(req.query.limit || '10', 10), 1)
    const offset = (page - 1) * limit

    const where = (req.user?.role === 'admin') ? {} : { userId: req.user.id }

    // Filtrado por estado (aprovechando paranoid)
    const status = (req.query.status || 'active').toLowerCase()
    let paranoid = true
    if (status === 'deleted') {
      paranoid = false
      where.deletedAt = { [Op.ne]: null }
    } else if (status === 'all') {
      paranoid = false
    } // "active" => paranoid:true (no hace falta where.deletedAt=null)

    const { rows, count } = await Vehicle.findAndCountAll({
      where,
      paranoid,
      include: [{ model: User, as: 'User', attributes: ['id','username','role','firstName','lastName','email'] }],
      limit, offset, order: [['id','ASC']]
    })

    res.json({
      data: rows,
      pagination: { page, limit, total: count, pages: Math.ceil(count/limit) }
    })
  } catch (e) {
    console.error('vehicle.list error:', e)
    res.status(500).json({ error: 'Failed to list vehicles' })
  }
}

const getById = async (req, res) => {
  const v = await Vehicle.findByPk(req.params.id, {
    include: [{ model: User, as: 'User', attributes: ['id','username','role','firstName','lastName','email'] }],
    paranoid: false
  })
  if (!v) return res.status(404).json({ error: 'Vehicle not found' })

  if (!(req.user?.role === 'admin' || req.user?.id === v.userId)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  res.json(v)
}

const create = async (req, res) => {
  try {
    const file = req.file
    const plates = req.body.plates || req.body.placas || req.body.plate || req.body.licensePlate
    const brand  = req.body.brand  || req.body.marca
    const model  = req.body.model  || req.body.modelo
    const color  = req.body.color
    const lat    = req.body.lat ?? req.body.latitud
    const lon    = req.body.lon ?? req.body.longitud
    let { userId } = req.body

    if (!plates || !brand) return res.status(400).json({ error: 'plates and brand are required' })
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

    if (req.user.role !== 'admin') userId = req.user.id
    if (userId) {
      const owner = await User.findByPk(userId, { paranoid: false })
      if (!owner) return res.status(400).json({ error: 'Owner user not found' })
    }

    const payload = { plates, brand, model, color, location: toPoint(lat, lon), userId }
    if (file?.buffer) payload.image = file.buffer

    const vehicle = await Vehicle.create(payload)

    const io = req.app.get('io')
    io?.to('admins').to(`user:${vehicle.userId}`).emit('vehicles:upsert', vehicle.toJSON())

    res.status(201).json(vehicle)
  } catch (e) {
    console.error('vehicle.create error:', e)
    res.status(500).json({ error: 'Failed to create vehicle' })
  }
}

const update = async (req, res) => {
  try {
    const v = await Vehicle.findByPk(req.params.id, { paranoid: false })
    if (!v) return res.status(404).json({ error: 'Vehicle not found' })
    if (!(req.user?.role === 'admin' || req.user?.id === v.userId))
      return res.status(403).json({ error: 'Forbidden' })

    const {
      plates, placas, plate, licensePlate,
      brand, marca,
      model, modelo,
      color,
      lat, latitud,
      lon, longitud,
      userId
    } = req.body
    const file = req.file

    const updates = {}
    const p = plates || placas || plate || licensePlate
    if (p) updates.plates = String(p).trim()
    if (brand || marca) updates.brand = (brand || marca).trim()
    if (typeof (model ?? modelo) !== 'undefined') updates.model = (model ?? modelo)?.trim?.() ?? null
    if (typeof color !== 'undefined') updates.color = color?.trim?.() ?? null

    const latVal = lat ?? latitud
    const lonVal = lon ?? longitud
    if (latVal != null && lonVal != null) updates.location = toPoint(latVal, lonVal)

    if (file?.buffer) updates.image = file.buffer

    // cambiar dueño solo admin
    if (req.user.role === 'admin' && typeof userId !== 'undefined') {
      if (userId === null || userId === '') {
        updates.userId = null
      } else {
        const owner = await User.findByPk(userId, { paranoid: false })
        if (!owner) return res.status(400).json({ error: 'Owner user not found' })
        updates.userId = userId
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    await v.update(updates)
    await v.reload({ include: [{ model: User, as: 'User', attributes: ['id','username','role'] }], paranoid: false })

    const io = req.app.get('io')
    io?.to('admins').to(`user:${v.userId}`).emit('vehicles:upsert', v.toJSON())

    res.json(v)
  } catch (e) {
    console.error('vehicle.update error:', e)
    res.status(500).json({ error: 'Failed to update vehicle' })
  }
}

/**
 * DELETE /api/vehicles/:id
 * Soft delete por defecto. Borrado definitivo con ?force=true (solo admin).
 */
const remove = async (req, res) => {
  try {
    const v = await Vehicle.findByPk(req.params.id, { paranoid: false })
    if (!v) return res.status(404).json({ error: 'Vehicle not found' })
    if (!(req.user?.role === 'admin' || req.user?.id === v.userId))
      return res.status(403).json({ error: 'Forbidden' })

    const hard = req.query.force === 'true'
    if (hard && req.user.role === 'admin') {
      await v.destroy({ force: true }) // elimina fila
    } else {
      await v.destroy() // marca deletedAt
    }

    const io = req.app.get('io')
    io?.to('admins').to(`user:${v.userId}`).emit('vehicles:remove', { id: v.id })

    res.json({ ok: true })
  } catch (e) {
    console.error('vehicle.remove error:', e)
    res.status(500).json({ error: 'Failed to delete vehicle' })
  }
}

/**
 * POST /api/vehicles/:id/restore
 * Restaura un soft delete.
 */
const restore = async (req, res) => {
  try {
    const v = await Vehicle.findByPk(req.params.id, { paranoid: false })
    if (!v) return res.status(404).json({ error: 'Vehicle not found' })
    if (!(req.user?.role === 'admin' || req.user?.id === v.userId))
      return res.status(403).json({ error: 'Forbidden' })
    if (!v.deletedAt) return res.status(400).json({ error: 'Vehicle is not deleted' })

    await v.restore()
    await v.reload({ paranoid: false })

    const io = req.app.get('io')
    io?.to('admins').to(`user:${v.userId}`).emit('vehicles:upsert', v.toJSON())

    res.json({ ok: true })
  } catch (e) {
    console.error('vehicle.restore error:', e)
    res.status(500).json({ error: 'Failed to restore vehicle' })
  }
}

const image = async (req, res) => {
  try {
    const v = await Vehicle.findByPk(req.params.id, { attributes: ['image','userId'], paranoid: false })
    if (!v || !v.image) return res.status(404).end()

    if (!(req.user?.role === 'admin' || req.user?.id === v.userId)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    res.set('Cache-Control', 'private, max-age=60')
    res.type('image/jpeg')
    return res.send(v.image)
  } catch (e) {
    console.error('vehicle.image error:', e)
    return res.status(500).json({ error: 'Failed to load image' })
  }
}

module.exports = { list, getById, create, update, remove, restore, image }
