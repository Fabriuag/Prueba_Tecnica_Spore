<!-- src/views/RegisterView.vue -->
<template>
  <div class="register">
    <h2>Crear cuenta</h2>

    <form @submit.prevent="handleRegister" novalidate>
      <div class="form-grid">
        <!-- Usuario -->
        <label class="field">
          <span>Usuario *</span>
          <input
            v-model.trim="username"
            type="text"
            :maxlength="USERNAME_MAX"
            :minlength="3"
            :class="{ invalid: !!(touch.username && errors.username) }"
            placeholder="Usuario"
            autocomplete="username"
            required
            @blur="touch.username = true; validateUsername()"
          />
          <small class="muted">Máx. {{ USERNAME_MAX }} caracteres.</small>
          <small v-if="touch.username && errors.username" class="field-error">{{ errors.username }}</small>
        </label>

        <!-- Email -->
        <label class="field">
          <span>Email *</span>
          <input
            v-model.trim="email"
            type="email"
            :maxlength="EMAIL_MAX"
            :class="{ invalid: !!(touch.email && errors.email) }"
            placeholder="correo@ejemplo.com"
            autocomplete="email"
            required
            @blur="touch.email = true; validateEmail()"
          />
          <small class="muted">Máx. {{ EMAIL_MAX }} caracteres.</small>
          <small v-if="touch.email && errors.email" class="field-error">{{ errors.email }}</small>
        </label>

        <!-- Nombre -->
        <label class="field">
          <span>Nombre *</span>
          <input
            v-model.trim="firstName"
            type="text"
            :maxlength="NAME_MAX"
            :class="{ invalid: !!(touch.firstName && errors.firstName) }"
            placeholder="Nombre"
            autocomplete="given-name"
            required
            @blur="touch.firstName = true; validateFirstName()"
          />
          <small class="muted">Máx. {{ NAME_MAX }} caracteres.</small>
          <small v-if="touch.firstName && errors.firstName" class="field-error">{{ errors.firstName }}</small>
        </label>

        <!-- Apellido -->
        <label class="field">
          <span>Apellido *</span>
          <input
            v-model.trim="lastName"
            type="text"
            :maxlength="NAME_MAX"
            :class="{ invalid: !!(touch.lastName && errors.lastName) }"
            placeholder="Apellido"
            autocomplete="family-name"
            required
            @blur="touch.lastName = true; validateLastName()"
          />
          <small class="muted">Máx. {{ NAME_MAX }} caracteres.</small>
          <small v-if="touch.lastName && errors.lastName" class="field-error">{{ errors.lastName }}</small>
        </label>

        <!-- Teléfono (opcional) -->
        <label class="field">
          <span>Teléfono</span>
          <input
            v-model.trim="phone"
            type="tel"
            :maxlength="PHONE_MAX"
            :class="{ invalid: !!(touch.phone && errors.phone) }"
            placeholder="+52 55 1234 5678"
            autocomplete="tel"
            @blur="touch.phone = true; validatePhone()"
          />
          <small class="muted">Máx. {{ PHONE_MAX }} caracteres (se permiten +, (), espacios, -, .)</small>
          <small v-if="touch.phone && errors.phone" class="field-error">{{ errors.phone }}</small>
        </label>

        <!-- Password -->
        <label class="field">
          <span>Contraseña (mín. 8) *</span>
          <input
            v-model="password"
            :type="showPass ? 'text' : 'password'"
            :maxlength="PASSWORD_MAX"
            :class="{ invalid: !!(touch.password && errors.password) }"
            placeholder="••••••••"
            autocomplete="new-password"
            required
            @blur="touch.password = true; validatePassword()"
          />
          <small class="muted">
            Debe incluir mayúscula, minúscula y carácter especial. Máx. {{ PASSWORD_MAX }}.
          </small>
          <small v-if="touch.password && errors.password" class="field-error">{{ errors.password }}</small>
        </label>

        <!-- Confirm -->
        <label class="field">
          <span>Confirmar contraseña *</span>
          <input
            v-model="confirm"
            :type="showPass ? 'text' : 'password'"
            :maxlength="PASSWORD_MAX"
            :class="{ invalid: !!(touch.confirm && errors.confirm) }"
            placeholder="••••••••"
            autocomplete="new-password"
            required
            @blur="touch.confirm = true; validateConfirm()"
          />
          <small v-if="touch.confirm && errors.confirm" class="field-error">{{ errors.confirm }}</small>
        </label>
      </div>

      <div class="row">
        <label class="toggle">
          <input type="checkbox" v-model="showPass" />
          <span>Mostrar contraseña</span>
        </label>
      </div>

      <!-- Indicador simple de fuerza -->
      <div class="strength">
        <div class="bar" :style="{ width: strengthPct + '%'}"></div>
      </div>
      <p class="muted">{{ strengthLabel }}</p>

      <!-- Rol fijo en regular (no visible) -->
      <input type="hidden" v-model="role" />

      <button type="submit" :disabled="loading || !canSubmit">
        {{ loading ? 'Creando...' : 'Registrarme' }}
      </button>

      <p v-if="formError" class="error">{{ formError }}</p>
      <p v-if="success" class="ok">¡Cuenta creada! Redirigiendo…</p>
    </form>

    <p class="muted" style="margin-top: 12px;">
      ¿Ya tienes cuenta?
      <router-link to="/login">Inicia sesión</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import api from '@/services/api'
import router from '@/router'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()

/* ===== Límites de caracteres ===== */
const USERNAME_MAX = 32
const EMAIL_MAX    = 254
const NAME_MAX     = 50
const PHONE_MAX    = 24
const PASSWORD_MAX = 72  

// Form
const username  = ref('')
const email     = ref('')
const firstName = ref('')
const lastName  = ref('')
const phone     = ref('')
const password  = ref('')
const confirm   = ref('')
const role      = ref('regular')

const showPass  = ref(false)
const loading   = ref(false)
const success   = ref(false)
const formError = ref('')

// Errores por campo y "tocado"
const errors = ref({
  username: '', email: '', firstName: '', lastName: '',
  phone: '', password: '', confirm: ''
})
const touch = ref({
  username: false, email: false, firstName: false, lastName: false,
  phone: false, password: false, confirm: false
})

/* ---------- Validaciones básicas ---------- */
const hasUpper = computed(() => /[A-Z]/.test(password.value))
const hasLower = computed(() => /[a-z]/.test(password.value))
const hasSpec  = computed(() => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password.value))
const longEnough = computed(() => password.value.length >= 8)

/* Username: requerido, 3-32 chars, letras/números/._- */
function validateUsername () {
  const v = username.value
  if (!v) return (errors.value.username = 'El usuario es requerido')
  if (v.length < 3) return (errors.value.username = 'Mínimo 3 caracteres')
  if (v.length > USERNAME_MAX) return (errors.value.username = `Máximo ${USERNAME_MAX} caracteres`)
  if (!/^[a-zA-Z0-9._-]+$/.test(v)) {
    return (errors.value.username = 'Solo letras, números, ".", "_" o "-"')
  }
  return (errors.value.username = '')
}

/* Email con chequeo de dominio y longitud */
function validateEmail () {
  const v = email.value
  if (!v) return (errors.value.email = 'El email es requerido')
  if (v.length > EMAIL_MAX) return (errors.value.email = `El email es demasiado largo (máx. ${EMAIL_MAX})`)

  const parts = v.split('@')
  if (parts.length !== 2 || !parts[0]) {
    return (errors.value.email = 'Falta la parte antes del @')
  }
  const domain = parts[1]
  if (!domain) return (errors.value.email = 'Falta el dominio (p.ej. ejemplo.com)')

  const domainRegex = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/
  if (!domainRegex.test(domain)) {
    return (errors.value.email = 'Dominio inválido (usa algo como "ejemplo.com")')
  }

  const generalEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!generalEmail.test(v)) {
    return (errors.value.email = 'Email inválido')
  }
  return (errors.value.email = '')
}

/* Nombres: letras, espacios, acentos, mínimo 2, máximo NAME_MAX */
function validateFirstName () {
  const v = firstName.value
  if (!v) return (errors.value.firstName = 'El nombre es requerido')
  if (v.length > NAME_MAX) return (errors.value.firstName = `Máximo ${NAME_MAX} caracteres`)
  if (!/^[A-Za-zÀ-ÿ\u00f1\u00d1' -]{2,}$/.test(v)) {
    return (errors.value.firstName = 'El nombre contiene caracteres no válidos')
  }
  return (errors.value.firstName = '')
}
function validateLastName () {
  const v = lastName.value
  if (!v) return (errors.value.lastName = 'El apellido es requerido')
  if (v.length > NAME_MAX) return (errors.value.lastName = `Máximo ${NAME_MAX} caracteres`)
  if (!/^[A-Za-zÀ-ÿ\u00f1\u00d1' -]{2,}$/.test(v)) {
    return (errors.value.lastName = 'El apellido contiene caracteres no válidos')
  }
  return (errors.value.lastName = '')
}

/* Tel opcional: longitud máxima y caracteres permitidos */
function validatePhone () {
  const v = phone.value
  if (!v) return (errors.value.phone = '')
  if (v.length > PHONE_MAX) return (errors.value.phone = `Máximo ${PHONE_MAX} caracteres`)
  if (!/^[\d\s()+\-\.]+$/.test(v)) {
    return (errors.value.phone = 'Teléfono inválido')
  }
  return (errors.value.phone = '')
}

/* Password y confirmación: longitud y composición */
function validatePassword () {
  const v = password.value
  if (!v) return (errors.value.password = 'La contraseña es requerida')
  if (v.length > PASSWORD_MAX) return (errors.value.password = `Máximo ${PASSWORD_MAX} caracteres`)
  if (!longEnough.value) return (errors.value.password = 'Mínimo 8 caracteres')
  if (!hasUpper.value)  return (errors.value.password = 'Debe incluir al menos una mayúscula')
  if (!hasLower.value)  return (errors.value.password = 'Debe incluir al menos una minúscula')
  if (!hasSpec.value)   return (errors.value.password = 'Debe incluir al menos un carácter especial')
  return (errors.value.password = '')
}
function validateConfirm () {
  if (confirm.value !== password.value) {
    return (errors.value.confirm = 'Las contraseñas no coinciden')
  }
  if (confirm.value.length > PASSWORD_MAX) {
    return (errors.value.confirm = `Máximo ${PASSWORD_MAX} caracteres`)
  }
  return (errors.value.confirm = '')
}

/* Validación reactiva */
watch(username, () => { if (touch.value.username) validateUsername() })
watch(email,    () => { if (touch.value.email)    validateEmail() })
watch(firstName,() => { if (touch.value.firstName) validateFirstName() })
watch(lastName, () => { if (touch.value.lastName)  validateLastName() })
watch(phone,    () => { if (touch.value.phone)    validatePhone() })
watch(password, () => {
  if (touch.value.password) validatePassword()
  if (touch.value.confirm)  validateConfirm()
})
watch(confirm,  () => { if (touch.value.confirm)  validateConfirm() })

/* Fuerza básica */
const strengthScore = computed(() => {
  let s = 0
  if (longEnough.value) s++
  if (hasUpper.value)   s++
  if (hasLower.value)   s++
  if (hasSpec.value)    s++
  if (password.value.length >= 12) s++ // bonus
  return s // 0..5
})
const strengthPct = computed(() => (strengthScore.value / 5) * 100)
const strengthLabel = computed(() => {
  const s = strengthScore.value
  if (s <= 1) return 'Contraseña débil'
  if (s === 2) return 'Contraseña regular'
  if (s === 3) return 'Contraseña buena'
  return 'Contraseña fuerte'
})

/* Submit habilitado si no hay errores y los requeridos están OK */
const canSubmit = computed(() => {
  return !errors.value.username && !errors.value.email && !errors.value.firstName && !errors.value.lastName &&
         !errors.value.phone && !errors.value.password && !errors.value.confirm &&
         username.value && email.value && firstName.value && lastName.value &&
         password.value && confirm.value
})

function validateAll () {
  touch.value = {
    username: true, email: true, firstName: true, lastName: true,
    phone: true, password: true, confirm: true
  }
  validateUsername()
  validateEmail()
  validateFirstName()
  validateLastName()
  validatePhone()
  validatePassword()
  validateConfirm()
}


const handleRegister = async () => {
  formError.value = ''
  success.value = false

  validateAll()
  if (!canSubmit.value) {
    formError.value = 'Corrige los campos marcados en rojo'
    return
  }

  loading.value = true
  try {
    const payload = {
      username:  username.value.trim(),
      password:  password.value,
      role:      role.value,
      email:     email.value.trim(),
      firstName: firstName.value.trim(),
      lastName:  lastName.value.trim(),
      phone:     phone.value.trim() || null
    }

    const { data } = await api.post('/auth/register', payload)

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    authStore.user = data.user
    authStore.isAuthenticated = true

    success.value = true
    router.push('/dashboard')
  } catch (e) {
    const code = e?.response?.status
    const msg  = e?.response?.data?.error
    if (code === 409 || (msg && /existe|exists/i.test(msg))) {
      formError.value = 'El usuario ya existe'
    } else if (code === 400) {
      formError.value = msg || 'Datos inválidos'
    } else {
      formError.value = 'No se pudo crear la cuenta'
    }
  } finally {
    loading.value = false
  }
}
</script>

