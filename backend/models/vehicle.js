// backend/models/vehicle.js
module.exports = (sequelize, DataTypes) => {
  const Vehicle = sequelize.define('Vehicle', {
    id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    plates:   { type: DataTypes.STRING,  allowNull: false, unique: true },
    brand:    { type: DataTypes.STRING,  allowNull: false },
    model:    { type: DataTypes.STRING,  allowNull: true  },
    color:    { type: DataTypes.STRING,  allowNull: true  },

    // ÚNICO campo de imagen (binario)
    image:    { type: DataTypes.BLOB,    allowNull: true  },

    // GEOGRAPHY(Point,4326): [lon, lat]
    location: { type: DataTypes.GEOGRAPHY('POINT', 4326), allowNull: true },

    userId:   { type: DataTypes.INTEGER, allowNull: true },

    // Soft delete
    deletedAt:{ type: DataTypes.DATE,    allowNull: true  },
  }, {
    tableName: 'Vehicles',
    timestamps: true,
    paranoid: true,
    deletedAt: 'deletedAt',
  });

  Vehicle.associate = (models) => {
    Vehicle.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
  };

  return Vehicle;
};
