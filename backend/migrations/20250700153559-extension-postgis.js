'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Activa la extensión PostGIS
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
  },

  async down (queryInterface, Sequelize) {
    // Opción para revertir la extensión (solo si estás seguro)
    await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS postgis;');
  }
};
