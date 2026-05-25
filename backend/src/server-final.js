const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin: ['http://localhost:5171', 'http://localhost:5173', 'http://localhost:5175', 'http://localhost:5000', 'http://localhost:5001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

// ============================================
// DATABASE CONNECTION POOL (MUST be before route imports)
// ============================================
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

global.dbPool = pool;
app.locals.db = pool;

// Import routes - MVC structure (AFTER pool is set up)
const apiRoutes = require('./routes/index');
const Settings = require('./models/Settings');

// Import middleware
const { protect, authorize } = require('./middleware/authMiddleware');

let dbConnected = false;

async function testDB() {
    try {
        const conn = await pool.getConnection();
        console.log('✅ MySQL Database connected!');
        conn.release();
        dbConnected = true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        dbConnected = false;
    }
}

// ============================================
// CREATE TABLES IF NOT EXISTS (safety net)
// ============================================
async function createEquipmentTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS equipment (
                id INT PRIMARY KEY AUTO_INCREMENT,
                code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                category VARCHAR(50),
                laboratory VARCHAR(50),
                serial_number VARCHAR(100),
                model VARCHAR(100),
                manufacturer VARCHAR(100),
                purchase_date DATE,
                purchase_cost DECIMAL(10,2),
                current_value DECIMAL(10,2),
                warranty_expiry DATE,
                \`condition\` ENUM('excellent', 'good', 'fair', 'poor', 'damaged') DEFAULT 'good',
                status ENUM('available', 'borrowed', 'maintenance', 'retired', 'lost') DEFAULT 'available',
                borrower_id INT,
                borrower_name VARCHAR(100),
                borrowed_at DATETIME,
                expected_return_date DATE,
                returned_at DATETIME,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS audits (
                id INT PRIMARY KEY AUTO_INCREMENT,
                laboratory_id INT,
                auditor VARCHAR(100),
                audit_date DATE,
                total_items INT DEFAULT 0,
                present_items INT DEFAULT 0,
                missing_items INT DEFAULT 0,
                damaged_items INT DEFAULT 0,
                compliance_rate DECIMAL(5,2) DEFAULT 0,
                status VARCHAR(50) DEFAULT 'completed',
                notes TEXT,
                checklist_items JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Equipment & Audits tables ready');
    } catch (error) {
        console.error('Error creating tables:', error.message);
    }
}

async function createContactMessagesTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                subject VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                category VARCHAR(50) DEFAULT 'general',
                priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
                status ENUM('pending', 'replied', 'resolved') DEFAULT 'pending',
                reply TEXT,
                replied_by INT NULL,
                replied_at TIMESTAMP NULL,
                ticket_number VARCHAR(50) UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (replied_by) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_contact_email (email),
                INDEX idx_contact_status (status),
                INDEX idx_contact_ticket (ticket_number)
            )
        `);
        console.log('✅ Contact messages table ready');
    } catch (error) {
        console.error('Error creating contact messages table:', error.message);
    }
}

// ============================================
// EMAIL CONFIGURATION
// ============================================

const createEmailTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || false,
        auth: {
            user: process.env.SMTP_USER || 'haymanotebabu2@gmail.com',
            pass: process.env.SMTP_PASS || ''
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

async function sendEmail({ to, subject, html, text }) {
    try {
        if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'true') {
            console.log('📧 Email notifications are disabled. To enable, set ENABLE_EMAIL_NOTIFICATIONS=true');
            return false;
        }
        const transporter = createEmailTransporter();
        const mailOptions = {
            from: process.env.SMTP_FROM || `"CLMS Support" <${process.env.SMTP_USER}>`,
            to: to,
            subject: subject,
            html: html,
            text: text || html.replace(/<[^>]*>/g, '')
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${to}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        if (error.code === 'EAUTH') {
            console.error('   Authentication failed. Please check your SMTP_USER and SMTP_PASS in .env');
            console.error('   For Gmail, use an App Password: https://myaccount.google.com/apppasswords');
        }
        return false;
    }
}

async function sendEmailNotification({ to, subject, html }) {
    console.log(`📧 Email would be sent to ${to}: ${subject}`);
    return true;
}

async function sendEmailResponse({ to, subject, html }) {
    console.log(`📧 Response email would be sent to ${to}: ${subject}`);
    return true;
}

// ============================================
// IMPORT AND MOUNT ALL ROUTES (MVC STRUCTURE)
// ============================================

// Mount all API routes (MVC structure)
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: 'CLMS API is running'
    });
});

// ============================================
// INITIALIZATION
// ============================================

async function initSettings() {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM settings');
        if (rows[0].count === 0) {
            await pool.query(`INSERT INTO settings 
                (site_name, site_description, contact_email, timezone, date_format, 
                 language, items_per_page, maintenance_mode, allow_registration, 
                 default_user_role, email_notifications, sms_notifications, 
                 system_theme, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, [
                'CLMS', 'Computer Laboratory Management System', 'admin@clms.com',
                'Africa/Addis_Ababa', 'Y-m-d', 'en', 10, false, true, 'student',
                false, false, 'light'
            ]);
            console.log('✅ Default settings initialized');
        }
    } catch (error) {
        console.error('Settings init error:', error.message);
    }
}

async function start() {
    await testDB();
    await initSettings();
    await createEquipmentTable();
    // Uncomment to create contact messages table:
    // await createContactMessagesTable();
    app.listen(PORT, () => {
        console.log(`\n========================================`);
        console.log(` CLMS BACKEND`);
        console.log(` http://localhost:${PORT}`);
        console.log(` Database: ${dbConnected ? 'CONNECTED ✅' : 'NOT CONNECTED ❌'}`);
        console.log(`========================================\n`);
    });
}

start();
