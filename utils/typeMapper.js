const { DataTypes } = require('sequelize');

function mapToSequelizeType(sqlType) {
  if (sqlType.startsWith('varchar')) return DataTypes.STRING;
  if (sqlType.startsWith('int')) return DataTypes.INTEGER;
  if (sqlType.startsWith('float')) return DataTypes.FLOAT;
  if (sqlType === 'text') return DataTypes.TEXT;
  if (sqlType.startsWith('tinyint')) return DataTypes.BOOLEAN;
  return DataTypes.STRING; // Default type
}

module.exports = { mapToSequelizeType };
