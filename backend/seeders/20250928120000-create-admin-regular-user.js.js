const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface) => {
    const adminExists = await queryInterface.sequelize.query(
      'SELECT 1 FROM "Users" WHERE username = \'admin\' LIMIT 1'
    );
    if (!adminExists[0].length) {
      const hashAdmin = await bcrypt.hash('P@ssw0rd123', 10);
      await queryInterface.bulkInsert('Users', [{
        username: 'admin',
        password: hashAdmin,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }

    const regularExists = await queryInterface.sequelize.query(
      'SELECT 1 FROM "Users" WHERE username = \'regular\' LIMIT 1'
    );
    if (!regularExists[0].length) {
      const hashRegular = await bcrypt.hash('P@nt@n@1', 10);
      await queryInterface.bulkInsert('Users', [{
        username: 'regular',
        password: hashRegular,
        role: 'regular',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', { username: ['admin', 'regular'] }, {});
  }
};
