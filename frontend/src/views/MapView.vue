<template>
  <div class="container">
    <div class="header">
      <div>
        <h1 class="title">Mapa de vehículos</h1>
        <p class="subtitle">Se actualiza en tiempo real con Socket.IO</p>
      </div>
      <div class="actions">
        <router-link class="btn" to="/vehicles">Volver a lista de vehículos</router-link>
        <router-link class="btn" to="/dashboard">Volver al panel de control</router-link>
      </div>
    </div>

    <div class="map-wrapper">
      <l-map v-if="ready" :zoom="zoom" :center="center" style="height: 70vh; border-radius: 16px;">
        <l-tile-layer :url="url" :attribution="attribution" />
        <l-marker
          v-for="car in withPos"
          :key="car.id"
          :lat-lng="[lat(car), lon(car)]"
        >
          <l-popup>
            <strong>{{ car.brand }} {{ car.model || '' }}</strong><br />
            Plates: {{ car.plates }}<br />
            {{ car.color ? 'Color: ' + car.color : '' }}<br />
            ({{ lat(car).toFixed(4) }}, {{ lon(car).toFixed(4) }})
          </l-popup>
        </l-marker>
      </l-map>
      <div v-else class="muted">Cargando mapa…</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import api from '@/services/api'
import { io } from 'socket.io-client'
import 'leaflet/dist/leaflet.css'

// Fix icons Leaflet con Vite
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

/* --- mapa --- */
const ready = ref(false)
const zoom = ref(12)
const center = ref([20.67, -103.35])
const url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const attribution = '&copy; OpenStreetMap contributors'

/* --- helpers GEOGRAPHY(Point,4326) => [lon,lat] --- */
const lat = (car) => car?.location?.coordinates?.[1] ?? null
const lon = (car) => car?.location?.coordinates?.[0] ?? null

/* --- sesión / rol --- */
const me = ref(null)
const isAdmin = computed(() => me.value?.role === 'admin')
const myId = computed(() => me.value?.id)

/* --- estado --- */
const byId = ref(new Map())
const vehicles = computed(() => Array.from(byId.value.values()))
// OJO: 0 es válido; verifica null/undefined
const withPos = computed(() => vehicles.value.filter(v => lat(v) != null && lon(v) != null))

let socket
// let pollTimer // si quisieras fallback de polling, déjalo comentado

/* --- CRUD local reactivo --- */
const upsert = (car) => {
  car.id = Number(car.id)
  // si NO soy admin, ignoro vehículos que no sean míos
  if (!isAdmin.value && car.userId !== myId.value) return
  byId.value.set(car.id, { ...car })
  byId.value = new Map(byId.value)
}

const removeOne = (id) => {
  byId.value.delete(Number(id))
  byId.value = new Map(byId.value)
}

/* --- cargar lista inicial (el backend ya filtra por rol) --- */
const fetchAll = async () => {
  try {
    const { data } = await api.get('/vehicles', { params: { page: 1, limit: 500 } })
    const arr = data?.data || []
    const map = new Map()
    for (const c of arr) map.set(Number(c.id), c)
    byId.value = map
  } catch (e) {
    console.error('map fetch error', e?.response?.data || e.message)
  }
}

onMounted(async () => {
  try { me.value = JSON.parse(localStorage.getItem('user') || 'null') } catch {}
  await fetchAll()
  ready.value = true

  // WebSocket puro para mínima latencia
  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
    auth: { token: localStorage.getItem('token') },
    transports: ['websocket'],
    upgrade: false
  })
  socket.on('connect', () => console.log('🟢 socket conectado', socket.id))
  socket.on('disconnect', () => console.log('🔴 socket desconectado'))

  // eventos en tiempo real
  socket.on('vehicles:upsert', (car) => {
    // (Opcional) medir lag:
    // if (car.sentAt) console.log('lag', Date.now() - car.sentAt, 'ms')
    upsert(car)
  })
  socket.on('vehicles:remove', ({ id }) => removeOne(id))

  // Fallback desactivado para que no “emule” realtime:
  // pollTimer = setInterval(fetchAll, 30000)
})

onBeforeUnmount(() => {
  // if (pollTimer) clearInterval(pollTimer)
  if (socket) socket.close()
})
</script>


<style scoped>
.map-wrapper { margin-top: 16px; }
</style>
