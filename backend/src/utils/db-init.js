const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const initDatabase = async () => {
    let connection;
    
    try {
        // First connect without database to create it
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'haymanot',
            password: process.env.DB_PASSWORD || 'haymanot'
        });
        
        // Create database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'clms_db'}`);
        console.log('✅ Database created/verified');
        
        // Connect to the database
        await connection.changeUser({ database: process.env.DB_NAME || 'clms_db' });
        
        // Read SQL file
        const sqlFile = path.join(__dirname, '../config/database-fixed.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');
        
        // Split SQL statements
        const statements = sql.split(';').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.query(statement);
                    console.log('✅ Executed SQL statement');
                } catch (err) {
                    if (!err.message.includes('already exists')) {
                        console.warn('⚠️ SQL warning:', err.message);
                    }
                }
            }
        }
        
        console.log('\n🎉 Database initialized successfully!');
        console.log('========================================');
        console.log('📊 Default Credentials:');
        console.log('   Admin: admin@clms.com / 123456');
        console.log('   Teacher: teacher@clms.com / 123456');
        console.log('   Student: student@clms.com / 123456');
        console.log('   Lab Manager: labmanager@clms.com / 123456');
        console.log('========================================');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
};

initDatabase();
