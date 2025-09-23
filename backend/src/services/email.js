// src/services/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // tu correo Gmail
    pass: process.env.EMAIL_PASS  // contraseña o app password
  }
});

const sendResetPasswordEmail = async ({ to, name, resetUrl }) => {
  const mailOptions = {
    from: `"Soporte Técnico" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Restablecimiento de contraseña',
    html: `
      <p>Hola ${name || ''},</p>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Este enlace expirará en 1 hora.</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.response);
  } catch (err) {
    console.error('Error desde email.js:', err);
    throw err;  // muy importante
  }
};

module.exports = { sendResetPasswordEmail };
