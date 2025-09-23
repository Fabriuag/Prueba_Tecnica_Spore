import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import '@/assets/main.css'   // ← importa estilos globales

const app = createApp(App)
app.use(createPinia())
app.use(router)          // 👈 Router antes de montar
app.mount('#app')
