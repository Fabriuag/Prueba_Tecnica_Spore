// backend/models/user.js
const bcrypt = require('bcrypt')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username:  { type: DataTypes.STRING, unique: true, allowNull: false },
    password:  { type: DataTypes.STRING, allowNull: false },
    role:      { type: DataTypes.ENUM('admin', 'regular'), defaultValue: 'regular' },
    firstName: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    lastName:  { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    phone:     { type: DataTypes.STRING, allowNull: true },
    email:     { type: DataTypes.STRING, allowNull: true, unique: true },
    deletedAt: { type: DataTypes.DATE, allowNull: true },     // 👈 importante
  }, {
    tableName: 'Users',
    timestamps: true,
    paranoid: true,                 // 👈 esto activa el borrado lógico
    deletedAt: 'deletedAt',         // 👈 usa el campo de tu migración
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) user.password = await bcrypt.hash(user.password, 10)
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10)
      },
    },
  })

  User.associate = (models) => {
    User.hasMany(models.Vehicle, { foreignKey: 'userId', as: 'Vehicles' })
  }

  User.prototype.validPassword = function (password) {
    return bcrypt.compare(password, this.password)
  }

  return User
}
