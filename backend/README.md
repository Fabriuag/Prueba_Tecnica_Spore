# 🚗 Backend - Sistema de Gestión de Usuarios y Vehículos

Este es el backend de un sistema desarrollado con Node.js y Express que permite:

- Registro e inicio de sesión de usuarios con JWT
- Gestión de contraseñas con hashing (bcryptjs)
- Restablecimiento de contraseña simple
- Documentación del API con Swagger
- Base de datos PostgreSQL conectada mediante Sequelize ORM

---

## 🔧 Tecnologías Utilizadas

- **Node.js** v24.6.0
- **Express** - Framework de servidor
- **Sequelize** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos relacional
- **JWT (jsonwebtoken)** - Autenticación por tokens
- **bcryptjs** - Hasheo seguro de contraseñas
- **dotenv** - Variables de entorno
- **Swagger** - Documentación de la API
- **nvm** - Node Version Manager (`v11.5.1`)

---
### Estructuras de carpetas
backend/
│
├── config/ # Configuración de Sequelize
├── controllers/ # Controladores (auth.js, user.js, etc.)
├── models/ # Modelos Sequelize (User.js, Vehicle.js)
├── routes/ # Rutas de la API (auth.js, user.js, etc.)
├── swagger/ # Configuración y specs de Swagger
├── middleware/ # Middlewares personalizados
├── .env # Variables de entorno (no se sube)
├── server.js # Archivo principal del servidor
└── README.md # Este archivo

## 🔐 Funcionalidades Principales

### ✅ Registro de Usuario
- Endpoint: `POST /api/auth/register`
- Campos: `username`, `password`, `role`, `email`, etc.
- Valida duplicados y hashea la contraseña

### 🔐 Login con JWT
- Endpoint: `POST /api/auth/login`
- Devuelve token JWT válido por 24h

### 🔁 Restablecimiento de Contraseña
- Endpoint: `POST /api/auth/simple-reset`
- Requiere `username` y nueva `password`
- Actualiza la contraseña del usuario (hasheada)

### 🔒 Protección con Borrado Lógico
- Modelo `User` configurado con `paranoid: true`
- Las eliminaciones son suaves (no se borra físicamente)

---

## 📄 Modelos Sequelize

### 🧑‍💼 User
{
  id: INTEGER (PK),
  username: STRING (único),
  password: STRING (hasheado),
  role: ENUM('admin', 'regular'),
  firstName, lastName, phone, email,
  deletedAt: DATE (borrado lógico)
}


## Instalación y Ejecución del Backend

### Clona el repositorio y entra al backend:

git clone https://github.com/tu-repo.git
cd backend

### Instala las dependencias 
npm install

### Crea un archivo .env en la raíz:
PORT=3000
JWT_SECRET=tu_clave_secreta
DATABASE_URL=postgres://usuario:clave@localhost:5432/tu_basededatos

### Configura Sequelize y aplica migraciones:
npx sequelize-cli db:migrate

### Inicia el servidor:
npm run dev

## Dependencias clave del Backend
npm install express sequelize pg pg-hstore dotenv
npm install bcryptjs jsonwebtoken
npm install swagger-jsdoc swagger-ui-express

## Notas Adicionales
La base de datos usada es PostgreSQL.
Las contraseñas están protegidas con bcryptjs (10 salt rounds).
La autenticación usa JWT con expiración de 24h.
La API soporta registro, login, recuperación de contraseña y más.
Todos los errores están manejados con códigos HTTP apropiados (400, 401, 404, 500).
