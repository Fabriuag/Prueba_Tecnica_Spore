<template>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="title">Panel de Control</h1>
        <p class="subtitle">
          Hola, <strong>{{ user?.username || '—' }}</strong>
          <span v-if="user?.role"> · Rol: {{ user.role }}</span>
        </p>
      </div>
      <div class="actions">
        <button class="btn" @click="refreshAll">Refrescar</button>
        <router-link class="btn" to="/vehicles">Vehículos</router-link>
        <router-link class="btn" to="/map">Mapa</router-link>
        <router-link class="btn" v-if=isAdmin to="/users">Usuarios</router-link>
        <button class="btn" @click="logoutConfirm">Cerrar sesión</button>
      </div>
    </div>

    <!-- Estado -->
    <section class="section">
      <h2 class="section-title">Estado</h2>
      <div class="cards-grid">
        <StatCard :label="'API'" :value="apiOk ? 'OK' : '—'" :subtext="pingSubtext" />
        <StatCard label="Sesión" :value="isAdmin ? 'Admin' : 'Regular'" />
        <StatCard label="Usuarios" :value="metrics.users" :subtext="ts(metrics.updatedAt)" />
        <StatCard label="Vehículos" :value="metrics.vehicles" :subtext="ts(metrics.updatedAt)" />
      </div>
      <p v-if="err" class="error">{{ err }}</p>
    </section>

    <!-- Últimos vehículos -->
    <section class="section">
      <h2 class="section-title">Últimos vehículos</h2>

      <div v-if="loadingRecent" class="muted">Cargando…</div>
      <div v-else-if="recentError" class="error">{{ recentError }}</div>

      <div v-else class="list">
        <div v-for="car in recent" :key="car.id" class="list-item">
          <div>
            <strong>{{ car.brand }}</strong>
            <span class="muted"> · {{ car.model || 's/modelo' }}</span>
            <div class="muted">
              Plates: {{ car.plates }} · Color: {{ car.color || '—' }}
              <span v-if="lat(car) != null && lon(car) != null">
                · ({{ lat(car).toFixed(4) }}, {{ lon(car).toFixed(4) }})
              </span>
            </div>
          </div>
          <div class="muted" v-if="car.User">
            {{ car.User.username }} ({{ car.User.role }})
          </div>
        </div>
        <div v-if="recent.length === 0" class="list-item muted">Sin registros.</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import router from '@/router'
import StatCard from '@/components/StatCard.vue'
import Swal from 'sweetalert2'

const user = ref(null)
const isAdmin = computed(() => user.value?.role === 'admin')
const apiOk = ref(false)
const err = ref('')
const ts = (x) => (x ? new Date(x).toLocaleString() : '')

const metrics = ref({ users: '—', vehicles: '—', updatedAt: '' })

const recent = ref([])
const loadingRecent = ref(false)
const recentError = ref('')

const lat = (car) => car?.location?.coordinates?.[1] ?? null
const lon = (car) => car?.location?.coordinates?.[0] ?? null

const loadUser = () => {
  try { user.value = JSON.parse(localStorage.getItem('user') || 'null') } catch { user.value = null }
}

const logoutConfirm = async () => {
  const result = await Swal.fire({
    title: '¿Cerrar sesión?',
    text: '¿Estás seguro que deseas salir?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar'
  })
  if (result.isConfirmed) {
    logout()
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const pingSubtext = computed(() => (isAdmin.value ? '/api/admin/dashboard' : '/health'))

const ping = async () => {
  try {
    const path = isAdmin.value ? '/admin/dashboard' : '/health'
    const cfg = isAdmin.value ? {} : { baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000') }
    const { data } = await api.get(path, cfg)
    apiOk.value = isAdmin.value ? !!data?.message : true
    err.value = ''
  } catch (e) {
    apiOk.value = false
    const s = e?.response?.status
    if (s === 401) return logout()
    err.value = s === 403 ? 'No autorizado' : (e?.response?.data?.error || 'Error')
  }
}

const fetchMetrics = async () => {
  if (!isAdmin.value) return
  try { metrics.value = (await api.get('/admin/metrics')).data } catch {}
}

const fetchRecentVehicles = async () => {
  loadingRecent.value = true; recentError.value = ''
  try {
    const { data } = await api.get('/vehicles', { params: { page: 1, limit: 5 } })
    recent.value = data?.data || []
  } catch (e) {
    recentError.value = e?.response?.data?.error || 'No se pudieron cargar los vehículos.'
  } finally {
    loadingRecent.value = false
  }
}

const refreshAll = async () => {
  err.value = ''
  const tasks = [ping(), fetchRecentVehicles()]
  if (isAdmin.value) tasks.push(fetchMetrics())
  await Promise.allSettled(tasks)
}

onMounted(() => { loadUser(); refreshAll() })
</script>