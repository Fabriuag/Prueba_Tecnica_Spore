import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import router from '@/router'   // 👈 en vez de useRouter()

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    user.value = data.user
    isAuthenticated.value = true
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    router.push('/dashboard')   // 👈 ya funciona
  }

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    isAuthenticated.value = !!token
    try { user.value = JSON.parse(localStorage.getItem('user') || 'null') } catch {}
  }

  return { user, isAuthenticated, login, logout, checkAuth }
})
