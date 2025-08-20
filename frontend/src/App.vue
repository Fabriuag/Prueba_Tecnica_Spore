<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
const authStore = useAuthStore()
const isAuthed = computed(() => authStore.isAuthenticated || !!localStorage.getItem('token'))
onMounted(() => authStore.checkAuth())
</script>

<template>
  <router-view/>
</template>