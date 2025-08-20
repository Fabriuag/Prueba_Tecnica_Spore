// models/automovil.js
module.exports = (sequelize, DataTypes) => {
  const Automovil = sequelize.define('Automovil', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    places: { type: DataTypes.INTEGER, allowNull: false },
    marca:  { type: DataTypes.STRING,  allowNull: false },
    color:  DataTypes.STRING,
    modelo: DataTypes.STRING,
    latitud: DataTypes.FLOAT,
    longitud: DataTypes.FLOAT,
    userId: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName: 'Automoviles',
    timestamps: true,
  });

  Automovil.associate = (models) => {
    // 👇 añade el alias 'User' para que coincida con el include
    Automovil.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
  };

  return Automovil;
};
