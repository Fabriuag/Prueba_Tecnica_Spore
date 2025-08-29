import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { requiresGuest: true } },
  { path: '/register', component: () => import('@/views/RegisterView.vue'), meta: { requiresGuest: true }},
  { path: '/dashboard', component: () => import('@/views/DashBoardView.vue'), meta: { requiresAuth: true } }, // <- usa exactamente el nombre del archivo
  { path: '/vehicles', component: () => import('@/views/VehiclesView.vue'), meta: { requiresAuth: true } },
  { path: '/mapa', component: () => import('@/views/MapView.vue'), meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (to.meta.requiresAuth && !token) return next('/login')
  if (to.meta.requiresGuest && token) return next('/dashboard')
  if (to.meta.requiresAdmin && user?.role !== 'admin') return next('/dashboard')
  next()
})

export default router
