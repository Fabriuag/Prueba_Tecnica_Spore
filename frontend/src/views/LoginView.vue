<template>
  <div class="actions">
    <router-link class="btn" to="/register">Registrarse</router-link>
  </div>
  <div class="login">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="username" placeholder="Usuario" required>
      <input v-model="password" type="password" placeholder="Contraseña" required>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Cargando...' : 'Ingresar' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    await authStore.login({
      username: username.value,
      password: password.value
    })
  } catch (err) {
    error.value = 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.error {
  color: red;
  margin-top: 10px;
}
</style>