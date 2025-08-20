'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Automoviles', 'color',   { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Automoviles', 'modelo',  { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Automoviles', 'latitud', { type: Sequelize.FLOAT,  allowNull: true });
    await queryInterface.addColumn('Automoviles', 'longitud',{ type: Sequelize.FLOAT,  allowNull: true });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('Automoviles', 'color');
    await queryInterface.removeColumn('Automoviles', 'modelo');
    await queryInterface.removeColumn('Automoviles', 'latitud');
    await queryInterface.removeColumn('Automoviles', 'longitud');
  }
};