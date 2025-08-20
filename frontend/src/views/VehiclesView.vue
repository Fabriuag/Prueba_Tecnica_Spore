<template>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="title">Vehículos</h1>
        <p class="subtitle">
          Gestiona la flota. <span v-if="total">Total: {{ total }}</span>
        </p>
      </div>
      <div class="actions">
        <button class="btn" @click="fetchVehicles">Refrescar</button>
      </div>
    </div>

    <!-- Crear (solo admin) -->
    <section v-if="isAdmin" class="section">
      <h2 class="section-title">Agregar vehículo</h2>
      <div class="card">
        <div class="grid">
          <div>
            <div class="stat-label">Placas</div>
            <input type="number" class="btn" style="width:100%" v-model.number="form.places" min="1" />
          </div>
          <div>
            <div class="stat-label">Marca</div>
            <input class="btn" style="width:100%" v-model="form.marca" />
          </div>
          <div>
            <div class="stat-label">Modelo</div>
            <input class="btn" style="width:100%" v-model="form.modelo" />
          </div>
          <div>
            <div class="stat-label">Color</div>
            <input class="btn" style="width:100%" v-model="form.color" />
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

    <!-- Lista -->
    <section class="section">
      <h2 class="section-title">Listado</h2>

      <div v-if="loading" class="muted">Cargando…</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else class="list">
        <div v-for="car in vehicles" :key="car.id" class="list-item">
          <div>
            <strong>{{ car.marca }}</strong>
            <span class="muted"> · {{ car.modelo || 's/modelo' }}</span>
            <div class="muted">
              Placas: {{ car.places }} · Color: {{ car.color || '—' }}
              <span v-if="car.latitud != null && car.longitud != null">
                · ({{ car.latitud.toFixed(4) }}, {{ car.longitud.toFixed(4) }})
              </span>
            </div>
            <div class="muted" v-if="car.User">
              Usuario: {{ car.User.username }} ({{ car.User.role }})
            </div>
          </div>

          <div v-if="isAdmin" style="display:flex; gap:8px; align-items:center;">
            <button class="btn" @click="setRandomPos(car)">Posición aleatoria</button>
            <button class="btn" @click="openPosition(car)">Posición manual</button>
            <button class="btn" style="border-color:#fca5a5;color:#b91c1c" @click="removeCar(car.id)">Eliminar</button>
          </div>
        </div>

        <div v-if="vehicles.length === 0" class="list-item muted">Sin registros.</div>
      </div>

      <!-- Paginación -->
      <div class="section" style="display:flex; align-items:center; gap:8px;">
        <button class="btn" :disabled="page<=1" @click="prevPage">« Anterior</button>
        <span>Página {{ page }} de {{ pages }}</span>
        <button class="btn" :disabled="page>=pages" @click="nextPage">Siguiente »</button>
        <span class="muted"> · Límite:</span>
        <select class="btn" v-model.number="limit" @change="goFirstPage">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
      </div>
    </section>

    <!-- Dialogo simple para posición manual -->
    <div v-if="showPosDialog" class="card" style="position:fixed; right:16px; bottom:16px; max-width:360px; z-index:50">
      <h3 class="section-title" style="margin-bottom:10px;">Actualizar posición</h3>
      <div class="grid">
        <div>
          <div class="stat-label">Latitud</div>
          <input class="btn" style="width:100%" v-model.number="posForm.latitud" type="number" step="0.0001" />
        </div>
        <div>
          <div class="stat-label">Longitud</div>
          <input class="btn" style="width:100%" v-model.number="posForm.longitud" type="number" step="0.0001" />
        </div>
      </div>
      <div style="margin-top:12px; display:flex; gap:8px;">
        <button class="btn btn--primary" :disabled="updatingPos" @click="savePosition">Guardar</button>
        <button class="btn" :disabled="updatingPos" @click="closePosition">Cancelar</button>
      </div>
      <p v-if="posError" class="error">{{ posError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/services/api'

/* --- sesión/rol (solo para mostrar acciones admin) --- */
const isAdmin = computed(() => {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    return u?.role === 'admin'
  } catch { return false }
})

/* --- estado de lista --- */
const vehicles = ref([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const pages = ref(1)
const loading = ref(false)
const error = ref('')

/* --- crear --- */
const form = ref({ places: 4, marca: '', modelo: '', color: '' })
const creating = ref(false)
const createError = ref('')
const resetForm = () => { form.value = { places: 4, marca: '', modelo: '', color: '' } }

/* --- posición manual --- */
const showPosDialog = ref(false)
const posCarId = ref(null)
const posForm = ref({ latitud: null, longitud: null })
const updatingPos = ref(false)
const posError = ref('')

/* --- API calls --- */
const fetchVehicles = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/automoviles', { params: { page: page.value, limit: limit.value } })
    vehicles.value = data?.data || []
    total.value = data?.pagination?.total || vehicles.value.length
    pages.value = data?.pagination?.pages || 1
  } catch (e) {
    error.value = e?.response?.data?.error || 'Error al cargar vehículos'
  } finally {
    loading.value = false
  }
}

const createCar = async () => {
  createError.value = ''
  if (!form.value.marca || form.value.places == null) {
    createError.value = 'places y marca son requeridos'
    return
  }
  try {
    creating.value = true
    await api.post('/automoviles', form.value)
    resetForm()
    // si estabas en páginas altas, vuelve a la primera para ver el nuevo
    page.value = 1
    await fetchVehicles()
  } catch (e) {
    createError.value = e?.response?.data?.error || 'Error al crear'
  } finally {
    creating.value = false
  }
}

const removeCar = async (id) => {
  if (!confirm('¿Eliminar vehículo?')) return
  try {
    await api.delete(`/automoviles/${id}`)
    // si borras el último de la página, ajusta página
    if (vehicles.value.length === 1 && page.value > 1) page.value -= 1
    await fetchVehicles()
  } catch (e) {
    error.value = e?.response?.data?.error || 'Error al eliminar'
  }
}

const setRandomPos = async (car) => {
  const lat = 20.6 + Math.random() * 0.2
  const lon = -103.5 + Math.random() * 0.2
  try {
    await api.post(`/automoviles/${car.id}/position`, { latitud: lat, longitud: lon })
    await fetchVehicles()
  } catch (e) {
    error.value = e?.response?.data?.error || 'Error al actualizar posición'
  }
}

/* --- posición manual helpers --- */
const openPosition = (car) => {
  posCarId.value = car.id
  posForm.value.latitud = car.latitud ?? null
  posForm.value.longitud = car.longitud ?? null
  posError.value = ''
  showPosDialog.value = true
}
const closePosition = () => {
  showPosDialog.value = false
  posCarId.value = null
}
const savePosition = async () => {
  posError.value = ''
  if (posForm.value.latitud == null || posForm.value.longitud == null) {
    posError.value = 'Latitud y longitud son requeridos'
    return
  }
  try {
    updatingPos.value = true
    await api.post(`/automoviles/${posCarId.value}/position`, {
      latitud: posForm.value.latitud,
      longitud: posForm.value.longitud
    })
    showPosDialog.value = false
    await fetchVehicles()
  } catch (e) {
    posError.value = e?.response?.data?.error || 'No se pudo guardar'
  } finally {
    updatingPos.value = false
  }
}

/* --- paginación --- */
const prevPage = () => { if (page.value > 1) { page.value -= 1; fetchVehicles() } }
const nextPage = () => { if (page.value < pages.value) { page.value += 1; fetchVehicles() } }
const goFirstPage = () => { page.value = 1; fetchVehicles() }

watch(limit, () => goFirstPage())

/* --- init --- */
onMounted(fetchVehicles)
</script>
