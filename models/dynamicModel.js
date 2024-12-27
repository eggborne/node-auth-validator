const { mapToSequelizeType } = require('../utils/typeMapper'); // Type mapper utility
const db = require('./index');
const sequelize = db.sequelize;

async function getTableSchema(tableName) {
  try {
    const [results] = await sequelize.query(`DESCRIBE ${tableName}`);
    return results;
  } catch (error) {
    console.error(`Error fetching schema for table "${tableName}":`, error);
    throw error;
  }
}

async function defineDynamicModel(tableName) {
  try {
    const schema = await getTableSchema(tableName); // Get the schema of the table
    const attributes = {};

    // Convert each column definition into Sequelize model attributes
    schema.forEach((column) => {
      attributes[column.Field] = {
        type: mapToSequelizeType(column.Type),
        allowNull: column.Null === 'YES',
        primaryKey: column.Key === 'PRI',
        defaultValue: column.Default,
      };
    });

    // Dynamically define and return the model
    return sequelize.define(tableName, attributes, { tableName, timestamps: false });
  } catch (error) {
    console.error(`Error defining model for table "${tableName}":`, error);
    throw error;
  }
}

module.exports = { defineDynamicModel, getTableSchema };
