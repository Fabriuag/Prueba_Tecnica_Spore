<template>
  <!-- Botón para volver al login -->
  <router-link
    to="/login"
    class="btn btn--ghost"
    style="position:fixed; top:16px; left:16px;"
  >
    Iniciar sesión
  </router-link>

  <!-- Centro de la pantalla -->
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="login w-full max-w-xl">
      <!-- Encabezado -->
      <div class="mb-4">
        <h2 class="title brand-gradient-text">Restablecer contraseña</h2>
        <p class="subtitle">Ingresa tu usuario y una nueva contraseña.</p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="onSubmit" novalidate>
        <div class="grid gap-3">
          <!-- Usuario -->
          <label class="field">
            <span>Usuario *</span>
            <input
              v-model.trim="username"
              type="text"
              placeholder="Tu usuario"
              autocomplete="username"
              :class="{ invalid: touched.user && !validUser }"
              @blur="touched.user = true"
              required
            />
            <small v-if="touched.user && !validUser" class="error">
              Ingresa un usuario válido.
            </small>
          </label>

          <!-- Nueva contraseña -->
          <label class="field">
            <span>Nueva contraseña *</span>
            <div class="relative">
              <input
                v-model="password"
                :type="showPass ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="new-password"
                :class="{ invalid: touched.pass && !validPass }"
                @blur="touched.pass = true"
                required
              />
              <button
                type="button"
                class="btn btn--ghost"
                style="position:absolute; right:6px; top:6px; padding:6px 10px;"
                @click="showPass = !showPass"
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
            <span v-if="!loading">Restablecer</span>
            <span v-else>Procesando…</span>
          </button>

          <!-- Mensajes -->
          <p v-if="error" class="error mt-1">{{ error }}</p>
          <p v-if="success" class="text-green-600 text-sm mt-1">{{ success }}</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Swal from 'sweetalert2'
import router from '@/router'

const username = ref('')
const password = ref('')
const showPass = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')
const touched = ref({ user: false, pass: false })

const validUser = computed(() => /^[\w.\-]{3,32}$/.test(username.value || ''))
const validPass = computed(() => (password.value || '').length >= 6)
const canSubmit = computed(() => validUser.value && validPass.value)

const onSubmit = async () => {
  touched.value.user = true
  touched.value.pass = true
  error.value = ''
  success.value = ''

  if (!canSubmit.value) return

  loading.value = true
  try {
    const res = await fetch('/api/auth/simple-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    const data = await res.json()

    if (!res.ok) {
      error.value = data?.error || 'Error al restablecer la contraseña'
    } else {
      success.value = 'Contraseña actualizada correctamente'
      await Swal.fire({
        icon: 'success',
        title: 'Contraseña actualizada',
        text: 'Ya puedes iniciar sesión con tu nueva contraseña',
        timer: 2000,
        showConfirmButton: false
      })
      router.push('/login')
    }
  } catch (err) {
    console.error(err)
    error.value = 'Error de conexión con el servidor'
  } finally {
    loading.value = false
  }
}
</script>
