  // models/user.js
  const bcrypt = require('bcrypt');

  module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: DataTypes.STRING, unique: true, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.ENUM('admin', 'regular'), defaultValue: 'regular' },
    }, {
      tableName: 'Users',
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    });

    User.associate = (models) => {
      User.hasMany(models.Automovil, { foreignKey: 'userId', as: 'Automoviles' });
    };

    User.prototype.validPassword = function (password) {
      return bcrypt.compare(password, this.password);
    };

    return User;
  };
