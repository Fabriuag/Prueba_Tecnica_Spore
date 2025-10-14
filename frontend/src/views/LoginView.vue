<template>
  <!-- CTA Registrarse (esquina) -->
  <router-link
    to="/register"
    class="btn btn--ghost"
    style="position:fixed; top:16px; left:16px;"
  >
    Registrarse
  </router-link>

  <!-- Centro de la pantalla -->
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="login w-full max-w-xl">
      <!-- Encabezado -->
      <div class="mb-4">
        <h2 class="title brand-gradient-text">Iniciar sesión</h2>
        <p class="subtitle">Accede con tu usuario y contraseña.</p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="onSubmit" novalidate>
        <div class="grid gap-3">
          <!-- Usuario -->
          <label class="field">
            <span>Usuario *</span>
            <div class="relative">
              <input
                v-model.trim="username"
                type="text"
                placeholder="Tu usuario"
                autocomplete="username"
                :class="{ invalid: touched.user && !validUser }"
                @blur="touched.user = true"
                required
              />
              <button
                type="button"
                class="btn btn--ghost"
                style="position:absolute; right:6px; top:6px; padding:6px 10px; opacity:0; pointer-events:none;"
                aria-hidden="true"
                tabindex="-1"
              >
                Mostrar
              </button>
            </div>
            <small v-if="touched.user && !validUser" class="error">
              Ingresa un usuario válido 
            </small>
          </label>

          <!-- Contraseña -->
          <label class="field">
            <span>Contraseña *</span>
            <div class="relative">
              <input
                v-model="password"
                :type="showPass ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                :class="{ invalid: touched.pass && !validPass }"
                @blur="touched.pass = true"
                required
              />
              <button
                type="button"
                class="btn btn--ghost"
                style="position:absolute; right:6px; top:6px; padding:6px 10px;"
                @click="showPass = !showPass"
                aria-label="Mostrar/ocultar contraseña"
              >
                {{ showPass ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
            <small v-if="touched.pass && !validPass" class="error">
              La contraseña es requerida.
            </small>
          </label>

          <!-- Botón -->
          <button
            type="submit"
            class="btn btn--primary mt-2"
            :disabled="loading || !canSubmit"
          >
            <span v-if="!loading">Ingresar</span>
            <span v-else>Ingresando…</span>
          </button>

          <!-- Enlace para recuperar contraseña -->
          <router-link to="/forgot-password" class="text-sm text-blue-600 hover:underline text-center block mt-2">
            ¿Olvidaste tu contraseña?
          </router-link>


          <!-- Mensaje de error general -->
          <p v-if="error" class="error mt-1">{{ error }}</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import router from '@/router'
import Swal from 'sweetalert2'

const auth = useAuthStore()

const username = ref('')
const password = ref('')
const showPass = ref(false)
const remember = ref(false)
const loading = ref(false)
const error = ref('')
const touched = ref({ user: false, pass: false })

const validUser = computed(() => /^[\w.\-]{3,32}$/.test(username.value || ''))
const validPass = computed(() => (password.value || '').length > 0)
const canSubmit = computed(() => validUser.value && validPass.value)

onMounted(() => {
  const saved = localStorage.getItem('rememberUser')
  if (saved) {
    remember.value = true
    username.value = saved
  }
})

const onSubmit = async () => {
  touched.value.user = true
  touched.value.pass = true
  error.value = ''

  if (!canSubmit.value) return

  try {
    loading.value = true
    await auth.login({ username: username.value, password: password.value })
    if (remember.value) {
      localStorage.setItem('rememberUser', username.value)
    } else {
      localStorage.removeItem('rememberUser')
    }

    await Swal.fire({
      icon: 'success',
      title: '¡Bienvenido!',
      text: 'Inicio de sesión exitoso',
      timer: 1500,
      showConfirmButton: false
    })

    router.push('/dashboard')
  } catch (e) {
    const msg =
      e?.response?.data?.error ||
      (e?.response?.status === 401 ? 'Credenciales incorrectas' : null)
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: msg || 'No se pudo iniciar sesión'
    })
  } finally {
    loading.value = false
  }
}
</script>
