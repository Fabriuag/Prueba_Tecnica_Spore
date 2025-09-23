'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');

    await queryInterface.createTable('Vehicles', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

      plates:   { type: Sequelize.STRING, allowNull: false, unique: true },

      brand:    { type: Sequelize.STRING, allowNull: false },
      model:    { type: Sequelize.STRING, allowNull: true  },
      color:    { type: Sequelize.STRING, allowNull: true  },
      imageUrl: { type: Sequelize.STRING, allowNull: true  },

      // GEOGRAPHY(Point, 4326) -> [lon, lat]
      location: { type: Sequelize.GEOGRAPHY('POINT', 4326), allowNull: true },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('Vehicles', ['userId'],  { name: 'vehicles_userId_idx' });
    await queryInterface.addIndex('Vehicles', ['plates'],  { name: 'vehicles_plates_idx', unique: true });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Vehicles', 'vehicles_plates_idx');
    await queryInterface.removeIndex('Vehicles', 'vehicles_userId_idx');
    await queryInterface.dropTable('Vehicles');
  },
};

