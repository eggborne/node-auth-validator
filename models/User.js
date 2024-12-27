'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  User.init(
    {
      uid: {
        type: DataTypes.STRING(2048),
        primaryKey: true,
        allowNull: false,
      },
      accessToken: {
        type: DataTypes.STRING(2048),
        allowNull: false,
      },
      displayName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      photoURL: {
        type: DataTypes.STRING(2048),
        allowNull: false,
      },
      authorizations: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      preferences: {
        type: DataTypes.TEXT, // Matches LONGTEXT in MySQL
        allowNull: false,
        defaultValue: JSON.stringify({}), // Default as a stringified empty object
        get() {
          const rawValue = this.getDataValue('preferences');
          return rawValue ? JSON.parse(rawValue) : {}; // Parse JSON on retrieval
        },
        set(value) {
          this.setDataValue('preferences', JSON.stringify(value)); // Stringify JSON on save
        },
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: false,
    }
  );

  return User;
};
