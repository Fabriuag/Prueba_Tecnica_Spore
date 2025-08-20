<template>
  <div class="container">
    <div class="header">
      <div>
        <h1 class="title">Mapa de vehículos</h1>
        <p class="subtitle">Se actualiza en tiempo real con Socket.IO</p>
      </div>
      <div class="actions">
        <router-link class="btn" to="/vehicles">Volver a lista</router-link>
      </div>
    </div>

    <div class="map-wrapper">
      <l-map v-if="ready" :zoom="zoom" :center="center" style="height: 70vh; border-radius: 16px;">
        <l-tile-layer :url="url" :attribution="attribution" />
        <l-marker
          v-for="car in withPos"
          :key="car.id"
          :lat-lng="[car.latitud, car.longitud]"
        >
          <l-popup>
            <strong>{{ car.marca }} {{ car.modelo || '' }}</strong><br />
            Lugares: {{ car.places }}<br />
            {{ car.color ? 'Color: ' + car.color : '' }}<br />
            ({{ car.latitud.toFixed(4) }}, {{ car.longitud.toFixed(4) }})
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

// Fix iconos Leaflet con Vite
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

const ready = ref(false)
const zoom = ref(12)
const center = ref([20.67, -103.35]) // ajusta a tu zona

const url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const attribution = '&copy; OpenStreetMap contributors'

// Estado
const byId = ref(new Map())  // almacenamiento eficiente por id
const vehicles = computed(() => Array.from(byId.value.values()))
const withPos = computed(() => vehicles.value.filter(v => v.latitud != null && v.longitud != null))

let socket
let pollTimer

const upsert = (car) => {
  // forzamos número de id por seguridad
  car.id = Number(car.id)
  const copy = { ...car }
  byId.value.set(copy.id, copy)
  // disparar recomputación
  byId.value = new Map(byId.value)
}

const removeOne = (id) => {
  byId.value.delete(Number(id))
  byId.value = new Map(byId.value)
}

const fetchAll = async () => {
  try {
    const { data } = await api.get('/automoviles', { params: { page: 1, limit: 500 } })
    const arr = data?.data || []
    const map = new Map()
    for (const c of arr) map.set(Number(c.id), c)
    byId.value = map
  } catch (e) {
    console.error('map fetch error', e?.response?.data || e.message)
  }
}

onMounted(async () => {
  await fetchAll()
  ready.value = true

  // Conecta socket
  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000')
  socket.on('connect', () => console.log('🟢 socket conectado', socket.id))
  socket.on('disconnect', () => console.log('🔴 socket desconectado'))

  socket.on('vehicles:upsert', (car) => upsert(car))
  socket.on('vehicles:remove', ({ id }) => removeOne(id))

  // Fallback: por si el socket cae, refresca cada 30s
  pollTimer = setInterval(fetchAll, 30000)
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (socket) socket.close()
})
</script>

<style scoped>
.map-wrapper { margin-top: 16px; }
</style>
