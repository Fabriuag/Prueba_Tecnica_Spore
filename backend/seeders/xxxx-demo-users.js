module.exports = {
  up: async (queryInterface) => {
    // Verifica si el usuario admin ya existe
    const adminExists = await queryInterface.sequelize.query(
      'SELECT 1 FROM "Users" WHERE username = \'admin\' LIMIT 1'
    );
    
    if (!adminExists[0].length) {
      await queryInterface.bulkInsert('Users', [{
        username: 'admin',
        password: '$2b$10$EcOezI2R6UbZxP0BRS/Jw.Dkf9Ylz4j2K2eQJOP.tj4HFQWoxBpV6', 
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', { username: 'admin' }, {});
  }
};