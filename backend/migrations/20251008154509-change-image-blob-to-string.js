'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Vehicles', 'image')
    await queryInterface.addColumn('Vehicles', 'image', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Vehicles', 'image')
    await queryInterface.addColumn('Vehicles', 'image', {
      type: Sequelize.BLOB,
      allowNull: true,
    })
  }
}
