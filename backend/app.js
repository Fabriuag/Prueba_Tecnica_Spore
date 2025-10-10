require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { authenticate, isAdmin } = require('./src/middlewares/auth');
const authRoutes = require('./src/routes/auth');
const { sequelize } = require('./models');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/admin/dashboard', authenticate, isAdmin, (req, res) => {
  res.json({ message: '¡Bienvenido admin!' });
});

app.get('/health', (req, res) => res.json({ ok: true }));

// 🔹 Levanta el server primero
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API en http://localhost:${PORT}`));

const adminRoutes = require('./src/routes/admin')
app.use('/api/admin', adminRoutes)


// 🔹 Valida la DB en paralelo (sin cerrar el server)
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB conectada.');
  } catch (err) {
    console.error('❌ Error al conectar DB:', err.message);
    // NO hacemos process.exit(1); para que /health siga arriba
  }
})();
