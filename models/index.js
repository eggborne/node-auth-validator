
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const dotenv = require('dotenv');

console.log('Raw NODE_ENV:', JSON.stringify(process.env.NODE_ENV));

const env = (process.env.NODE_ENV || 'development').trim();
console.log(`Environment detected: ${env}`);

if (env === 'development') {
  console.log('Loading .env.local');
  dotenv.config({ path: '.env.local', override: true });
} else {
  console.log('Loading .env');
  dotenv.config({ path: '.env', override: true });
}

console.log('Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  MYSQL_DATABASE: process.env.MYSQL_DATABASE,
  MYSQL_USER: process.env.MYSQL_USER,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
  MYSQL_HOST: process.env.MYSQL_HOST,
});


const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

const db = {};

fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.js') && file !== 'index.js' && file !== 'dynamicModel.js')
  .forEach(file => {
    console.log('Loading model:', file);
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
