<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="max-w-md w-full space-y-4">
      <h2 class="text-2xl font-bold text-center">Recuperar contraseña</h2>
      <p class="text-center text-sm text-gray-500">Ingresa tu correo para enviarte instrucciones</p>

      <form @submit.prevent="handleSubmit" class="grid gap-4">
        <label class="block">
          <span class="block text-sm font-medium text-gray-700">Correo electrónico</span>
          <input
            type="email"
            v-model="email"
            required
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:border-blue-300"
            placeholder="correo@ejemplo.com"
          />
        </label>

        <button type="submit" class="btn btn--primary w-full" :disabled="loading">
          <span v-if="!loading">Enviar instrucciones</span>
          <span v-else>Enviando…</span>
        </button>
      </form>

      <router-link to="/login" class="text-sm text-blue-600 hover:underline text-center block">
        Volver al login
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

const email = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  try {
    await api.post('/auth/forgot-password', { email: email.value.trim() })

    await Swal.fire({
      icon: 'success',
      title: 'Correo enviado',
      text: 'Si el correo está registrado, recibirás instrucciones en breve.',
    })
  } catch (e) {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: e?.response?.data?.error || 'No se pudo enviar el correo'
    })
  } finally {
    loading.value = false
  }
}
</script>
