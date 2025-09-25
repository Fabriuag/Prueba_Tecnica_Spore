<!-- src/views/VehiclesView.vue -->
<template>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="title">Vehículos</h1>
        <p class="subtitle">
          Gestiona la flota.
          <span v-if="total">Total: {{ total }}</span>
        </p>
      </div>
      <div class="actions">
        <button class="btn" @click="fetchVehicles">Refrescar</button>
        <router-link class="btn" to="/dashboard">Volver al Panel</router-link>
      </div>
    </div>

    <!-- Crear (solo admin) -->
    <section v-if="isAdmin" class="section">
      <h2 class="section-title">Agregar vehículo</h2>
      <div class="card">
        <div class="cards-grid">
          <div>
            <div class="stat-label">Plates</div>
            <input class="btn" style="width:100%" v-model.trim="form.plates" type="text" />
          </div>
          <div>
            <div class="stat-label">Brand</div>
            <input class="btn" style="width:100%" v-model.trim="form.brand" type="text" />
          </div>
          <div>
            <div class="stat-label">Model</div>
            <input class="btn" style="width:100%" v-model.trim="form.model" type="text" />
          </div>
          <div>
            <div class="stat-label">Color</div>
            <input class="btn" style="width:100%" v-model.trim="form.color" type="text" />
          </div>
          <div>
            <div class="stat-label">Image</div>
            <input type="file" @change="onFile" accept="image/*" />
            <div v-if="fileName" class="muted" style="margin-top:6px;">{{ fileName }}</div>
          </div>
          <div>
            <div class="stat-label">Lat</div>
            <input class="btn" style="width:100%" v-model.number="form.lat" type="number" step="0.0001" />
          </div>
          <div>
            <div class="stat-label">Lon</div>
            <input class="btn" style="width:100%" v-model.number="form.lon" type="number" step="0.0001" />
          </div>

          <!-- Owner (solo admin) -->
          <div v-if="isAdmin">
            <div class="stat-label">Propietario (opcional)</div>
            <select
              class="btn"
              style="width:100%"
              v-model="form.userId"
              :disabled="ownersLoading"
              @focus="ensureOwners()"
            >
              <option value="" class="text-black">Sin propietario</option>
              <option
              class="text-black"
                v-for="u in owners"
                :key="u.id"
                :value="String(u.id)"
              >
                {{ u.firstName || '—' }} {{ u.lastName || '' }} ({{ u.username }}) — ID {{ u.id }}
              </option>
            </select>
            <small v-if="ownersLoading" class="muted">Cargando usuarios…</small>
            <small v-if="ownersError" class="error">{{ ownersError }}</small>
          </div>
        </div>

        <div style="margin-top:12px; display:flex; gap:8px;">
          <button class="btn btn--primary" :disabled="creating" @click="createCar">
            {{ creating ? 'Creando…' : 'Crear' }}
          </button>
          <button class="btn" :disabled="creating" @click="resetForm">Limpiar</button>
        </div>
        <p v-if="createError" class="error">{{ createError }}</p>
      </div>
    </section>

    <!-- Controles de lista -->
    <section class="section" style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
      <div>
        <div class="stat-label">Estado</div>
        <select class="btn" v-model="status" @change="goFirstPage">
          <option value="active" class="text-black">Activos</option>
          <option value="deleted" class="text-black">Eliminados</option>
          <option value="all" class="text-black">Todos</option>
        </select>
      </div>

      <div>
        <div class="stat-label">Límite</div>
        <select class="btn" v-model.number="limit" @change="goFirstPage">
          <option :value="5" class="text-black">5</option>
          <option :value="10" class="text-black">10</option>
          <option :value="20" class="text-black">20</option>
        </select>
      </div>
    </section>

    <!-- Lista -->
    <section class="section">
      <h2 class="section-title">Listado</h2>

      <div v-if="loading" class="muted">Cargando…</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else class="list">
        <div v-for="car in vehicles" :key="car.id" class="list-item" style="align-items:center;">
          <div style="display:flex; gap:12px; align-items:center;">
            <img
              :src="imageUrlById[car.id] || placeholderUrl"
              alt="vehicle"
              style="width:64px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #eee;"
            />
            <div>
              <strong>{{ car.brand }}</strong>
              <span class="muted"> · {{ car.model || 's/modelo' }}</span>
              <div class="muted">
                Plates: {{ car.plates }} · Color: {{ car.color || '—' }}
                <span v-if="lat(car) != null && lon(car) != null">
                  · ({{ lat(car).toFixed(4) }}, {{ lon(car).toFixed(4) }})
                </span>
              </div>
              <div class="muted" v-if="car.User">
                Usuario: {{ car.User.firstName }} {{ car.User.lastName }} ({{ car.User.username }})
              </div>
              <div class="badge" v-if="car.deletedAt" style="margin-top:6px;">Eliminado</div>
            </div>
          </div>

          <!-- Acciones -->
          <div style="display:flex; gap:8px; align-items:center;">
            <template v-if="!car.deletedAt">
              <button class="btn" v-if="canEdit(car)" @click="openEdit(car)">Editar</button>

              <template v-if="isAdmin">
                <button class="btn" @click="setRandomPos(car)">Posición aleatoria</button>
                <button class="btn" @click="openPosition(car)">Posición manual</button>
                <button class="btn" style="border-color:#fca5a5;color:#b91c1c" @click="removeCar(car.id)">
                  Eliminar
                </button>
              </template>
            </template>

            <template v-else>
              <button class="btn btn--primary" @click="restoreCar(car.id)">Restaurar</button>
            </template>
          </div>
        </div>

        <div v-if="vehicles.length === 0" class="list-item muted">Sin registros.</div>
      </div>

      <!-- Paginación -->
      <div class="section" style="display:flex; align-items:center; gap:8px;">
        <button class="btn" :disabled="page<=1" @click="prevPage">« Anterior</button>
        <span>Página {{ page }} de {{ pages }}</span>
        <button class="btn" :disabled="page>=pages" @click="nextPage">Siguiente »</button>
      </div>
    </section>

    <!-- Diálogo posición manual -->
    <div
      v-if="showPosDialog"
      class="card"
      style="position:fixed; right:16px; bottom:16px; max-width:360px; z-index:2000"
    >
      <h3 class="section-title" style="margin-bottom:10px;">Actualizar posición</h3>
      <div class="grid">
        <div>
          <div class="stat-label">Latitud</div>
          <input class="btn" style="width:100%" v-model.number="posForm.lat" type="number" step="0.0001" />
        </div>
        <div>
          <div class="stat-label">Longitud</div>
          <input class="btn" style="width:100%" v-model.number="posForm.lon" type="number" step="0.0001" />
        </div>
      </div>
      <div style="margin-top:12px; display:flex; gap:8px;">
        <button class="btn btn--primary" :disabled="updatingPos" @click="savePosition">Guardar</button>
        <button class="btn" :disabled="updatingPos" @click="closePosition">Cancelar</button>
      </div>
      <p v-if="posError" class="error">{{ posError }}</p>
    </div>

    <!-- Diálogo EDITAR vehículo -->
    <div
      v-if="showEditDialog"
      class="card"
      style="position:fixed; right:16px; bottom:16px; max-width:420px; z-index:2000"
    >
      <h3 class="section-title" style="margin-bottom:10px;">Editar vehículo</h3>
      <div class="grid">
        <div>
          <div class="stat-label">Plates</div>
          <input type="text" class="btn" style="width:100%" v-model.trim="editForm.plates" />
        </div>
        <div>
          <div class="stat-label">Brand</div>
          <input type="text" class="btn" style="width:100%" v-model.trim="editForm.brand" />
        </div>
        <div>
          <div class="stat-label">Model</div>
          <input type="text" class="btn" style="width:100%" v-model.trim="editForm.model" />
        </div>
        <div>
          <div class="stat-label">Color</div>
          <input type="text" class="btn" style="width:100%" v-model.trim="editForm.color" />
        </div>

        <!-- Owner (solo admin) -->
        <div v-if="isAdmin">
          <div class="stat-label">Propietario (opcional)</div>
          <select
            class="btn"
            style="width:100%"
            v-model="editForm.userId"
            :disabled="ownersLoading"
            @focus="ensureOwners()"
          >
            <option value=""
            class="text-black">Sin propietario</option>
            <option
              v-for="u in owners"
              :key="u.id"
              :value="String(u.id)"
              class="text-black"
            >
              {{ u.firstName || '—' }} {{ u.lastName || '' }} ({{ u.username }}) — ID {{ u.id }}
            </option>
          </select>
          <small v-if="ownersLoading" class="muted">Cargando usuarios…</small>
          <small v-if="ownersError" class="error">{{ ownersError }}</small>
        </div>

        <div>
          <div class="stat-label">Image (opcional)</div>
          <input type="file" @change="onEditFile" accept="image/*" />
          <div v-if="editFileName" class="muted" style="margin-top:6px;">{{ editFileName }}</div>
        </div>
      </div>

      <div style="margin-top:12px; display:flex; gap:8px;">
        <button class="btn btn--primary" :disabled="savingEdit" @click="saveEdit">Guardar cambios</button>
        <button class="btn" :disabled="savingEdit" @click="closeEdit">Cancelar</button>
      </div>
      <p v-if="editError" class="error">{{ editError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import api from '@/services/api'

/* sesión/rol */
const me = ref(null)
const myId = computed(() => me.value?.id)
const isAdmin = computed(() => {
  try { return (me.value || JSON.parse(localStorage.getItem('user') || 'null'))?.role === 'admin' }
  catch { return false }
})

/* helpers coords GEOGRAPHY */
const lat = (car) => car?.location?.coordinates?.[1] ?? null
const lon = (car) => car?.location?.coordinates?.[0] ?? null

/* estado de lista */
const vehicles = ref([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const pages = ref(1)
const status = ref('active') // 'active' | 'deleted' | 'all'
const loading = ref(false)
const error = ref('')

/* owners (solo admin) */
const owners = ref([])
const ownersLoading = ref(false)
const ownersError = ref('')

/* imágenes (blob URLs) */
const imageUrlById = ref({})
const objectUrls = new Set()
const placeholderUrl =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="96"><rect width="100%" height="100%" fill="%23eeeeee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="12">No image</text></svg>'

/* crear */
const form = ref({
  plates: '', brand: '', model: '', color: '',
  lat: null, lon: null, userId: '' // '' = sin propietario
})
const file = ref(null)
const fileName = ref('')
const creating = ref(false)
const createError = ref('')

const resetForm = () => {
  form.value = { plates: '', brand: '', model: '', color: '', lat: null, lon: null, userId: '' }
  file.value = null
  fileName.value = ''
}
const onFile = (e) => {
  file.value = e.target.files?.[0] || null
  fileName.value = file.value ? file.value.name : ''
}

/* EDITAR */
const showEditDialog = ref(false)
const editId = ref(null)
const editForm = ref({ plates: '', brand: '', model: '', color: '', userId: '' })
const editFile = ref(null)
const editFileName = ref('')
const savingEdit = ref(false)
const editError = ref('')

const canEdit = (car) => !car.deletedAt && (isAdmin.value || car.userId === myId.value)

const openEdit = (car) => {
  editId.value = car.id
  editForm.value = {
    plates: car.plates || '',
    brand : car.brand  || '',
    model : car.model  || '',
    color : car.color  || '',
    userId: car.userId != null ? String(car.userId) : ''
  }
  editFile.value = null
  editFileName.value = ''
  editError.value = ''
  showEditDialog.value = true
  // Por si entras aquí antes de que owners haya cargado
  ensureOwners()
}

const closeEdit = () => {
  showEditDialog.value = false
  editId.value = null
}

const onEditFile = (e) => {
  editFile.value = e.target.files?.[0] || null
  editFileName.value = editFile.value ? editFile.value.name : ''
}

/* API owners (solo admin) */
const fetchOwners = async () => {
  if (!isAdmin.value) return
  ownersLoading.value = true
  ownersError.value = ''
  try {
    const { data } = await api.get('/users', {
      params: { status: 'active', limit: 200, sortBy: 'username', sortDir: 'asc', page: 1 }
    })
    owners.value = data?.data || []
  } catch (e) {
    ownersError.value = e?.response?.data?.error || 'No se pudieron cargar usuarios'
  } finally {
    ownersLoading.value = false
  }
}

/* Evita llamadas duplicadas y dispara carga en foco/diálogo */
const ensureOwners = () => {
  if (!isAdmin.value) return
  if (ownersLoading.value) return
  if (owners.value.length > 0) return
  fetchOwners()
}

const saveEdit = async () => {
  editError.value = ''
  if (!editForm.value.plates || !editForm.value.brand) {
    editError.value = 'plates y brand son requeridos'
    return
  }
  try {
    savingEdit.value = true

    const fd = new FormData()
    fd.append('plates', editForm.value.plates.trim())
    fd.append('brand',  editForm.value.brand.trim())
    fd.append('model',  (editForm.value.model || '').trim())
    fd.append('color',  (editForm.value.color || '').trim())

    // userId: '' => backend lo convierte a null (tu controller ya lo maneja)
    if (isAdmin.value) fd.append('userId', editForm.value.userId)

    if (editFile.value) fd.append('image', editFile.value)

    await api.put(`/vehicles/${editId.value}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    showEditDialog.value = false
    await fetchVehicles()
    const oldUrl = imageUrlById.value[editId.value]
    if (oldUrl) { URL.revokeObjectURL(oldUrl); objectUrls.delete(oldUrl) }
    await loadImage(editId.value, true)
  } catch (e) {
    editError.value = e?.response?.data?.error || 'No se pudo guardar cambios'
  } finally {
    savingEdit.value = false
  }
}

/* posición manual */
const showPosDialog = ref(false)
const posCarId = ref(null)
const posForm = ref({ lat: null, lon: null })
const updatingPos = ref(false)
const posError = ref('')

/* API vehicles */
const fetchVehicles = async () => {
  loading.value = true; error.value = ''
  try {
    const { data } = await api.get('/vehicles', { params: { page: page.value, limit: limit.value, status: status.value } })
    vehicles.value = data?.data || []
    total.value = data?.pagination?.total || vehicles.value.length
    pages.value = data?.pagination?.pages || 1
    page.value = data?.pagination?.page || page.value

    for (const v of vehicles.value) {
      if (!imageUrlById.value[v.id]) await loadImage(v.id, /*silent*/ true)
    }
  } catch (e) {
    error.value = e?.response?.data?.error || 'Error al cargar vehículos'
  } finally {
    loading.value = false
  }
}

const loadImage = async (id, silent = false) => {
  try {
    const res = await api.get(`/vehicles/${id}/image`, { responseType: 'blob' })
    if (res && res.data) {
      const url = URL.createObjectURL(res.data)
      imageUrlById.value = { ...imageUrlById.value, [id]: url }
      objectUrls.add(url)
    }
  } catch (e) {
    if (!silent) console.warn('No image for vehicle', id)
  }
}

const createCar = async () => {
  createError.value = ''
  if (!form.value.plates || !form.value.brand) {
    createError.value = 'plates y brand son requeridos'
    return
  }
  try {
    creating.value = true
    const fd = new FormData()
    fd.append('plates', form.value.plates.trim())
    fd.append('brand',  form.value.brand.trim())
    if (form.value.model) fd.append('model', form.value.model.trim())
    if (form.value.color) fd.append('color', form.value.color.trim())
    if (form.value.lat != null) fd.append('lat', String(form.value.lat))
    if (form.value.lon != null) fd.append('lon', String(form.value.lon))

    if (isAdmin.value) fd.append('userId', form.value.userId) // '' => sin propietario
    if (file.value) fd.append('image', file.value)

    await api.post('/vehicles', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    resetForm()
    page.value = 1
    await fetchVehicles()
  } catch (e) {
    createError.value = e?.response?.data?.error || 'Error al crear'
  } finally {
    creating.value = false
  }
}

const removeCar = async (id, hard = false) => {
  const label = hard ? 'PERMANENTEMENTE' : 'lógicamente'
  if (!confirm(`¿Eliminar ${label} este vehículo?`)) return
  try {
    await api.delete(`/vehicles/${id}`, { params: hard ? { force: true } : {} })
    if (vehicles.value.length === 1 && page.value > 1) page.value -= 1
    await fetchVehicles()
    const url = imageUrlById.value[id]
    if (url) { URL.revokeObjectURL(url); objectUrls.delete(url) }
    const copy = { ...imageUrlById.value }; delete copy[id]; imageUrlById.value = copy
  } catch (e) {
    error.value = e?.response?.data?.error || 'Error al eliminar'
  }
}

const restoreCar = async (id) => {
  try {
    await api.post(`/vehicles/${id}/restore`)
    await fetchVehicles()
  } catch (e) {
    error.value = e?.response?.data?.error || 'No se pudo restaurar'
  }
}

const setRandomPos = async (car) => {
  const newLat = 20.6 + Math.random() * 0.2
  const newLon = -103.5 + Math.random() * 0.2
  try {
    await api.put(`/vehicles/${car.id}`, { lat: newLat, lon: newLon })
    await fetchVehicles()
  } catch (e) {
    error.value = e?.response?.data?.error || 'Error al actualizar posición'
  }
}

/* posición manual helpers */
const openPosition = (car) => {
  posCarId.value = car.id
  posForm.value.lat = lat(car)
  posForm.value.lon = lon(car)
  posError.value = ''
  showPosDialog.value = true
}
const closePosition = () => { showPosDialog.value = false; posCarId.value = null }
const savePosition = async () => {
  posError.value = ''
  if (posForm.value.lat == null || posForm.value.lon == null) {
    posError.value = 'Latitud y longitud son requeridos'
    return
  }
  try {
    updatingPos.value = true
    await api.put(`/vehicles/${posCarId.value}`, { lat: posForm.value.lat, lon: posForm.value.lon })
    showPosDialog.value = false
    await fetchVehicles()
  } catch (e) {
    posError.value = e?.response?.data?.error || 'No se pudo guardar'
  } finally {
    updatingPos.value = false
  }
}

/* paginación y filtros */
const prevPage = () => { if (page.value > 1) { page.value -= 1; fetchVehicles() } }
const nextPage = () => { if (page.value < pages.value) { page.value += 1; fetchVehicles() } }
const goFirstPage = () => { page.value = 1; fetchVehicles() }
watch(limit, () => goFirstPage())
watch(status, () => goFirstPage())

/* si el rol “cambia” a admin (o ya lo es), asegura owners */
watch(isAdmin, (val) => { if (val) ensureOwners() })

/* init */
onMounted(async () => {
  try { me.value = JSON.parse(localStorage.getItem('user') || 'null') } catch {}
  // Carga owners lo antes posible si eres admin
  ensureOwners()
  await fetchVehicles()
})

onBeforeUnmount(() => {
  for (const url of objectUrls) URL.revokeObjectURL(url)
  objectUrls.clear()
})
</script>
