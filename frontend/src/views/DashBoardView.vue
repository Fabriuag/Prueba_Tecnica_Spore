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
        <router-link class="btn" to="/mapa">Mapa</router-link>
        <button class="btn" @click="logout">Cerrar sesión</button>
      </div>
    </div>

    <!-- Estado -->
    <section class="section">
      <h2 class="section-title">Estado</h2>
      <div class="grid">
        <StatCard :label="'API'" :value="apiOk ? 'OK' : '—'" :subtext="pingSubtext" />
        <StatCard label="Sesión" :value="isAdmin ? 'Admin' : 'Regular'" />
        <StatCard
          label="Usuarios"
          :value="metrics.users"
          :subtext="metrics.updatedAt && new Date(metrics.updatedAt).toLocaleString()"
        />
        <StatCard
          label="Vehículos"
          :value="metrics.vehicles"
          :subtext="metrics.updatedAt && new Date(metrics.updatedAt).toLocaleString()"
        />
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
            <strong>{{ car.marca }}</strong>
            <span class="muted"> · {{ car.modelo || 's/modelo' }}</span>
            <div class="muted">Lugares: {{ car.places }} · Color: {{ car.color || '—' }}</div>
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

/* ---- sesión / estado ---- */
const user = ref(null)
const isAdmin = computed(() => user.value?.role === 'admin')
const apiOk = ref(false)
const err = ref('')

/* ---- métricas ---- */
const metrics = ref({ users: '—', vehicles: '—', updatedAt: '' })

/* ---- últimos vehículos ---- */
const recent = ref([])
const loadingRecent = ref(false)
const recentError = ref('')

/* ---- helpers ---- */
const loadUser = () => {
  try {
    user.value = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    user.value = null
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const pingSubtext = computed(() => (isAdmin.value ? '/api/admin/dashboard' : '/health'))

/* ---- llamadas API ---- */
const ping = async () => {
  try {
    const path = isAdmin.value ? '/admin/dashboard' : '/health'
    const cfg = isAdmin.value ? {} : { baseURL: 'http://localhost:3000' } // /health no pasa por /api
    const { data } = await api.get(path, cfg)
    apiOk.value = isAdmin.value ? !!data?.message : true
    err.value = ''
  } catch (e) {
    apiOk.value = false
    const s = e?.response?.status
    // 401 => token inválido/expirado: cerrar sesión
    if (s === 401) return logout()
    // 403 => no admin: no cerrar sesión; solo mostrar mensaje
    err.value = s === 403 ? 'No autorizado' : (e?.response?.data?.error || 'Error')
  }
}

const fetchMetrics = async () => {
  // solo admin
  if (!isAdmin.value) return
  try {
    const { data } = await api.get('/admin/metrics')
    metrics.value = data
  } catch {
    /* no rompemos el dashboard */
  }
}

const fetchRecentVehicles = async () => {
  loadingRecent.value = true
  recentError.value = ''
  try {
    const { data } = await api.get('/automoviles', { params: { page: 1, limit: 5 } })
    recent.value = data?.data || []
  } catch (e) {
    if (e?.response?.status === 404) {
      recentError.value = 'Aún no hay módulo de vehículos.'
    } else {
      recentError.value = e?.response?.data?.error || 'No se pudieron cargar los vehículos.'
    }
  } finally {
    loadingRecent.value = false
  }
}

/* ---- refresco conjunto ---- */
const refreshAll = async () => {
  err.value = ''
  const tasks = [ping(), fetchRecentVehicles()]
  if (isAdmin.value) tasks.push(fetchMetrics())
  await Promise.allSettled(tasks)
}

/* ---- init ---- */
onMounted(() => {
  loadUser()
  refreshAll()
})
</script>
