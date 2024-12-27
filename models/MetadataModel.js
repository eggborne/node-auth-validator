const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MetadataModel extends Model { }

  MetadataModel.init(
    {
      table_name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      schema_json: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Metadata',
      tableName: 'table_schemas',
      timestamps: false,
    }
  );

  return MetadataModel;
};
