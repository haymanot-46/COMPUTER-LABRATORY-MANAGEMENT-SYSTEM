const mysql = require('mysql2/promise');
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

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log(`✅ MySQL Database connected successfully!`);
        console.log(`   Database: ${process.env.DB_NAME || 'clms_db'}`);
        console.log(`   User: ${process.env.DB_USER || 'haymanot'}@${process.env.DB_HOST || 'localhost'}:${parseInt(process.env.DB_PORT) || 3306}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        return false;
    }
};

module.exports = { pool, testConnection };
