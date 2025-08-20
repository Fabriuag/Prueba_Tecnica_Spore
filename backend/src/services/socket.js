const socketIO = require('socket.io');

const configureSocket = (server) => {
  const io = socketIO(server);

  io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.on('updatePosition', (data) => {
      // Emitir nueva posición a todos los clientes
      io.emit('positionUpdated', data);
    });
  });

  return io;
};

module.exports = configureSocket;