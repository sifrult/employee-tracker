const Sequelize = require('sequelize');

// Create connection object
const sequelize = new Sequelize(
    //database name
    'personnel_db',
    // user
    'root',
    // password
    process.env.MYSQL_PASSWORD,
    {
        // Database location
        host: 'localhost',
        dialect: 'mysql',
        port: 3306
    }
);

module.exports = sequelize;
