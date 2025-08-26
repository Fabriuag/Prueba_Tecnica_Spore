'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // INTEGER -> STRING (Postgres suele castear implícitamente 4 -> '4')
    await queryInterface.changeColumn('Automoviles', 'places', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    // Si tu Postgres se queja, usa esta alternativa:
    // await queryInterface.sequelize.query(
    //   'ALTER TABLE "Automoviles" ALTER COLUMN "places" TYPE VARCHAR USING "places"::text;'
    // );
  },

  async down(queryInterface, Sequelize) {
    // Revertir a INTEGER
    await queryInterface.changeColumn('Automoviles', 'places', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    // Alternativa segura:
    // await queryInterface.sequelize.query(
    //   'ALTER TABLE "Automoviles" ALTER COLUMN "places" TYPE INTEGER USING "places"::integer;'
    // );
  }
};
