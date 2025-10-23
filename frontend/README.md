# 🌐 Frontend - Sistema de Gestión de Usuarios y Vehículos

Este es el **frontend** del sistema, desarrollado con **Vue 3** y **Vite**, diseñado como una **SPA** (Single Page Application).  
Consume los endpoints REST del backend y permite a los usuarios:

- Iniciar sesión
- Registrarse
- Recuperar su contraseña
- Visualizar vistas según su rol (`admin` o `regular`)

---

## ⚙️ Tecnologías Utilizadas

- **Vue 3** + Composition API
- **Node.js** v24.6.0
- **Vite** como bundler moderno
- **TailwindCSS** para estilos (opcional)
- **SweetAlert2** para alertas amigables
- **Router de Vue** para navegación SPA
- **Fetch API** para conexión al backend

---

## 📁 Estructura del Proyecto
frontend/
│
├── public/ # Archivos estáticos
├── src/
│ ├── assets/ # Estilos, logos, etc.
│ ├── components/ # Componentes reutilizables (Navbar, Cards, etc.)
│ ├── views/ # Vistas principales (Login, Register, ForgotPassword, etc.)
│ ├── router/ # Rutas definidas con Vue Router
│ ├── App.vue # Componente raíz
│ └── main.js # Punto de entrada
├── vite.config.js # Configuración de Vite
└── README.md # Este archivo

---

## 🚀 Instalación y Uso

### 1. Clonar el proyecto
- git clone https://github.com/tu-repo.git
- cd frontend

### 2. Instalar dependencias
npm install

### 3. Ejecutar en modo desarrollo
npm run dev

Abre tu navegador en:
📍 http://localhost:5173

## Paquetes instalados
- npm install vue
- npm install vite
- npm install sweetalert2
- npm install vue-router
- npm install -D tailwindcss postcss autoprefixer
- npx tailwindcss init -p

## 🔐 Funcionalidades Implementadas

🔐 Login: Verifica usuario y contraseña contra el backend
📝 Registro: Crea usuarios nuevos
🔁 Recuperación de contraseña: Solicita solo el username y nueva contraseña (sin correo)
🔄 Redirecciones automáticas luego de acciones exitosas
🧠 Validaciones básicas en formularios (v-model, blur, campos requeridos)
🎨 UI minimalista con estilo moderno (opcionalmente usando TailwindCSS)

## Conexión con el Backend
- Asegúrate de que el backend esté corriendo en http://localhost:3000.
- El frontend envía peticiones fetch a endpoints como:
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/simple-reset

## Notas Adicionales
- Puedes personalizar colores, fuentes y estructura visual en src/assets o directamente en Tailwind.
- El sistema de rutas es expandible y puedes protegerlas con navegación condicional según roles o JWT.

## Autor
Desarrollado por Fabrizio Galindo Ayala
Frontend SPA con Vue 3 + Vite