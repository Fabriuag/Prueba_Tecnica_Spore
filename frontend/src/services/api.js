import axios from 'axios'
import router from '@/router'

const api = axios.create({ baseURL: '/api', timeout: 5000 })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  e => {
    const s = e?.response?.status
    if (s === 401 || s === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
    return Promise.reject(e)
  }
)

export default api

