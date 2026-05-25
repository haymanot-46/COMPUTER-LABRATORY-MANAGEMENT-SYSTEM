const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'haymanot',
    password: process.env.DB_PASSWORD || 'haymanot',
    database: process.env.DB_NAME || 'clms_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const sequelize = new Sequelize(
    process.env.DB_NAME || 'clms_db',
    process.env.DB_USER || 'haymanot',
    process.env.DB_PASSWORD || 'haymanot',
    {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? false : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Sequelize connected to MySQL');
    } catch (error) {
        console.error('❌ Sequelize connection failed:', error.message);
        throw error;
    }
};

const disconnectDB = async () => {
    try {
        await sequelize.close();
        console.log('✅ Sequelize connection closed');
    } catch (error) {
        console.error('Error closing Sequelize:', error.message);
    }
    try {
        await pool.end();
        console.log('✅ MySQL pool closed');
    } catch (error) {
        console.error('Error closing pool:', error.message);
    }
};

module.exports = { pool, sequelize, connectDB, disconnectDB };
