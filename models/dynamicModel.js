const { sequelize } = require('./index');
const { mapToSequelizeType } = require('../utils/typeMapper');

async function getTableSchema(tableName) {
  const [results] = await sequelize.query(`DESCRIBE ${tableName}`);
  return results;
}

async function defineDynamicModel(tableName) {
  const schema = await getTableSchema(tableName);
  const attributes = {};
  schema.forEach((column) => {
    attributes[column.Field] = {
      type: mapToSequelizeType(column.Type),
      allowNull: column.Null === 'YES',
      primaryKey: column.Key === 'PRI',
      defaultValue: column.Default,
    };
  });

  return sequelize.define(tableName, attributes, { tableName, timestamps: false });
}

module.exports = { defineDynamicModel, getTableSchema };
