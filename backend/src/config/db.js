const mysql = require('mysql2/promise');

// MySQL configuration with YOUR credentials
const pool = mysql.createPool({
    host: 'localhost',
    port: 8889,              // MAMP port
    user: 'haymanot',        // Your username
    password: 'haymanot',    // Your password
    database: 'clms_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Database connected successfully!');
        console.log('   Database: clms_db');
        console.log('   User: haymanot@localhost:8889');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        return false;
    }
};

module.exports = { pool, testConnection };
