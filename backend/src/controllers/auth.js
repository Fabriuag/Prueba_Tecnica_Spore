const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const bcrypt = require('bcryptjs');

// ===============================
// REGISTRAR USUARIO
// ===============================
const register = async (req, res) => {
  try {
    const {
      username,
      password,
      role = 'regular',
      firstName = '',
      lastName  = '',
      phone     = null,
      email     = null,
    } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const exists = await User.findOne({ where: { username }, paranoid: false });
    if (exists) return res.status(409).json({ error: 'El usuario ya existe' });

    if (email) {
      const emailTaken = await User.findOne({ where: { email }, paranoid: false });
      if (emailTaken) return res.status(409).json({ error: 'El email ya está en uso' });
    }

    const user = await User.create({
      username, password, role, firstName, lastName, phone, email
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
      }
    });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// ===============================
// INICIAR SESIÓN
// ===============================
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.scope(null).findOne({
      where: { username },
      attributes: { include: ['password'] }
    });

    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await user.validPassword(password);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
      }
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// ===============================
// VERIFICAR TOKEN JWT
// ===============================
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
  } catch {
    return null;
  }
};

// ===============================
// RESTABLECER CONTRASEÑA SIMPLE
// ===============================
const simpleReset = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.password = password;

    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Error en simpleReset:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

module.exports = {
  register,
  login,
  verifyToken,
  simpleReset
};
