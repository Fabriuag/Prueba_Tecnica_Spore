'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) Agregar columna binaria para la imagen
    await queryInterface.addColumn('Vehicles', 'image', {
      type: Sequelize.BLOB, // Postgres -> BYTEA
      allowNull: true,
    });

    // 2) Agregar columna para soft delete
    await queryInterface.addColumn('Vehicles', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // 3) Eliminar definitivamente la columna imageUrl
    //    (perderás esos datos; haz backup si los necesitas)
    await queryInterface.removeColumn('Vehicles', 'imageUrl');
  },

  async down(queryInterface, Sequelize) {
    // Revertir: volver a crear imageUrl y quitar image/deletedAt
    await queryInterface.addColumn('Vehicles', 'imageUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.removeColumn('Vehicles', 'image');
    await queryInterface.removeColumn('Vehicles', 'deletedAt');
  },
};
