'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface) => {
    const hashAdmin = await bcrypt.hash('P@ssw0rd123', 10);
    const hashRegular = await bcrypt.hash('P@nt@n@1', 10);

    await queryInterface.bulkInsert('Users', [
      {
        username: 'admin',
        password: hashAdmin,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'regular',
        password: hashRegular,
        role: 'regular',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', {
      username: ['admin', 'regular']
    }, {});
  }
};
