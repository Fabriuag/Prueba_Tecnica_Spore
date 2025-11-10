// src/routes/basic.js
const express = require('express');
const router = express.Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'API funcionando correctamente' });
});

module.exports = router;