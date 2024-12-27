'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      // Example: this.hasMany(models.Inventory, { foreignKey: 'userId' });
    }
  }

  User.init(
    {
      uid: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      displayName: DataTypes.STRING,
      email: DataTypes.STRING,
      photoURL: DataTypes.STRING,
      accessToken: DataTypes.STRING,
      authorizations: DataTypes.JSON,
      preferences: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: 'User',
      timestamps: true,
      createdAt: false,
      updatedAt: 'updated_at',
    }
  );

  return User;
};
