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
        <router-link to="/forgot-password" class="btn">
            Restablecer Contraseña
          </router-link>
        <button class="btn" @click="fetchUsers">Refrescar</button>
        <button class="btn btn--primary" @click="toggleForm">
          + Registrar Usuario
        </button>
      </div>
    </div>

    <!-- Formulario de registro/edición -->
    <section v-if="showForm" class="card-ultra section animate-slide-up">
      <h2 class="section-title">
        {{ editMode ? 'Editar usuario' : 'Registrar nuevo usuario' }}
      </h2>
      <div class="form-grid-2">
        <!-- Usuario -->
        <label class="field">
          <span>Usuario *</span>
          <input
            v-model="form.username"
            type="text"
            placeholder="Usuario"
            :maxlength="USERNAME_MAX"
            :class="{ invalid: touch.username && errors.username }"
            @blur="touch.username = true; validateUsername()"
            required
          />
          <small class="muted">Máx. {{ USERNAME_MAX }} caracteres.</small>
          <small v-if="touch.username && errors.username" class="field-error">{{ errors.username }}</small>
        </label>

        <!-- Contraseña -->
        <label class="field" v-if="!editMode">
          <span>Contraseña *</span>
          <input
            v-model="form.password"
            type="password"
            placeholder="Contraseña"
            :maxlength="PASSWORD_MAX"
            :class="{ invalid: touch.password && errors.password }"
            @blur="touch.password = true; validatePassword()"
            required
          />
          <small class="muted">Debe incluir mayúscula, minúscula y carácter especial. Máx. {{ PASSWORD_MAX }}.</small>
          <small v-if="touch.password && errors.password" class="field-error">{{ errors.password }}</small>
        </label>

        <!-- Nombre -->
        <label class="field">
          <span>Nombre *</span>
          <input
            v-model="form.firstName"
            type="text"
            placeholder="Nombre"
            :maxlength="NAME_MAX"
            :class="{ invalid: touch.firstName && errors.firstName }"
            @blur="touch.firstName = true; validateFirstName()"
            required
          />
          <small class="muted">Máx. {{ NAME_MAX }} caracteres.</small>
          <small v-if="touch.firstName && errors.firstName" class="field-error">{{ errors.firstName }}</small>
        </label>

        <!-- Apellido -->
        <label class="field">
          <span>Apellido *</span>
          <input
            v-model="form.lastName"
            type="text"
            placeholder="Apellido"
            :maxlength="NAME_MAX"
            :class="{ invalid: touch.lastName && errors.lastName }"
            @blur="touch.lastName = true; validateLastName()"
            required
          />
          <small class="muted">Máx. {{ NAME_MAX }} caracteres.</small>
          <small v-if="touch.lastName && errors.lastName" class="field-error">{{ errors.lastName }}</small>
        </label>

        <!-- Email -->
        <label class="field">
          <span>Email *</span>
          <input
            v-model="form.email"
            type="email"
            placeholder="correo@ejemplo.com"
            :maxlength="EMAIL_MAX"
            :class="{ invalid: touch.email && errors.email }"
            @blur="touch.email = true; validateEmail()"
            required
          />
          <small class="muted">Máx. {{ EMAIL_MAX }} caracteres.</small>
          <small v-if="touch.email && errors.email" class="field-error">{{ errors.email }}</small>
        </label>

        <!-- Teléfono -->
        <label class="field">
          <span>Teléfono</span>
          <input
            v-model="form.phone"
            type="tel"
            placeholder="Teléfono"
            :maxlength="PHONE_MAX"
            :class="{ invalid: touch.phone && errors.phone }"
            @blur="touch.phone = true; validatePhone()"
          />
          <small class="muted">Máx. {{ PHONE_MAX }} caracteres (se permiten +, (), espacios, -, .)</small>
          <small v-if="touch.phone && errors.phone" class="field-error">{{ errors.phone }}</small>
        </label>

        <!-- Rol -->
        <label class="field md:col-span-2">
          <span>Rol</span>
          <select v-model="form.role">
            <option value="regular" class="text-black">Usuario regular</option>
            <option value="admin" class="text-black">Administrador</option>
          </select>
        </label>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button class="btn btn--ghost" @click="cancelEdit">Cancelar</button>
        <button class="btn btn--primary" @click="submitUser">
          {{ editMode ? 'Guardar cambios' : 'Registrar' }}
        </button>
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
                Creado: {{ ts(u.createdAt) }} Telefono: {{ u.phone }}
                <template v-if="u.deletedAt"> · Eliminado: {{ ts(u.deletedAt) }}</template>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <button class="btn" @click="editUser(u)">Editar</button>
            <button v-if="u.role === 'regular'" class="btn" @click="setRole(u.id, 'admin')">Hacer admin</button>
            <button v-else class="btn" @click="setRole(u.id, 'regular')">Hacer regular</button>
            <button v-if="!u.deletedAt" class="btn btn--danger" @click="softDelete(u)">Eliminar</button>
            <button v-else class="btn btn--primary" @click="restore(u)">Restaurar</button>
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
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()

/* ===== Límites ===== */
const USERNAME_MAX = 32
const EMAIL_MAX = 254
const NAME_MAX = 50
const PHONE_MAX = 24
const PASSWORD_MAX = 72

/* ===== Estados ===== */
const users = ref([])
const loading = ref(false)
const error = ref('')
const showForm = ref(false)
const editMode = ref(false)
const editingId = ref(null)

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

/* ===== Validación ===== */
const touch = ref({
  username: false, email: false, password: false,
  firstName: false, lastName: false, phone: false
})

const errors = ref({
  username: '', email: '', password: '',
  firstName: '', lastName: '', phone: ''
})

function validateUsername() {
  const v = form.value.username
  if (!v) return errors.value.username = 'El usuario es requerido'
  if (v.length < 3) return errors.value.username = 'Mínimo 3 caracteres'
  if (v.length > USERNAME_MAX) return errors.value.username = `Máximo ${USERNAME_MAX} caracteres`
  if (!/^[a-zA-Z0-9._-]+$/.test(v)) return errors.value.username = 'Solo letras, números, ".", "_" o "-"'
  errors.value.username = ''
}

function validateEmail() {
  const v = form.value.email
  if (!v) return errors.value.email = 'El email es requerido'
  if (v.length > EMAIL_MAX) return errors.value.email = `Máx. ${EMAIL_MAX} caracteres`
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(v)) return errors.value.email = 'Correo inválido'
  errors.value.email = ''
}

function validateFirstName() {
  const v = form.value.firstName
  if (!v) return errors.value.firstName = 'El nombre es requerido'
  if (v.length > NAME_MAX) return errors.value.firstName = `Máx. ${NAME_MAX} caracteres`
  if (!/^[A-Za-zÀ-ÿ\u00f1\u00d1' -]{2,}$/.test(v)) return errors.value.firstName = 'Nombre inválido'
  errors.value.firstName = ''
}

function validateLastName() {
  const v = form.value.lastName
  if (!v) return errors.value.lastName = 'El apellido es requerido'
  if (v.length > NAME_MAX) return errors.value.lastName = `Máx. ${NAME_MAX} caracteres`
  if (!/^[A-Za-zÀ-ÿ\u00f1\u00d1' -]{2,}$/.test(v)) return errors.value.lastName = 'Apellido inválido'
  errors.value.lastName = ''
}

function validatePhone() {
  const v = form.value.phone
  if (!v) return errors.value.phone = ''
  if (v.length > PHONE_MAX) return errors.value.phone = `Máx. ${PHONE_MAX} caracteres`
  if (!/^[\d\s()+\-\.]+$/.test(v)) return errors.value.phone = 'Teléfono inválido'
  errors.value.phone = ''
}

function validatePassword() {
  const v = form.value.password
  if (!v) return errors.value.password = 'La contraseña es requerida'
  if (v.length > PASSWORD_MAX) return errors.value.password = `Máx. ${PASSWORD_MAX} caracteres`
  if (v.length < 8) return errors.value.password = 'Mínimo 8 caracteres'
  if (!/[A-Z]/.test(v)) return errors.value.password = 'Debe incluir al menos una mayúscula'
  if (!/[a-z]/.test(v)) return errors.value.password = 'Debe incluir al menos una minúscula'
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v)) return errors.value.password = 'Debe incluir al menos un carácter especial'
  errors.value.password = ''
}

/* ===== CRUD ===== */
const submitUser = async () => {
  validateUsername()
  validateEmail()
  validateFirstName()
  validateLastName()
  validatePhone()
  if (!editMode.value) validatePassword()

  if (
    errors.value.username || errors.value.email || errors.value.password ||
    errors.value.firstName || errors.value.lastName || errors.value.phone
  ) {
    Swal.fire({ icon: 'error', title: 'Corrige los errores del formulario' })
    return
  }

  try {
    if (editMode.value && editingId.value) {
      await api.put(`/users/${editingId.value}`, form.value)
      await Swal.fire({ icon: 'success', title: 'Usuario actualizado', timer: 2000, showConfirmButton: false })
    } else {
      await api.post('/auth/register', form.value)
      await Swal.fire({ icon: 'success', title: 'Usuario registrado', timer: 2000, showConfirmButton: false })
    }
    cancelEdit()
    fetchUsers()
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.error || 'Inténtalo de nuevo' })
  }
}

const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) cancelEdit()
}

const cancelEdit = () => {
  showForm.value = false
  editMode.value = false
  editingId.value = null
  form.value = { username: '', password: '', role: 'regular', firstName: '', lastName: '', phone: '', email: '' }
  Object.keys(errors.value).forEach(k => errors.value[k] = '')
  Object.keys(touch.value).forEach(k => touch.value[k] = false)
}

const editUser = (user) => {
  form.value = {
    username: user.username,
    password: '', // no editable desde aquí
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    email: user.email
  }
  editingId.value = user.id
  editMode.value = true
  showForm.value = true
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

const page = ref(1)
const pages = ref(1)
const total = ref(0)

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
      Swal.fire({ icon: 'error', title: 'Error', text: e?.response?.data?.error || 'No se pudo eliminar' })
    }
  }
}

const restore = async (u) => {
  try {
    await api.post(`/users/${u.id}/restore`)
    fetchUsers()
  } catch (e) {
    Swal.fire({ icon: 'error', title: 'Error', text: e?.response?.data?.error || 'No se pudo restaurar' })
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
