const { queryInterface } = require('sequelize');
const { MetadataModel } = require('../models/MetadataModel');

async function addColumn(tableName, columnName, options) {
  await queryInterface.addColumn(tableName, columnName, options);

  await MetadataModel.create({
    table_name: tableName,
    column_name: columnName,
    data_type: options.type.key,
    allow_null: options.allowNull ?? true,
    default_value: options.defaultValue ?? null,
    is_primary_key: false,
  });
}

async function removeColumn(tableName, columnName) {
  await queryInterface.removeColumn(tableName, columnName);

  await MetadataModel.destroy({
    where: { table_name: tableName, column_name: columnName },
  });
}


async function modifyColumn(tableName, columnName, options) {
  await queryInterface.changeColumn(tableName, columnName, options);
}

module.exports = { addColumn, removeColumn, modifyColumn };
