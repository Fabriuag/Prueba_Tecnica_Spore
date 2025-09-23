<template>
  <div class="container">
    <!-- Encabezado -->
    <div class="header">
      <div>
        <h1 class="title">Usuarios</h1>
        <p class="subtitle">Administra cuentas, roles y estado.</p>
      </div>
      <div class="actions space-x-2">
        <router-link class="btn" to="/dashboard">Volver</router-link>
        <button class="btn" @click="fetchUsers">Refrescar</button>
        <button class="btn btn--primary" @click="showForm = !showForm">
          {{ showForm ? 'Cancelar' : '+ Registrar usuario' }}
        </button>
      </div>
    </div>

    <!-- Formulario de registro de usuario -->
<!-- Bloque de formulario de registro con estilos Tailwind personalizados -->
<section v-if="showForm" class="card-ultra section animate-slide-up">
  <h2 class="section-title">Registrar nuevo usuario</h2>
  <div class="form-grid-2">
    <!-- Usuario y contraseña -->
    <label class="field">
      <span>Usuario *</span>
      <input v-model="form.username" type="text" placeholder="Usuario" required />
    </label>
    <label class="field">
      <span>Contraseña *</span>
      <input v-model="form.password" type="password" placeholder="Contraseña" required />
    </label>

    <!-- Nombre y apellido -->
    <label class="field">
      <span>Nombre</span>
      <input v-model="form.firstName" type="text" placeholder="Nombre" />
    </label>
    <label class="field">
      <span>Apellido</span>
      <input v-model="form.lastName" type="text" placeholder="Apellido" />
    </label>

    <!-- Email y teléfono -->
    <label class="field">
      <span>Email</span>
      <input v-model="form.email" type="email" placeholder="correo@ejemplo.com" />
    </label>
    <label class="field">
      <span>Teléfono</span>
      <input v-model="form.phone" type="tel" placeholder="Teléfono" />
    </label>

    <!-- Rol -->
    <label class="field md:col-span-2">
      <span>Rol</span>
      <select v-model="form.role">
        <option value="regular">Usuario regular</option>
        <option value="admin">Administrador</option>
      </select>
    </label>
  </div>

  <div class="mt-6 flex justify-end gap-2">
    <button class="btn btn--ghost" @click="showForm = false">Cancelar</button>
    <button class="btn btn--primary" @click="registerUser">Guardar</button>
  </div>
</section>

    <!-- Filtros -->
    <UsersFilter v-model="filters" @change="applyFilters" />

    <!-- Lista de usuarios -->
    <section class="section">
      <div v-if="loading" class="muted">Cargando…</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else class="list">
        <div v-for="u in users" :key="u.id" class="list-item">
          <div class="flex items-center gap-3">
            <div class="badge">{{ u.role }}</div>
            <div>
              <strong>{{ u.username }}</strong>
              <div class="muted">
                {{ u.firstName }} {{ u.lastName }}
                <span v-if="u.email"> · {{ u.email }}</span>
              </div>
              <div class="muted text-xs">
                Creado: {{ ts(u.createdAt) }}
                <template v-if="u.deletedAt"> · Eliminado: {{ ts(u.deletedAt) }}</template>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              v-if="u.role === 'regular'"
              class="btn"
              @click="setRole(u.id, 'admin')"
            >Hacer admin</button>
            <button
              v-else
              class="btn"
              @click="setRole(u.id, 'regular')"
            >Hacer regular</button>

            <button
              v-if="!u.deletedAt"
              class="btn btn--danger"
              @click="softDelete(u)"
            >Eliminar</button>
            <button
              v-else
              class="btn btn--primary"
              @click="restore(u)"
            >Restaurar</button>
          </div>
        </div>

        <div v-if="users.length === 0" class="list-item muted">Sin resultados.</div>
      </div>

      <!-- Paginación -->
      <div class="section flex items-center gap-3">
        <button class="btn" :disabled="page <= 1" @click="goto(page - 1)">«</button>
        <span>Página {{ page }} de {{ pages }}</span>
        <button class="btn" :disabled="page >= pages" @click="goto(page + 1)">»</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UsersFilter from '@/components/UsersFilter.vue'
import api from '@/services/api'
import Swal from 'sweetalert2' // ✅ ya no usamos useToast

const route = useRoute()
const router = useRouter()

const users = ref([])
const loading = ref(false)
const error = ref('')
const showForm = ref(false)

const page = ref(1)
const pages = ref(1)
const total = ref(0)

const ts = (x) => (x ? new Date(x).toLocaleString() : '')

const filters = ref({
  q: route.query.q || '',
  role: route.query.role || '',
  status: route.query.status || 'active',
  from: route.query.from || '',
  to: route.query.to || '',
  sortBy: route.query.sortBy || 'createdAt',
  sortDir: route.query.sortDir || 'desc',
  limit: Number(route.query.limit || 10),
})

const form = ref({
  username: '',
  password: '',
  role: 'regular',
  firstName: '',
  lastName: '',
  phone: '',
  email: ''
})

const registerUser = async () => {
  try {
    await api.post('/auth/register', form.value)

    // ✅ Mensaje de éxito
    await Swal.fire({
      icon: 'success',
      title: 'Usuario registrado correctamente',
      showConfirmButton: false,
      timer: 2000
    })

    showForm.value = false
    Object.keys(form.value).forEach(k => form.value[k] = '')
    fetchUsers()
  } catch (err) {
    // ✅ Mensaje de error
    Swal.fire({
      icon: 'error',
      title: 'Error al registrar usuario',
      text: err?.response?.data?.error || 'Inténtalo de nuevo'
    })
  }
}

const buildQuery = () => {
  const f = filters.value
  return {
    page: page.value,
    limit: f.limit,
    q: f.q || undefined,
    role: f.role || undefined,
    status: f.status || 'active',
    from: f.from || undefined,
    to: f.to || undefined,
    sortBy: f.sortBy,
    sortDir: f.sortDir,
  }
}

const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/users', { params: buildQuery() })
    users.value = data?.data || []
    total.value = data?.pagination?.total || 0
    pages.value = data?.pagination?.pages || 1
    page.value = data?.pagination?.page || page.value
  } catch (e) {
    error.value = e?.response?.data?.error || 'Error al listar usuarios'
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  page.value = 1
  router.replace({ query: { ...buildQuery(), page: 1 } })
  fetchUsers()
}

const goto = (p) => {
  page.value = p
  router.replace({ query: { ...buildQuery(), page: p } })
  fetchUsers()
}

const setRole = async (id, role) => {
  try {
    await api.put(`/users/${id}/role`, { role })
    fetchUsers()
  } catch (e) {
    error.value = e?.response?.data?.error || 'No se pudo cambiar el rol'
  }
}

const softDelete = async (u) => {
  const result = await Swal.fire({
    title: `¿Eliminar a "${u.username}"?`,
    text: 'Esta acción puede revertirse después.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    try {
      await api.delete(`/users/${u.id}`)
      fetchUsers()
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e?.response?.data?.error || 'No se pudo eliminar'
      })
    }
  }
}

const restore = async (u) => {
  try {
    await api.post(`/users/${u.id}/restore`)
    fetchUsers()
  } catch (e) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: e?.response?.data?.error || 'No se pudo restaurar'
    })
  }
}

watch(() => route.query, () => {
  filters.value = {
    q: route.query.q || '',
    role: route.query.role || '',
    status: route.query.status || 'active',
    from: route.query.from || '',
    to: route.query.to || '',
    sortBy: route.query.sortBy || 'createdAt',
    sortDir: route.query.sortDir || 'desc',
    limit: Number(route.query.limit || 10),
  }
  page.value = Number(route.query.page || 1)
}, { immediate: true })

onMounted(fetchUsers)
</script>


<style scoped>
.input {
  @apply px-3 py-2 border rounded w-full;
}
</style>
