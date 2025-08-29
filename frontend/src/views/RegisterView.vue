<!-- src/views/RegisterView.vue -->
<template>
  <div class="register">
    <h2>Crear cuenta</h2>

    <form @submit.prevent="handleRegister">
      <input
        v-model.trim="username"
        placeholder="Usuario"
        autocomplete="username"
        required
      />

      <input
        v-model="password"
        type="password"
        placeholder="Contraseña (mín. 8)"
        autocomplete="new-password"
        required
      />

      <input
        v-model="confirm"
        type="password"
        placeholder="Confirmar contraseña"
        autocomplete="new-password"
        required
      />

      <!-- Rol: por seguridad, fijo en 'regular' -->
      <input type="hidden" v-model="role" />

      <button type="submit" :disabled="loading">
        {{ loading ? 'Creando...' : 'Registrarme' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="ok">¡Cuenta creada! Redirigiendo…</p>
    </form>

    <p class="muted">
      ¿Ya tienes cuenta?
      <router-link to="/login">Inicia sesión</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'
import router from '@/router'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const confirm  = ref('')
const role = ref('regular') // por defecto regular, no exponemos en UI

const loading = ref(false)
const error   = ref('')
const success = ref(false)

const handleRegister = async () => {
  error.value = ''
  success.value = false

  // Validaciones básicas en cliente
  if (!username.value || !password.value) {
    error.value = 'Usuario y contraseña son requeridos'
    return
  }
  if (password.value.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  if (!/[A-Z]/.test(password.value)) {
    error.value = 'La contraseña debe contener al menos una letra mayúscula';
                    return;
}
                
if (!/[a-z]/.test(password.value)) {
    erorr.value = 'La contraseña debe contener al menos una letra minúscula';
    return;
                }
                
if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password.value)) {
    error.value = 'La contraseña debe contener al menos un carácter especial';
    return;
}

  loading.value = true
  try {
    const payload = {
      username: username.value.trim(),
      password: password.value,
      role: role.value, // el backend la ignora si no quieres permitir roles, pero aquí va 'regular'
    }

    const { data } = await api.post('/auth/register', payload)
    // Guarda sesión como hace el login
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    // Opcional: actualizar estado del store para reflejar inmediatamente la sesión
    authStore.user = data.user
    authStore.isAuthenticated = true

    success.value = true
    // Navega al dashboard
    router.push('/dashboard')
  } catch (e) {
    const code = e?.response?.status
    if (code === 409 || e?.response?.data?.error?.includes('existe')) {
      error.value = 'El usuario ya existe'
    } else if (code === 400) {
      error.value = e?.response?.data?.error || 'Datos inválidos'
    } else {
      error.value = 'No se pudo crear la cuenta'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register { max-width: 380px; margin: 40px auto; display: grid; gap: 12px; }
input { padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
button { padding: 10px 12px; border: 0; border-radius: 8px; cursor: pointer; }
.error { color: #c0392b; }
.ok { color: #2ecc71; }
.muted { color: #666; font-size: 0.9rem; }
</style>