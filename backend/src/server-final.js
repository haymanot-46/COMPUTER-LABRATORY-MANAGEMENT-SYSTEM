const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Import routes
const settingRoutes = require('./routes/settingRoutes');
const Settings = require('./models/Settings');
const deanRoutes = require('./routes/deanRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');

// Import middleware
const { protect, authorize } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5001;

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5175', 'http://localhost:5001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

// ============================================
// DATABASE CONNECTION POOL
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
// CREATE TABLES IF NOT EXISTS
// ============================================
async function createEquipmentTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS equipment (
                id INT PRIMARY KEY AUTO_INCREMENT,
                code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                category VARCHAR(50),
                laboratory VARCHAR(100),
                serial_number VARCHAR(100),
                model VARCHAR(100),
                manufacturer VARCHAR(100),
                purchase_date DATE,
                purchase_cost DECIMAL(10,2),
                warranty_expiry DATE,
                \`condition\` ENUM('excellent', 'good', 'fair', 'poor', 'damaged') DEFAULT 'good',
                status ENUM('available', 'in-use', 'maintenance', 'damaged') DEFAULT 'available',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Equipment table ready');
        
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
        console.log('✅ Audits table ready');
    } catch (error) {
        console.error('Error creating tables:', error.message);
    }
}

// ============================================
// CONTACT MESSAGES TABLE
// ============================================
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
        // Check if email notifications are enabled
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

// ============================================
// SUBMIT CONTACT MESSAGE
// ============================================
app.post('/api/contact/submit', async (req, res) => {
    try {
        const { name, email, subject, message, category, priority } = req.body;
        
        console.log('📧 Contact form submission:', { name, email, subject });
        
        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }
        
        // Generate unique ticket number
        const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Insert message into database
        const [result] = await pool.query(`
            INSERT INTO contact_messages 
            (name, email, subject, message, category, priority, ticket_number, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `, [name, email, subject, message, category || 'general', priority || 'normal', ticketNumber]);
        
        console.log(`✅ Contact message saved - Ticket: ${ticketNumber}, ID: ${result.insertId}`);
        
        // Get lab managers and admins to notify
        const [managers] = await pool.query(`
            SELECT id, email, name FROM users WHERE role IN ('lab_manager', 'admin') AND is_active = 1
        `);
        
        // Send email notification to lab managers and admins
        for (const manager of managers) {
            await sendEmail({
                to: manager.email,
                subject: `[CLMS] New Contact Message: ${subject}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #667eea;">New Contact Message Received</h2>
                        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
                        <p><strong>From:</strong> ${name} (${email})</p>
                        <p><strong>Subject:</strong> ${subject}</p>
                        <p><strong>Priority:</strong> ${priority || 'normal'}</p>
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <p><strong>Message:</strong></p>
                            <p>${message.replace(/\n/g, '<br>')}</p>
                        </div>
                        <hr>
                        <p>Login to CLMS dashboard to reply to this message:</p>
                        <a href="http://localhost:5173/lab-manager/messages" style="background-color: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Message</a>
                        <p style="font-size: 12px; color: #999; margin-top: 20px;">CLMS - Computer Laboratory Management System</p>
                    </div>
                `
            });
        }
        
        // Send confirmation email to the sender
        await sendEmail({
            to: email,
            subject: `[CLMS] We've received your message: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10b981;">Thank You for Contacting CLMS</h2>
                    <p>Dear <strong>${name}</strong>,</p>
                    <p>We have received your message and will respond within 24 hours.</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p><strong>Your Message Details:</strong></p>
                        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
                        <p><strong>Subject:</strong> ${subject}</p>
                        <p><strong>Message:</strong></p>
                        <p>${message.replace(/\n/g, '<br>')}</p>
                    </div>
                    <p>You can check the status of your message using ticket number: <strong>${ticketNumber}</strong></p>
                    <hr>
                    <p style="font-size: 12px; color: #999;">CLMS - Computer Laboratory Management System<br>Injibara University</p>
                </div>
            `
        });
        
        res.status(201).json({
            success: true,
            message: 'Message sent successfully! Our team will respond within 24 hours.',
            ticket: {
                ticketNumber,
                status: 'pending'
            }
        });
        
    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message. Please try again later.' 
        });
    }
});

// ============================================
// GET CONTACT MESSAGES
// ============================================
app.get('/api/contact/messages', protect, authorize('lab_manager', 'admin'), async (req, res) => {
    try {
        const { status, category, priority, limit = 100 } = req.query;
        
        let query = `
            SELECT 
                cm.*,
                u.name as replied_by_name,
                u.email as replied_by_email
            FROM contact_messages cm
            LEFT JOIN users u ON cm.replied_by = u.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (status && status !== 'all') {
            query += ` AND cm.status = ?`;
            params.push(status);
        }
        
        if (category && category !== 'all') {
            query += ` AND cm.category = ?`;
            params.push(category);
        }
        
        if (priority && priority !== 'all') {
            query += ` AND cm.priority = ?`;
            params.push(priority);
        }
        
        query += ` ORDER BY 
            CASE cm.priority 
                WHEN 'urgent' THEN 1 
                WHEN 'high' THEN 2 
                WHEN 'normal' THEN 3 
                ELSE 4 
            END ASC,
            cm.created_at DESC
            LIMIT ?`;
        
        params.push(parseInt(limit));
        
        const [rows] = await pool.query(query, params);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// GET SINGLE CONTACT MESSAGE
// ============================================
app.get('/api/contact/messages/:id', protect, authorize('lab_manager', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await pool.query(`
            SELECT 
                cm.*,
                u.name as replied_by_name,
                u.email as replied_by_email
            FROM contact_messages cm
            LEFT JOIN users u ON cm.replied_by = u.id
            WHERE cm.id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// REPLY TO CONTACT MESSAGE
// ============================================
app.post('/api/contact/messages/:id/reply', protect, authorize('lab_manager', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;
        const repliedBy = req.user.id;
        const repliedByName = req.user.name;
        const repliedByEmail = req.user.email;
        
        if (!reply) {
            return res.status(400).json({ 
                success: false, 
                message: 'Reply message is required' 
            });
        }
        
        // Get the original message
        const [messages] = await pool.query(
            'SELECT id, name, email, subject, message, ticket_number FROM contact_messages WHERE id = ?',
            [id]
        );
        
        if (messages.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Message not found' 
            });
        }
        
        const message = messages[0];
        
        // Update message with reply
        await pool.query(`
            UPDATE contact_messages 
            SET reply = ?, status = 'replied', replied_by = ?, replied_at = NOW()
            WHERE id = ?
        `, [reply, repliedBy, id]);
        
        // Send email response to the client
        const emailSent = await sendEmail({
            to: message.email,
            subject: `Re: ${message.subject} (Ticket: ${message.ticket_number})`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10b981;">CLMS Support Team Response</h2>
                    <p>Dear <strong>${message.name}</strong>,</p>
                    <p>Thank you for contacting CLMS. Your message has been reviewed by our support team.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #667eea;">Your Original Message:</h4>
                        <p style="margin: 0;"><strong>Ticket:</strong> ${message.ticket_number}</p>
                        <p><strong>Subject:</strong> ${message.subject}</p>
                        <p><strong>Message:</strong></p>
                        <p>${message.message.replace(/\n/g, '<br>')}</p>
                    </div>
                    
                    <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #10b981;">Our Response:</h4>
                        <p>${reply.replace(/\n/g, '<br>')}</p>
                        <p style="margin-top: 10px;"><strong>Replied by:</strong> ${repliedByName} (${repliedByEmail})</p>
                    </div>
                    
                    <hr>
                    <p style="font-size: 12px; color: #666;">
                        If you have further questions, please reply to this email or submit a new message through the contact form.
                    </p>
                    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
                        CLMS - Computer Laboratory Management System<br>
                        Injibara University
                    </p>
                </div>
            `
        });
        
        console.log(`✅ Reply sent to ${message.email} for ticket ${message.ticket_number}, Email sent: ${emailSent}`);
        
        res.json({
            success: true,
            message: 'Reply sent successfully',
            emailSent: emailSent
        });
        
    } catch (error) {
        console.error('Error sending reply:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send reply' 
        });
    }
});

// ============================================
// DELETE CONTACT MESSAGE (Admin only)
// ============================================
app.delete('/api/contact/messages/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query('DELETE FROM contact_messages WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// Approve schedule
app.patch('/api/schedules/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { comments, approver_id } = req.body;
        
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const decoded = jwt.verify(token, 'secret-key');
        const approverId = approver_id || decoded.id;
        
        await pool.query(`
            UPDATE schedules 
            SET status = 'approved', approver_id = ?, rejection_reason = NULL
            WHERE id = ?
        `, [approverId, id]);
        
        res.json({ success: true, message: 'Schedule approved successfully' });
    } catch (error) {
        console.error('Error approving schedule:', error);
        res.status(500).json({ success: false, message: 'Failed to approve schedule' });
    }
});

// Reject schedule
app.patch('/api/schedules/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, approver_id } = req.body;
        
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const decoded = jwt.verify(token, 'secret-key');
        const approverId = approver_id || decoded.id;
        
        await pool.query(`
            UPDATE schedules 
            SET status = 'rejected', approver_id = ?, rejection_reason = ?
            WHERE id = ?
        `, [approverId, reason || 'No reason provided', id]);
        
        res.json({ success: true, message: 'Schedule rejected' });
    } catch (error) {
        console.error('Error rejecting schedule:', error);
        res.status(500).json({ success: false, message: 'Failed to reject schedule' });
    }
});


app.use('/api/settings', settingRoutes);
app.use('/api/dean', deanRoutes);
app.use('/api/schedules', scheduleRoutes);

// Initialize settings
async function initSettings() {
    try {
        const [tables] = await pool.query(`SHOW TABLES LIKE 'settings'`);
        if (tables.length === 0) {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS settings (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    key_name VARCHAR(100) UNIQUE NOT NULL,
                    value TEXT,
                    type VARCHAR(20) DEFAULT 'string',
                    category VARCHAR(50) DEFAULT 'system',
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            await pool.query(`
                INSERT INTO settings (key_name, value, type, category, description) VALUES
                ('system_name', 'CLMS', 'string', 'system', 'System name'),
                ('system_version', '2.0.0', 'string', 'system', 'System version'),
                ('maintenance_mode', 'false', 'boolean', 'system', 'Enable maintenance mode')
            `);
            console.log('✅ Default settings created');
        } else {
            console.log('✅ Settings table exists');
        }
    } catch (error) {
        console.error('Failed to initialize settings:', error.message);
    }
}

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', database: dbConnected ? 'Connected' : 'Disconnected' });
});

// Get all settings
app.get('/api/settings', async (req, res) => {
    try {
        const [settings] = await pool.query('SELECT * FROM settings');
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
});
// ============================================
// REGISTRATION ENDPOINT
// ============================================

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, name, password, role, department, student_id, phone, profile_image } = req.body;
        
        console.log('📝 Registration attempt:', email);
        
        // Validate required fields
        if (!email || !name || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email, name and password are required' 
            });
        }
        
        // Check if user already exists
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email.toLowerCase()]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered. Please login.' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Set default role if not provided
        const userRole = role || 'student';
        
        // Insert new user with profile_image column
        const [result] = await pool.query(
            `INSERT INTO users 
            (email, name, password, role, department, student_id, phone, profile_image, is_active, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
            [email.toLowerCase(), name, hashedPassword, userRole, department || null, student_id || null, phone || null, profile_image || null]
        );
        
        console.log('✅ User registered successfully:', email);
        
        // Generate token for auto-login (optional)
        const token = jwt.sign(
            { id: result.insertId, email: email, role: userRole, name: name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            token: token,
            user: {
                profile_image: user.profile_image || null,
                id: result.insertId,
                email: email,
                name: name,
                role: userRole,
                department: department || null,
                profile_image: user.profile_image || null
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Registration failed: ' + error.message 
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log(` Login attempt: ${email}`);
        
        const [rows] = await pool.query(
            'SELECT id, email, name, password, role, department, is_active, profile_image FROM users WHERE email = ?',
            [email]
        );
        
        console.log(` User found: ${rows.length > 0 ? 'YES' : 'NO'}`);
        
        if (rows.length === 0) {
            console.log(` No user found with email: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const user = rows[0];
        
        // Check if user is active
        if (user.is_active !== 1) {
            console.log(` User account is inactive: ${email}`);
            return res.status(401).json({ success: false, message: 'Account is disabled' });
        }
        
        console.log(` Comparing password for: ${email}`);
        const isValid = await bcrypt.compare(password, user.password);
        console.log(` Password valid: ${isValid}`);
        
        if (!isValid) {
            console.log(` Invalid password for: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        // Normalize role
        let role = user.role;
        const roleMap = {
            'lab-manager': 'lab_manager',
            'lab_manager': 'lab_manager',
            'lab-assistant': 'lab_assistant',
            'lab_assistant': 'lab_assistant'
        };
        role = roleMap[role] || role;
        
        console.log(` Login successful: ${email}, role: ${user.role} -> ${role}`);
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: role,
                department: user.department,
                profile_image: user.profile_image || null  
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed: ' + error.message });
    }
});

// ============================================
// CHANGE PASSWORD ENDPOINT
// ============================================
app.post('/api/auth/change-password', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized. Please login again.' });
        }
        
        let userId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
        }
        
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current password and new password are required' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }
        
        const [rows] = await pool.query('SELECT id, password FROM users WHERE id = ?', [userId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const user = rows[0];
        const isValid = await bcrypt.compare(currentPassword, user.password);
        
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        
        console.log(`✅ Password changed for user ID: ${userId}`);
        res.json({ success: true, message: 'Password changed successfully' });
        
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Failed to change password. Please try again.' });
    }
});

// ============================================
// FORGOT PASSWORD ENDPOINT
// ============================================
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log('📧 Forgot password request for:', email);
        
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        
        // First ensure columns exist
        try {
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255) NULL`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expiry DATETIME NULL`);
        } catch (err) {
            // Columns might already exist
        }
        
        const [users] = await pool.query(
            'SELECT id, email, name FROM users WHERE email = ? AND is_active = 1',
            [email.toLowerCase()]
        );
        
        if (users.length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: 'If your email is registered, you will receive a password reset link.' 
            });
        }
        
        const user = users[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetExpiry = new Date(Date.now() + 3600000);
        
        await pool.query(
            'UPDATE users SET reset_password_token = ?, reset_password_expiry = ? WHERE id = ?',
            [resetTokenHash, resetExpiry, user.id]
        );
        
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5175'}/reset-password/${resetToken}`;
        
        await sendEmail({
            to: user.email,
            subject: 'CLMS - Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #10b981;">Password Reset Request</h2>
                    <p>Dear <strong>${user.name}</strong>,</p>
                    <p>Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Reset Password</a>
                    </div>
                    <p>This link expires in <strong>1 hour</strong>.</p>
                    <hr>
                    <p style="font-size: 12px; color: #999;">CLMS - Computer Laboratory Management System</p>
                </div>
            `
        });
        
        console.log(`✅ Password reset email sent to ${user.email}`);
        
        res.status(200).json({
            success: true,
            message: 'If your email is registered, you will receive a password reset link.'
        });
        
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Failed to process request. Please try again.' });
    }
});

// ============================================
// RESET PASSWORD ENDPOINT
// ============================================
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: 'Token and new password are required' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }
        
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        const [users] = await pool.query(
            'SELECT id, email, name FROM users WHERE reset_password_token = ? AND reset_password_expiry > NOW() AND is_active = 1',
            [hashedToken]
        );
        
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }
        
        const user = users[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await pool.query(
            'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expiry = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );
        
        await sendEmail({
            to: user.email,
            subject: 'CLMS - Password Changed Successfully',
            html: `<h2>Password Changed Successfully</h2><p>Your password has been reset.</p>`
        });
        
        console.log(`✅ Password reset successful for ${user.email}`);
        
        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully.'
        });
        
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Failed to reset password.' });
    }
});

// ============================================
// VERIFY RESET TOKEN ENDPOINT
// ============================================
app.get('/api/auth/verify-reset-token/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is required' });
        }
        
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        const [users] = await pool.query(
            'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expiry > NOW() AND is_active = 1',
            [hashedToken]
        );
        
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }
        
        res.status(200).json({ success: true, message: 'Token is valid' });
        
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify token' });
    }
});
// ============================================
// USER MANAGEMENT ENDPOINTS
// ============================================

// Get all users - FIXED (using 'phone' column)
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.department,
    u.student_id as studentId,
    u.phone,
    u.profile_image,
    u.profile_image,
    u.is_active as is_active,
    u.last_login as lastLogin,
    u.created_at as createdAt
            FROM users u
            ORDER BY u.id DESC
        `);
        
        const users = rows.map(user => ({
            ...user,
            status: user.is_active === 1 ? 'active' : 'inactive',
            is_active: undefined
        }));
        
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// Get user roles
app.get('/api/users/roles', (req, res) => {
    res.json({
        success: true,
        data: [
            { value: 'admin', label: 'Admin', icon: '👑', description: 'Full system access' },
            { value: 'teacher', label: 'Teacher', icon: '👨‍🏫', description: 'Manage classes and attendance' },
            { value: 'student', label: 'Student', icon: '👨‍🎓', description: 'View schedules and attendance' },
            { value: 'lab_manager', label: 'Lab Manager', icon: '🔬', description: 'Manage laboratories' },
            { value: 'dean', label: 'Dean', icon: '📚', description: 'Department oversight' },
            { value: 'lab_assistant', label: 'Lab Assistant', icon: '🛠️', description: 'Assist in labs' },
            { value: 'ict', label: 'ICT', icon: '💻', description: 'Technical support' },
            { value: 'asset', label: 'Asset Manager', icon: '📦', description: 'Equipment management' }
        ]
    });
});

// Get user by ID - FIXED (using 'phone' column)
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await pool.query(`
            SELECT 
                u.id,
                u.email,
                u.name,
                u.role,
                u.department,
                u.student_id as studentId,
                u.phone,
    u.profile_image,
                u.is_active as is_active,
                u.last_login as lastLogin,
                u.created_at as createdAt
            FROM users u
            WHERE u.id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const user = rows[0];
        user.status = user.is_active === 1 ? 'active' : 'inactive';
        delete user.is_active;
        
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// ============================================
// CREATE NEW USER - FIXED
// ============================================
app.post('/api/users', protect, authorize('admin'), async (req, res) => {
    try {
        const { email, name, password, role, department, phone, studentId, profile_image } = req.body;
        
        console.log('📝 Creating user:', { email, name, role, department, phone, studentId });
        
        // Validate required fields
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }
        if (!password) {
            return res.status(400).json({ success: false, message: 'Password is required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }
        
        // Check if email already exists
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Map role to database format
        let dbRole = role;
        const roleMap = {
            'admin': 'admin', 'teacher': 'teacher', 'student': 'student',
            'lab_manager': 'lab_manager', 'lab-manager': 'lab_manager',
            'dean': 'dean', 'lab_assistant': 'lab_assistant',
            'lab-assistant': 'lab_assistant', 'ict': 'ict', 'asset': 'asset'
        };
        dbRole = roleMap[role] || role;
        
        // INSERT with profile_image
        const [result] = await pool.query(`
            INSERT INTO users (
                email,
                name,
                password,
                role,
                department,
                phone,
                student_id,
                profile_image,
                is_active,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
        `, [email, name, hashedPassword, dbRole, department || null, phone || null, studentId || null, profile_image || null]);
            profile_image || null,
            profile_image || null,
        
        console.log('✅ User created successfully! ID:', result.insertId);
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { id: result.insertId, email, name, role: dbRole, profile_image: profile_image || null }
        });
        
    } catch (error) {
        console.error('❌ Error creating user:', error);
        console.error('SQL Error:', error.sqlMessage);
        res.status(500).json({
            success: false,
            message: error.sqlMessage || error.message || 'Failed to create user'
        });
    }
});
// Update user - FIXED (using 'phone' column)
app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, department, role, status } = req.body;
        
        const isActive = status === 'active' ? 1 : 0;
        
        await pool.query(`
            UPDATE users 
            SET name = ?, email = ?, phone = ?, department = ?, role = ?, is_active = ?
            WHERE id = ?
        `, [name, email, phone || null, department || null, role, isActive, id]);
        
        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Prevent deleting admin users
        const [adminCheck] = await pool.query('SELECT role FROM users WHERE id = ?', [id]);
        if (adminCheck[0]?.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Cannot delete admin users' });
        }
        
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// ============================================
// PROFILE IMAGE UPLOAD ENDPOINTS
// ============================================

// Upload profile image
app.post('/api/users/profile-image', protect, async (req, res) => {
    try {
        const { imageData } = req.body; // Base64 image data
        const userId = req.user.id;
        
        if (!imageData) {
            return res.status(400).json({ success: false, message: 'Image data is required' });
        }
        
        // Save to database
        await pool.query(
            'UPDATE users SET profile_image = ? WHERE id = ?',
            [imageData, userId]
        );
        
        res.json({
            success: true,
            message: 'Profile image updated successfully',
            data: { profile_image: imageData }
        });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get user profile image (or any user's image with permission)
app.get('/api/users/:id/profile-image', protect, async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Check permission (users can view their own, admins can view all)
        if (req.user.role !== 'admin' && parseInt(userId) !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        
        const [rows] = await pool.query(
            'SELECT profile_image FROM users WHERE id = ?',
            [userId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({
            success: true,
            data: { profile_image: rows[0].profile_image }
        });
    } catch (error) {
        console.error('Error fetching profile image:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin: Update any user's profile image
app.put('/api/admin/users/:id/profile-image', protect, authorize('admin'), async (req, res) => {
    try {
        const userId = req.params.id;
        const { imageData } = req.body;
        
        await pool.query(
            'UPDATE users SET profile_image = ? WHERE id = ?',
            [imageData, userId]
        );
        
        res.json({
            success: true,
            message: 'User profile image updated successfully'
        });
    } catch (error) {
        console.error('Error updating user profile image:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Remove profile image
app.delete('/api/users/profile-image', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        
        await pool.query(
            'UPDATE users SET profile_image = NULL WHERE id = ?',
            [userId]
        );
        
        res.json({
            success: true,
            message: 'Profile image removed successfully'
        });
    } catch (error) {
        console.error('Error removing profile image:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// ============================================
// LABORATORIES ROUTES - Complete Version
// ============================================

// Get all laboratories
app.get('/api/laboratories', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                l.id,
                l.code,
                l.name,
                l.location,
                l.building,
                l.floor,
                l.capacity,
                l.computer_count,
                l.department,
                l.description,
                l.is_active as status,
                l.created_at,
                l.updated_at
            FROM laboratories l
            ORDER BY l.name
        `);
        
        // Transform is_active to status for frontend
        const transformedRows = rows.map(row => ({
            ...row,
            status: row.status ? 'active' : 'inactive'
        }));
        
        res.json({ success: true, data: transformedRows });
    } catch (error) {
        console.error('Error fetching laboratories:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch laboratories' });
    }
});

// Get single laboratory
app.get('/api/laboratories/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                l.id,
                l.code,
                l.name,
                l.location,
                l.building,
                l.floor,
                l.capacity,
                l.computer_count,
                l.department,
                l.description,
                l.is_active as status
            FROM laboratories l
            WHERE l.id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Laboratory not found' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching laboratory:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch laboratory' });
    }
});

// CREATE NEW LABORATORY - POST /api/laboratories
app.post('/api/laboratories', async (req, res) => {
    try {
        const { code, name, location, building, floor, capacity, department, description, status } = req.body;
        
        console.log('📝 Creating laboratory:', { code, name, building, capacity });
        
        // Validate required fields
        if (!code) {
            return res.status(400).json({ success: false, message: 'Laboratory code is required' });
        }
        if (!name) {
            return res.status(400).json({ success: false, message: 'Laboratory name is required' });
        }
        if (!capacity) {
            return res.status(400).json({ success: false, message: 'Capacity is required' });
        }
        
        // Check if code exists
        const [existing] = await pool.query('SELECT id FROM laboratories WHERE code = ?', [code]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Laboratory code already exists' });
        }
        
        // Convert status to is_active
        const isActive = status === 'active' ? 1 : 1; // Default to active
        
        // Insert new laboratory
        const [result] = await pool.query(`
            INSERT INTO laboratories (
                code, name, location, building, floor, capacity, department, description, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            code, 
            name, 
            location || '', 
            building || null, 
            floor || null, 
            capacity, 
            department || null, 
            description || null,
            isActive
        ]);
        
        console.log('✅ Laboratory created! ID:', result.insertId);
        
        res.status(201).json({
            success: true,
            message: 'Laboratory added successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating laboratory:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create laboratory',
            error: error.message 
        });
    }
});

// Update laboratory
app.put('/api/laboratories/:id', async (req, res) => {
    try {
        const { code, name, location, building, floor, capacity, department, description, status } = req.body;
        
        // Convert status to is_active
        const isActive = status === 'active' ? 1 : 0;
        
        const [result] = await pool.query(`
            UPDATE laboratories 
            SET code = ?, name = ?, location = ?, building = ?, 
                floor = ?, capacity = ?, department = ?, description = ?, is_active = ?
            WHERE id = ?
        `, [code, name, location, building, floor, capacity, department, description, isActive, req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Laboratory not found' });
        }
        
        res.json({ success: true, message: 'Laboratory updated successfully' });
    } catch (error) {
        console.error('Error updating laboratory:', error);
        res.status(500).json({ success: false, message: 'Failed to update laboratory' });
    }
});

// Delete laboratory
app.delete('/api/laboratories/:id', async (req, res) => {
    try {
        // Check if lab has computers
        const [computers] = await pool.query('SELECT id FROM computers WHERE laboratory_id = ? LIMIT 1', [req.params.id]);
        if (computers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete laboratory with assigned computers' 
            });
        }
        
        const [result] = await pool.query('DELETE FROM laboratories WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Laboratory not found' });
        }
        
        res.json({ success: true, message: 'Laboratory deleted successfully' });
    } catch (error) {
        console.error('Error deleting laboratory:', error);
        res.status(500).json({ success: false, message: 'Failed to delete laboratory' });
    }
});

// ============================================
// COMPUTERS ROUTES - Updated to match your table
// ============================================

app.get('/api/computers', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                c.id,
                c.code as asset_tag,
                c.workstation_number as name,
                c.model,
                c.serial_number,
                c.laboratory_id,
                c.processor,
                c.ram,
                c.storage,
                c.operating_system as os,
                c.ip_address,
                c.mac_address,
                c.status,
                c.purchase_date,
                c.warranty_expiry,
                c.notes,
                c.created_at,
                l.name as laboratory_name,
                l.code as laboratory_code
            FROM computers c
            LEFT JOIN laboratories l ON c.laboratory_id = l.id
            ORDER BY c.id DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching computers:', error);
        res.json({ success: true, data: [] });
    }
});


// Create new computer - FIXED for your database schema
app.post('/api/computers', async (req, res) => {
    try {
        const {
            asset_tag,      // maps to code in database
            name,           // maps to workstation_number
            model,
            serial_number,
            laboratory_id,
            processor,
            ram,
            storage,
            os,             // maps to operating_system
            ip_address,
            mac_address,
            status,
            purchase_date,
            warranty_expiry,
            notes
        } = req.body;

        console.log('Creating computer:', { asset_tag, name, model, laboratory_id });

        // Validate required fields
        if (!asset_tag) {
            return res.status(400).json({ success: false, message: 'Asset tag is required' });
        }
        if (!name) {
            return res.status(400).json({ success: false, message: 'Workstation number is required' });
        }
        if (!model) {
            return res.status(400).json({ success: false, message: 'Model is required' });
        }
        if (!laboratory_id) {
            return res.status(400).json({ success: false, message: 'Laboratory ID is required' });
        }

        // Check if code exists (using 'code' column, not 'asset_tag')
        const [existing] = await pool.query('SELECT id FROM computers WHERE code = ?', [asset_tag]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Asset tag already exists' });
        }

        // Insert computer - using correct column names
        const [result] = await pool.query(`
            INSERT INTO computers (
                code,
                workstation_number,
                model,
                serial_number,
                laboratory_id,
                processor,
                ram,
                storage,
                operating_system,
                ip_address,
                mac_address,
                status,
                purchase_date,
                warranty_expiry,
                notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            asset_tag,
            name,
            model,
            serial_number || null,
            laboratory_id,
            processor || null,
            ram || null,
            storage || null,
            os || null,
            ip_address || null,
            mac_address || null,
            status || 'active',
            purchase_date || null,
            warranty_expiry || null,
            notes || null
        ]);

        // Update computer count in laboratory
        await pool.query('UPDATE laboratories SET computer_count = computer_count + 1 WHERE id = ?', [laboratory_id]);

        console.log('✅ Computer created! ID:', result.insertId);

        res.status(201).json({
            success: true,
            message: 'Computer added successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating computer:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create computer',
            error: error.message 
        });
    }
});

// Update computer
app.put('/api/computers/:id', async (req, res) => {
    try {
        const {
            asset_tag,
            name,
            model,
            serial_number,
            laboratory_id,
            processor,
            ram,
            storage,
            os,
            ip_address,
            mac_address,
            status,
            purchase_date,
            warranty_expiry,
            notes
        } = req.body;

        const [result] = await pool.query(`
            UPDATE computers 
            SET code = ?, workstation_number = ?, model = ?, serial_number = ?, laboratory_id = ?,
                processor = ?, ram = ?, storage = ?, operating_system = ?, 
                ip_address = ?, mac_address = ?, status = ?, 
                purchase_date = ?, warranty_expiry = ?, notes = ?
            WHERE id = ?
        `, [
            asset_tag, name, model, serial_number, laboratory_id,
            processor, ram, storage, os,
            ip_address, mac_address, status,
            purchase_date, warranty_expiry, notes, req.params.id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Computer not found' });
        }

        res.json({ success: true, message: 'Computer updated successfully' });
    } catch (error) {
        console.error('Error updating computer:', error);
        res.status(500).json({ success: false, message: 'Failed to update computer' });
    }
});

// Delete computer
app.delete('/api/computers/:id', async (req, res) => {
    try {
        const [computer] = await pool.query('SELECT laboratory_id FROM computers WHERE id = ?', [req.params.id]);
        const labId = computer[0]?.laboratory_id;

        const [result] = await pool.query('DELETE FROM computers WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Computer not found' });
        }

        // Update computer count in laboratory
        if (labId) {
            await pool.query('UPDATE laboratories SET computer_count = computer_count - 1 WHERE id = ?', [labId]);
        }

        res.json({ success: true, message: 'Computer deleted successfully' });
    } catch (error) {
        console.error('Error deleting computer:', error);
        res.status(500).json({ success: false, message: 'Failed to delete computer' });
    }
});

// Dashboard stats
app.get('/api/dashboard/admin/stats', async (req, res) => {
    try {
        const [userCount] = await pool.query('SELECT COUNT(*) as total FROM users');
        const [computerCount] = await pool.query('SELECT COUNT(*) as total FROM computers');
        const [labCount] = await pool.query('SELECT COUNT(*) as total FROM laboratories WHERE is_active = 1');
        
        res.json({
            success: true,
            data: {
                totalUsers: userCount[0].total,
                totalComputers: computerCount[0].total,
                activeLabs: labCount[0].total,
                maintenanceRequests: 0
            }
        });
    } catch (error) {
        res.json({ success: true, data: { totalUsers: 0, totalComputers: 0, activeLabs: 0 } });
    }
});

// ============================================
// COMPLETE SCHEDULES ROUTES
// ============================================



app.post('/api/schedules', async (req, res) => {
    try {
        const {
            title,
            courseId,
            course_name,
            labId,
            laboratory_id,
            date,
            start_time,
            end_time,
            expected_students,
            students,
            batch_name,
            notes,
            description
        } = req.body;
        
        // Get requester_id from token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized. Please login first.' 
            });
        }
        
        let requesterId;
        try {
            const decoded = jwt.verify(token, 'secret-key');
            requesterId = decoded.id;
        } catch (error) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token. Please login again.' 
            });
        }
        
        // Map frontend field names to database column names
        const courseName = course_name || title;
        const labIdValue = labId || laboratory_id;
        const startDateTime = `${date} ${startTime || start_time}:00`;
        const endDateTime = `${date} ${endTime || end_time}:00`;
        const studentCount = expected_students || students || 0;
        const batchName = batch_name || null;
        const notesText = notes || description || null;
        
        console.log('📝 Creating schedule:', { 
            courseName, 
            labIdValue, 
            startDateTime, 
            requesterId 
        });
        
        // Validate required fields
        if (!courseName) {
            return res.status(400).json({ 
                success: false, 
                message: 'Course name is required' 
            });
        }
        if (!labIdValue) {
            return res.status(400).json({ 
                success: false, 
                message: 'Laboratory ID is required' 
            });
        }
        if (!date) {
            return res.status(400).json({ 
                success: false, 
                message: 'Date is required' 
            });
        }
        if (!startDateTime) {
            return res.status(400).json({ 
                success: false, 
                message: 'Start time is required' 
            });
        }
        if (!endDateTime) {
            return res.status(400).json({ 
                success: false, 
                message: 'End time is required' 
            });
        }
        
        // Insert into database
        const [result] = await pool.query(`
            INSERT INTO schedules (
                course_name, 
                laboratory_id, 
                requester_id, 
                start_time, 
                end_time, 
                expected_students, 
                batch_name, 
                notes, 
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `, [
            courseName,
            labIdValue,
            requesterId,
            startDateTime,
            endDateTime,
            studentCount,
            batchName,
            notesText
        ]);
        
        console.log('✅ Schedule created! ID:', result.insertId);
        
        res.status(201).json({
            success: true,
            message: 'Schedule created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create schedule',
            error: error.message 
        });
    }
});


app.post('/api/schedules/batch', async (req, res) => {
    try {
        const { 
            batchName, 
            courses, 
            labPreferences, 
            startDate, 
            endDate, 
            daysOfWeek, 
            timeSlots 
        } = req.body;
        
        console.log('Batch schedule request:', { batchName, courses, startDate, endDate, daysOfWeek, timeSlots });
        
        // Get token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        
        let requesterId;
        try {
            const decoded = jwt.verify(token, 'secret-key');
            requesterId = decoded.id;
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        
        // Validate required fields
        if (!batchName) {
            return res.status(400).json({ success: false, message: 'Batch name is required' });
        }
        if (!courses || !Array.isArray(courses) || courses.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one course is required' });
        }
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Start and end dates are required' });
        }
        
        // Parse dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Day mapping
        const dayMap = {
            'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
            'Thursday': 4, 'Friday': 5, 'Saturday': 6
        };
        
        // Get selected days (default: Monday to Friday)
        const selectedDays = (daysOfWeek && daysOfWeek.length > 0) 
            ? daysOfWeek.map(day => dayMap[day]).filter(d => d !== undefined)
            : [1, 2, 3, 4, 5];
        
        // Generate all dates between start and end
        const scheduleDates = [];
        const currentDate = new Date(start);
        
        while (currentDate <= end) {
            const dayOfWeek = currentDate.getDay();
            if (selectedDays.includes(dayOfWeek)) {
                scheduleDates.push(new Date(currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        console.log(`Found ${scheduleDates.length} dates to schedule`);
        
        if (scheduleDates.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: `No dates found between ${startDate} and ${endDate} for selected days` 
            });
        }
        
        // Default lab preferences
        const labList = labPreferences && labPreferences.length > 0 ? labPreferences : [1];
        
        // Default time slots
        const slotList = timeSlots && timeSlots.length > 0 ? timeSlots : ['08:00-10:00', '10:00-12:00', '13:00-15:00'];
        
        let schedulesCreated = 0;
        
        for (const course of courses) {
            for (const date of scheduleDates) {
                for (const labId of labList) {
                    for (const timeSlot of slotList) {
                        const [startTime, endTime] = timeSlot.split('-');
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const startDateTime = `${year}-${month}-${day} ${startTime}:00`;
                        const endDateTime = `${year}-${month}-${day} ${endTime}:00`;
                        
                        await pool.query(`
                            INSERT INTO schedules (
                                course_name, 
                                laboratory_id, 
                                requester_id, 
                                start_time, 
                                end_time, 
                                expected_students, 
                                batch_name, 
                                status
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
                        `, [course, labId, requesterId, startDateTime, endDateTime, 30, batchName]);
                        
                        schedulesCreated++;
                    }
                }
            }
        }
        
        res.status(201).json({ 
            success: true, 
            message: `Batch schedule created! ${schedulesCreated} sessions scheduled.`,
            data: { count: schedulesCreated, dates: scheduleDates.length }
        });
        
    } catch (error) {
        console.error('Batch schedule error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create batch schedule', 
            error: error.message 
        });
    }
});
// Get all schedules with filters
app.get('/api/schedules', async (req, res) => {
    try {
        const { startDate, endDate, lab, status } = req.query;
        
        let query = `
            SELECT 
                s.id,
                s.course_name as title,
                s.laboratory_id,
                l.name as lab,
                l.code as lab_code,
                s.requester_id,
                u.name as instructor,
                s.start_time,
                s.end_time,
                s.expected_students as students,
                s.batch_name as batch,
                s.status,
                s.notes as description,
                s.created_at,
                DATE(s.start_time) as date,
                TIME(s.start_time) as startTime,
                TIME(s.end_time) as endTime
            FROM schedules s
            LEFT JOIN laboratories l ON s.laboratory_id = l.id
            LEFT JOIN users u ON s.requester_id = u.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (startDate) {
            query += ` AND DATE(s.start_time) >= ?`;
            params.push(startDate);
        }
        
        if (endDate) {
            query += ` AND DATE(s.start_time) <= ?`;
            params.push(endDate);
        }
        
        if (lab && lab !== 'undefined' && lab !== 'all') {
            query += ` AND s.laboratory_id = ?`;
            params.push(lab);
        }
        
        if (status && status !== 'undefined' && status !== 'all') {
            query += ` AND s.status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY s.start_time ASC`;
        
        const [rows] = await pool.query(query, params);
        
        const transformedRows = rows.map(row => ({
            id: row.id,
            title: row.title,
            lab: row.lab,
            lab_id: row.laboratory_id,
            date: row.date ? row.date.toISOString().split('T')[0] : null,
            startTime: row.startTime ? row.startTime.slice(0, 5) : null,
            endTime: row.endTime ? row.endTime.slice(0, 5) : null,
            instructor: row.instructor,
            students: row.students,
            batch: row.batch,
            status: row.status,
            description: row.description,
            start_datetime: row.start_time,
            end_datetime: row.end_time
        }));
        
        res.json({ success: true, data: transformedRows });
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch schedules' });
    }
});

// Get my schedules (for current user)
app.get('/api/schedules/my-schedules', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const decoded = jwt.verify(token, 'secret-key');
        const userId = decoded.id;
        
        const [rows] = await pool.query(`
            SELECT 
                s.id,
                s.course_name as title,
                l.name as lab,
                s.start_time,
                s.end_time,
                s.expected_students as students,
                s.status,
                DATE(s.start_time) as date,
                TIME(s.start_time) as startTime,
                TIME(s.end_time) as endTime
            FROM schedules s
            LEFT JOIN laboratories l ON s.laboratory_id = l.id
            WHERE s.requester_id = ?
            ORDER BY s.start_time DESC
        `, [userId]);
        
        const transformedRows = rows.map(row => ({
            id: row.id,
            title: row.title,
            lab: row.lab,
            date: row.date ? row.date.toISOString().split('T')[0] : null,
            startTime: row.startTime ? row.startTime.slice(0, 5) : null,
            endTime: row.endTime ? row.endTime.slice(0, 5) : null,
            students: row.students,
            status: row.status
        }));
        
        res.json({ success: true, data: transformedRows });
    } catch (error) {
        console.error('Error fetching my schedules:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch schedules' });
    }
});


// Cancel schedule
app.patch('/api/schedules/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        await pool.query(`
            UPDATE schedules 
            SET status = 'cancelled', notes = CONCAT(notes, ' Cancelled: ', ?)
            WHERE id = ?
        `, [reason || 'Cancelled by user', id]);
        
        res.json({ success: true, message: 'Schedule cancelled' });
    } catch (error) {
        console.error('Error cancelling schedule:', error);
        res.status(500).json({ success: false, message: 'Failed to cancel schedule' });
    }
});

// Check availability
app.get('/api/schedules/check-availability', async (req, res) => {
    try {
        const { lab_id, date, start_time, end_time } = req.query;
        
        const [conflicts] = await pool.query(`
            SELECT 
                s.id,
                s.course_name as title,
                DATE(s.start_time) as date,
                TIME(s.start_time) as startTime,
                TIME(s.end_time) as endTime
            FROM schedules s
            WHERE s.laboratory_id = ? 
                AND DATE(s.start_time) = ?
                AND s.status IN ('pending', 'approved')
                AND (
                    (TIME(s.start_time) <= ? AND TIME(s.end_time) > ?) OR
                    (TIME(s.start_time) < ? AND TIME(s.end_time) >= ?) OR
                    (TIME(s.start_time) >= ? AND TIME(s.end_time) <= ?)
                )
        `, [lab_id, date, end_time, start_time, end_time, start_time, start_time, end_time]);
        
        if (conflicts.length > 0) {
            res.json({ 
                success: true, 
                available: false, 
                conflicts: conflicts.map(c => ({
                    title: c.title,
                    date: c.date,
                    startTime: c.startTime,
                    endTime: c.endTime
                }))
            });
        } else {
            res.json({ success: true, available: true, conflicts: [] });
        }
    } catch (error) {
        console.error('Error checking availability:', error);
        res.json({ success: true, available: true, conflicts: [] });
    }
});


// ============================================
// GET COURSES - GET /api/courses
// ============================================
app.get('/api/courses', async (req, res) => {
    try {
        // Return sample courses - you can replace with database query
        const courses = [
            { id: 1, name: 'Database Systems', code: 'CS311' },
            { id: 2, name: 'Computer Networks', code: 'CS312' },
            { id: 3, name: 'Software Engineering', code: 'CS313' },
            { id: 4, name: 'Web Development', code: 'CS314' },
            { id: 5, name: 'Data Structures', code: 'CS215' },
            { id: 6, name: 'Operating Systems', code: 'CS316' },
            { id: 7, name: 'C++ Programming', code: 'CS201' },
            { id: 8, name: 'Java Programming', code: 'CS202' }
        ];
        res.json({ success: true, data: courses });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch courses' });
    }
});

// Get batches (for dropdown)
app.get('/api/batches', async (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, name: 'CS 3rd Year - Batch A', semester: '1st Semester' },
            { id: 2, name: 'CS 3rd Year - Batch B', semester: '1st Semester' },
            { id: 3, name: 'CS 4th Year - Batch A', semester: '2nd Semester' },
            { id: 4, name: 'CS 4th Year - Batch B', semester: '2nd Semester' }
        ]
    });
});

// Batch create schedules
app.post('/api/schedules/batch', async (req, res) => {
    try {
        const { batchName, semester, courses, labPreferences, startDate, endDate, daysOfWeek, timeSlots } = req.body;
        
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const decoded = jwt.verify(token, 'secret-key');
        const requesterId = decoded.id;
        
        // Parse dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Get all dates between start and end for specified days of week
        const scheduleDates = [];
        const dayMap = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5 };
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            if (daysOfWeek.includes(dayName)) {
                scheduleDates.push(new Date(d));
            }
        }
        
        // Create schedules for each course, date, and time slot
        let schedulesCreated = 0;
        
        for (const course of courses) {
            for (const date of scheduleDates) {
                for (const labId of labPreferences) {
                    for (const timeSlot of timeSlots) {
                        const [startTime, endTime] = timeSlot.split('-');
                        
                        await pool.query(`
                            INSERT INTO schedules (
                                course_name, laboratory_id, requester_id, 
                                start_time, end_time, expected_students, batch_name, status
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
                        `, [
                            course, labId, requesterId,
                            `${date.toISOString().split('T')[0]} ${startTime}:00`,
                            `${date.toISOString().split('T')[0]} ${endTime}:00`,
                            30, batchName
                        ]);
                        schedulesCreated++;
                    }
                }
            }
        }
        
        res.json({ 
            success: true, 
            message: `Batch schedule created: ${schedulesCreated} sessions`,
            data: { count: schedulesCreated }
        });
    } catch (error) {
        console.error('Error creating batch schedule:', error);
        res.status(500).json({ success: false, message: 'Failed to create batch schedule' });
    }
});

// Export schedules as iCal/CSV
app.get('/api/schedules/export', async (req, res) => {
    try {
        const { format = 'csv' } = req.query;
        
        const [rows] = await pool.query(`
            SELECT 
                s.id,
                s.course_name as title,
                l.name as location,
                s.notes as description,
                s.start_time,
                s.end_time,
                s.status,
                u.name as instructor
            FROM schedules s
            LEFT JOIN laboratories l ON s.laboratory_id = l.id
            LEFT JOIN users u ON s.requester_id = u.id
            WHERE s.status = 'approved'
            ORDER BY s.start_time ASC
        `);
        
        if (format === 'csv') {
            // CSV Export
            let csv = 'ID,Title,Location,Instructor,Start Date,End Date,Status,Description\n';
            
            for (const row of rows) {
                csv += `${row.id},`;
                csv += `"${(row.title || '').replace(/"/g, '""')}",`;
                csv += `"${(row.location || '').replace(/"/g, '""')}",`;
                csv += `"${(row.instructor || '').replace(/"/g, '""')}",`;
                csv += `${new Date(row.start_time).toISOString()},`;
                csv += `${new Date(row.end_time).toISOString()},`;
                csv += `${row.status},`;
                csv += `"${(row.description || '').replace(/"/g, '""')}"\n`;
            }
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="schedules_export_${Date.now()}.csv"`);
            res.send(csv);
        } else {
            // iCal Export
            let ical = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CLMS//Injibara University//EN\n`;
            
            for (const event of rows) {
                const startDate = new Date(event.start_time);
                const endDate = new Date(event.end_time);
                
                ical += `BEGIN:VEVENT\n`;
                ical += `UID:${event.id}@clms.com\n`;
                ical += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
                ical += `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
                ical += `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
                ical += `SUMMARY:${event.title}\n`;
                ical += `LOCATION:${event.location || 'Injibara University Lab'}\n`;
                if (event.description) ical += `DESCRIPTION:${event.description}\n`;
                ical += `END:VEVENT\n`;
            }
            
            ical += `END:VCALENDAR`;
            
            res.setHeader('Content-Type', 'text/calendar');
            res.setHeader('Content-Disposition', `attachment; filename="schedule_calendar_${Date.now()}.ics"`);
            res.send(ical);
        }
    } catch (error) {
        console.error('Error exporting schedules:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// ============================================
// MAINTENANCE ROUTES - WORKING VERSION
// ============================================


app.get('/api/maintenance/export', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                id,
                issue_type,
                priority,
                status,
                description,
                resolution,
                created_at,
                completed_at
            FROM maintenance_requests
            ORDER BY id DESC
        `);
        
        let csv = 'ID,Issue Type,Priority,Status,Description,Resolution,Created At,Completed At\n';
        
        for (const row of rows) {
            csv += `${row.id},`;
            csv += `"${(row.issue_type || '').replace(/"/g, '""')}",`;
            csv += `${row.priority},`;
            csv += `${row.status},`;
            csv += `"${(row.description || '').replace(/"/g, '""')}",`;
            csv += `"${(row.resolution || '').replace(/"/g, '""')}",`;
            csv += `${row.created_at},`;
            csv += `${row.completed_at || ''}\n`;
        }
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="maintenance_requests.csv"');
        res.send(csv);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).send('Error exporting data');
    }
});

// Get maintenance statistics (role-based)
app.get('/api/maintenance/statistics', protect, async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id;
        
        let query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
                SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as inProgress,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
            FROM maintenance_requests
        `;
        
        // Role-based filtering
        if (userRole === 'student' || userRole === 'teacher') {
            query += ` WHERE requester_id = ${userId}`;
        } else if (userRole === 'lab_manager') {
            query += ` WHERE laboratory_id IN (SELECT id FROM laboratories WHERE manager_id = ${userId} OR 1=1)`;
        }
        
        const [stats] = await pool.query(query);
        
        res.json({ success: true, data: stats[0] });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all maintenance requests (with role-based filtering) - CORRECTED COLUMN NAMES
app.get('/api/maintenance', protect, async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id;
        
        let query = `
            SELECT 
                m.id,
                m.title,
                m.issue_type,
                m.description,
                m.priority,
                m.status,
                m.computer_id,
                c.code as computer_code,
                c.workstation_number as computer_name,
                m.laboratory_id,
                l.name as laboratory_name,
                m.requester_id,
                u.name as requester_name,
                m.assignee_id,
                a.name as assignee_name,
                m.resolution,
                m.parts_used,
                m.time_spent,
                m.completed_at,
                m.created_at,
                m.updated_at
            FROM maintenance_requests m
            LEFT JOIN computers c ON m.computer_id = c.id
            LEFT JOIN laboratories l ON m.laboratory_id = l.id
            LEFT JOIN users u ON m.requester_id = u.id
            LEFT JOIN users a ON m.assignee_id = a.id
            WHERE 1=1
        `;
        
        const params = [];
        
        // Role-based filtering
        if (userRole === 'student' || userRole === 'teacher') {
            query += ` AND m.requester_id = ?`;
            params.push(userId);
        } else if (userRole === 'lab_manager') {
            query += ` AND m.laboratory_id IN (SELECT id FROM laboratories WHERE 1=1)`;
        }
        
        // Apply status filter if provided
        const { status, priority } = req.query;
        if (status && status !== 'all' && status !== 'undefined') {
            query += ` AND m.status = ?`;
            params.push(status);
        }
        if (priority && priority !== 'all' && priority !== 'undefined') {
            query += ` AND m.priority = ?`;
            params.push(priority);
        }
        
        // Apply limit if provided
        const { limit } = req.query;
        if (limit && limit !== 'undefined') {
            query += ` LIMIT ?`;
            params.push(parseInt(limit));
        } else {
            query += ` ORDER BY 
                CASE m.priority 
                    WHEN 'high' THEN 1 
                    WHEN 'medium' THEN 2 
                    WHEN 'low' THEN 3 
                    ELSE 4 
                END ASC,
                m.created_at DESC`;
        }
        
        const [rows] = await pool.query(query, params);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching maintenance requests:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/maintenance/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;
        const userId = req.user.id;
        
        const [rows] = await pool.query(`
            SELECT 
                m.*,
                c.name as computer_name,
                l.name as laboratory_name,
                u.name as requester_name,
                a.name as assignee_name
            FROM maintenance_requests m
            LEFT JOIN computers c ON m.computer_id = c.id
            LEFT JOIN laboratories l ON m.laboratory_id = l.id
            LEFT JOIN users u ON m.requester_id = u.id
            LEFT JOIN users a ON m.assignee_id = a.id
            WHERE m.id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        
        const request = rows[0];
        
        // Role-based access check
        const isRequester = request.requester_id === userId;
        const isAssignee = request.assignee_id === userId;
        const isAdmin = userRole === 'admin';
        const isICT = userRole === 'ict';
        const isLabManager = userRole === 'lab_manager';
        
        if (!isRequester && !isAssignee && !isAdmin && !isICT && !isLabManager) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        
        res.json({ success: true, data: request });
    } catch (error) {
        console.error('Error fetching maintenance request:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new maintenance request (Students, Teachers, Lab Managers)
app.post('/api/maintenance', protect, async (req, res) => {
    try {
        const { title, issue_type, description, priority, computer_id, laboratory_id } = req.body;
        const requesterId = req.user.id;
        
        // Validate required fields
        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Title and description are required' });
        }
        
        // Determine issue type if not provided
        let finalIssueType = issue_type || 'other';
        if (!issue_type) {
            const lowerTitle = title.toLowerCase();
            if (lowerTitle.includes('hardware') || lowerTitle.includes('screen') || lowerTitle.includes('boot')) {
                finalIssueType = 'hardware';
            } else if (lowerTitle.includes('software') || lowerTitle.includes('app')) {
                finalIssueType = 'software';
            } else if (lowerTitle.includes('network') || lowerTitle.includes('wifi')) {
                finalIssueType = 'network';
            }
        }
        
        const [result] = await pool.query(`
            INSERT INTO maintenance_requests (
                title, issue_type, description, priority, computer_id, 
                laboratory_id, requester_id, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', NOW())
        `, [title, finalIssueType, description, priority || 'medium', computer_id || null, laboratory_id || null, requesterId]);
        
        res.status(201).json({ 
            success: true, 
            message: 'Maintenance request submitted successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// Create new maintenance request - FIXED for your actual table structure
app.post('/api/maintenance', async (req, res) => {
    try {
        const { title, description, priority, computer_id, laboratory_id } = req.body;
        
        console.log('========================================');
        console.log('Received maintenance request data:');
        console.log('  title:', title);
        console.log('  description:', description);
        console.log('  priority:', priority);
        console.log('  computer_id:', computer_id);
        console.log('  laboratory_id:', laboratory_id);
        console.log('========================================');
        
        // Get requester_id from token
        const token = req.headers.authorization?.split(' ')[1];
        let requesterId = null;
        
        if (token) {
            try {
                const decoded = jwt.verify(token, 'secret-key');
                requesterId = decoded.id;
                console.log('  requester_id from token:', requesterId);
            } catch (err) {
                console.error('Token verification failed:', err.message);
            }
        }
        
        if (!requesterId) {
            requesterId = 4;
        }
        
        // Validate required fields
        if (!title) {
            return res.status(400).json({ 
                success: false, 
                message: 'Title is required' 
            });
        }
        
        if (!description) {
            return res.status(400).json({ 
                success: false, 
                message: 'Description is required' 
            });
        }
        
        // Map priority (your table uses 'critical' not 'urgent')
        let mappedPriority = priority || 'medium';
        if (mappedPriority === 'urgent') mappedPriority = 'critical';
        
        // Map issue_type based on title/description
        let issueType = 'other';
        const lowerTitle = (title || '').toLowerCase();
        const lowerDesc = (description || '').toLowerCase();
        
        if (lowerTitle.includes('hardware') || lowerDesc.includes('hardware') || 
            lowerTitle.includes('screen') || lowerDesc.includes('screen') ||
            lowerTitle.includes('boot') || lowerDesc.includes('boot')) {
            issueType = 'hardware';
        } else if (lowerTitle.includes('software') || lowerDesc.includes('software') ||
                   lowerTitle.includes('app') || lowerDesc.includes('app')) {
            issueType = 'software';
        } else if (lowerTitle.includes('network') || lowerDesc.includes('network') ||
                   lowerTitle.includes('wifi') || lowerDesc.includes('wifi')) {
            issueType = 'network';
        } else if (lowerTitle.includes('peripheral') || lowerDesc.includes('peripheral')) {
            issueType = 'peripheral';
        }
        
        // Handle IDs - convert to null if undefined
        const computerIdValue = (computer_id && computer_id !== 'undefined' && computer_id !== 'null') ? computer_id : null;
        const laboratoryIdValue = (laboratory_id && laboratory_id !== 'undefined' && laboratory_id !== 'null') ? laboratory_id : null;
        
        // Insert into database - USING YOUR ACTUAL COLUMN NAMES
        const [result] = await pool.query(`
            INSERT INTO maintenance_requests (
                title,
                issue_type,
                description, 
                priority, 
                computer_id, 
                laboratory_id, 
                requester_id, 
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted')
        `, [title, issueType, description, mappedPriority, computerIdValue, laboratoryIdValue, requesterId]);
        
        console.log('✅ Maintenance request created! ID:', result.insertId);
        console.log('========================================\n');
        
        res.status(201).json({
            success: true,
            message: 'Maintenance request created successfully',
            data: { id: result.insertId }
        });
        
    } catch (error) {
        console.error('❌ Error creating maintenance request:', error);
        console.error('  Error message:', error.message);
        console.error('========================================\n');
        
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create maintenance request',
            error: error.message
        });
    }
});

// Update maintenance request (ICT, Admin, Assignee)
app.put('/api/maintenance/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolution, parts_used, time_spent, assignee_id } = req.body;
        const userRole = req.user.role;
        const userId = req.user.id;
        
        // Get current request
        const [requests] = await pool.query('SELECT * FROM maintenance_requests WHERE id = ?', [id]);
        if (requests.length === 0) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        
        const request = requests[0];
        
        // Check permissions
        const isICT = userRole === 'ict';
        const isAdmin = userRole === 'admin';
        const isAssignee = request.assignee_id === userId;
        const isRequester = request.requester_id === userId;
        
        let updateFields = [];
        let values = [];
        
        // Status update (ICT, Admin, Assignee)
        if (status && (isICT || isAdmin || isAssignee)) {
            updateFields.push('status = ?');
            values.push(status);
            if (status === 'completed') {
                updateFields.push('completed_at = NOW()');
            }
        }
        
        // Resolution notes (ICT, Admin, Assignee)
        if (resolution && (isICT || isAdmin || isAssignee)) {
            updateFields.push('resolution = ?');
            values.push(resolution);
        }
        
        // Parts used (ICT, Admin, Assignee)
        if (parts_used && (isICT || isAdmin || isAssignee)) {
            updateFields.push('parts_used = ?');
            values.push(parts_used);
        }
        
        // Time spent (ICT, Admin, Assignee)
        if (time_spent && (isICT || isAdmin || isAssignee)) {
            updateFields.push('time_spent = ?');
            values.push(time_spent);
        }
        
        // Assign technician (ICT, Admin only)
        if (assignee_id && (isICT || isAdmin)) {
            updateFields.push('assignee_id = ?');
            values.push(assignee_id);
            if (!status) {
                updateFields.push('status = ?');
                values.push('in-progress');
            }
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }
        
        updateFields.push('updated_at = NOW()');
        values.push(id);
        
        await pool.query(`UPDATE maintenance_requests SET ${updateFields.join(', ')} WHERE id = ?`, values);
        
        res.json({ success: true, message: 'Request updated successfully' });
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Assign technician (ICT, Admin only)
app.patch('/api/maintenance/:id/assign', protect, authorize('ict', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { assignee_id } = req.body;
        
        await pool.query(`
            UPDATE maintenance_requests 
            SET assignee_id = ?, status = 'in-progress', updated_at = NOW()
            WHERE id = ?
        `, [assignee_id, id]);
        
        res.json({ success: true, message: 'Technician assigned successfully' });
    } catch (error) {
        console.error('Error assigning technician:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start maintenance (change status to in-progress)
app.patch('/api/maintenance/:id/start', async (req, res) => {
    try {
        await pool.query(`
            UPDATE maintenance_requests 
            SET status = 'in-progress'
            WHERE id = ?
        `, [req.params.id]);
        
        res.json({ success: true, message: 'Maintenance started' });
    } catch (error) {
        console.error('Error starting maintenance:', error);
        res.status(500).json({ success: false, message: 'Failed to start maintenance' });
    }
});

// Complete maintenance request (ICT, Admin, Assignee)
app.patch('/api/maintenance/:id/complete', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { resolution, parts_used, time_spent } = req.body;
        
        await pool.query(`
            UPDATE maintenance_requests 
            SET status = 'completed', 
                resolution = ?, 
                parts_used = ?, 
                time_spent = ?,
                completed_at = NOW(),
                updated_at = NOW()
            WHERE id = ?
        `, [resolution || null, parts_used || null, time_spent || null, id]);
        
        res.json({ success: true, message: 'Request completed successfully' });
    } catch (error) {
        console.error('Error completing request:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Cancel maintenance request (Requester, ICT, Admin)
app.patch('/api/maintenance/:id/cancel', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Check if user can cancel
        const [requests] = await pool.query('SELECT requester_id FROM maintenance_requests WHERE id = ?', [id]);
        if (requests.length === 0) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        
        const isRequester = requests[0].requester_id === userId;
        const isICT = userRole === 'ict';
        const isAdmin = userRole === 'admin';
        
        if (!isRequester && !isICT && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel this request' });
        }
        
        await pool.query(`
            UPDATE maintenance_requests 
            SET status = 'cancelled', 
                resolution = ?,
                updated_at = NOW()
            WHERE id = ?
        `, [reason || 'Cancelled by user', id]);
        
        res.json({ success: true, message: 'Request cancelled' });
    } catch (error) {
        console.error('Error cancelling request:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// ============================================
// ATTENDANCE ROUTES - Matching existing table
// ============================================



// Get attendance sessions for teacher/lab assistant
app.get('/sessions', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { date, status } = req.query;
        
        let query = `
            SELECT 
                asess.*,
                labs.name as lab_name,
                courses.course_name,
                u.name as instructor_name,
                CONCAT(u2.name, ' (Assistant)') as assistant_name
            FROM attendance_sessions asess
            LEFT JOIN schedules s ON asess.schedule_id = s.id
            LEFT JOIN laboratories labs ON s.lab_id = labs.id
            LEFT JOIN courses ON s.course_id = courses.id
            LEFT JOIN users u ON asess.instructor_id = u.id
            LEFT JOIN users u2 ON asess.lab_assistant_id = u2.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (userRole === 'teacher') {
            query += ` AND asess.instructor_id = ?`;
            params.push(userId);
        } else if (userRole === 'lab_assistant') {
            query += ` AND (asess.lab_assistant_id = ? OR asess.lab_assistant_id IS NULL)`;
            params.push(userId);
        }
        
        if (date) {
            query += ` AND asess.date = ?`;
            params.push(date);
        }
        
        if (status) {
            query += ` AND asess.status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY asess.date DESC, asess.start_time ASC`;
        
        const [sessions] = await req.pool.query(query, params);
        
        res.json({
            success: true,
            data: sessions
        });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create attendance session (Teacher only)
app.post('/sessions', protect, authorize('teacher'), async (req, res) => {
    try {
        const { schedule_id, date, start_time, end_time, course_code } = req.body;
        
        // Generate unique session code
        const session_code = `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        
        const [result] = await req.pool.query(`
            INSERT INTO attendance_sessions 
            (session_code, schedule_id, course_code, instructor_id, date, start_time, end_time, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
        `, [session_code, schedule_id, course_code, req.user.id, date, start_time, end_time, req.user.id]);
        
        res.status(201).json({
            success: true,
            message: 'Attendance session created',
            data: { id: result.insertId, session_code }
        });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start attendance session
app.put('/sessions/:id/start', protect, async (req, res) => {
    try {
        const sessionId = req.params.id;
        
        await req.pool.query(`
            UPDATE attendance_sessions 
            SET status = 'active', updated_at = NOW()
            WHERE id = ?
        `, [sessionId]);
        
        res.json({
            success: true,
            message: 'Attendance session started'
        });
    } catch (error) {
        console.error('Error starting session:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark attendance (Teacher or assigned Lab Assistant)
app.post('/mark', protect, async (req, res) => {
    try {
        const { session_id, student_id, status, computer_id, remarks } = req.body;
        const userId = req.user.id;
        const currentTime = new Date().toTimeString().split(' ')[0];
        
        // Check if user is authorized for this session
        const [session] = await req.pool.query(`
            SELECT instructor_id, lab_assistant_id FROM attendance_sessions WHERE id = ?
        `, [session_id]);
        
        if (session.length === 0) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        
        const isAuthorized = session[0].instructor_id === userId || session[0].lab_assistant_id === userId;
        
        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'Not authorized for this session' });
        }
        
        // Check if record exists
        const [existing] = await req.pool.query(
            'SELECT id FROM attendance_records WHERE session_id = ? AND student_id = ?',
            [session_id, student_id]
        );
        
        if (existing.length > 0) {
            // Update existing
            await req.pool.query(`
                UPDATE attendance_records 
                SET status = ?, computer_id = ?, marked_by = ?, remarks = ?, updated_at = NOW()
                WHERE session_id = ? AND student_id = ?
            `, [status, computer_id || null, userId, remarks || null, session_id, student_id]);
        } else {
            // Insert new
            await req.pool.query(`
                INSERT INTO attendance_records 
                (session_id, student_id, computer_id, status, check_in_time, marked_by, remarks)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [session_id, student_id, computer_id || null, status, currentTime, userId, remarks || null]);
        }
        
        res.json({
            success: true,
            message: 'Attendance marked successfully'
        });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Bulk mark attendance
app.post('/mark/bulk', protect, async (req, res) => {
    try {
        const { session_id, student_ids, status } = req.body;
        const userId = req.user.id;
        const currentTime = new Date().toTimeString().split(' ')[0];
        
        // Verify authorization
        const [session] = await req.pool.query(`
            SELECT instructor_id, lab_assistant_id FROM attendance_sessions WHERE id = ?
        `, [session_id]);
        
        if (session.length === 0) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        
        const isAuthorized = session[0].instructor_id === userId || session[0].lab_assistant_id === userId;
        
        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        
        for (const student_id of student_ids) {
            const [existing] = await req.pool.query(
                'SELECT id FROM attendance_records WHERE session_id = ? AND student_id = ?',
                [session_id, student_id]
            );
            
            if (existing.length > 0) {
                await req.pool.query(`
                    UPDATE attendance_records 
                    SET status = ?, marked_by = ?, updated_at = NOW()
                    WHERE session_id = ? AND student_id = ?
                `, [status, userId, session_id, student_id]);
            } else {
                await req.pool.query(`
                    INSERT INTO attendance_records 
                    (session_id, student_id, status, check_in_time, marked_by)
                    VALUES (?, ?, ?, ?, ?)
                `, [session_id, student_id, status, currentTime, userId]);
            }
        }
        
        res.json({
            success: true,
            message: `Bulk attendance marked: ${student_ids.length} students`
        });
    } catch (error) {
        console.error('Error in bulk marking:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get attendance report for a session
app.get('/sessions/:id/report', protect, async (req, res) => {
    try {
        const sessionId = req.params.id;
        
        const [report] = await req.pool.query(`
            SELECT 
                asess.*,
                COUNT(DISTINCT ar.student_id) as total_students,
                SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN ar.status = 'late' THEN 1 ELSE 0 END) as late_count,
                SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                ROUND((SUM(CASE WHEN ar.status IN ('present', 'late') THEN 1 ELSE 0 END) / COUNT(DISTINCT ar.student_id)) * 100, 2) as attendance_percentage
            FROM attendance_sessions asess
            LEFT JOIN attendance_records ar ON asess.id = ar.session_id
            WHERE asess.id = ?
            GROUP BY asess.id
        `, [sessionId]);
        
        // Get detailed student list
        const [students] = await req.pool.query(`
            SELECT 
                u.id, u.name, u.email, u.student_id,
                ar.status,
                ar.check_in_time,
                ar.remarks
            FROM users u
            LEFT JOIN attendance_records ar ON u.id = ar.student_id AND ar.session_id = ?
            WHERE u.role = 'student'
            ORDER BY u.name
        `, [sessionId]);
        
        res.json({
            success: true,
            data: {
                summary: report[0] || {},
                students: students
            }
        });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get student attendance summary
app.get('/student/:studentId/summary', protect, async (req, res) => {
    try {
        const studentId = req.params.studentId;
        
        const [summary] = await req.pool.query(`
            SELECT 
                COUNT(DISTINCT ar.session_id) as total_sessions,
                SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN ar.status = 'late' THEN 1 ELSE 0 END) as late_count,
                SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                ROUND((SUM(CASE WHEN ar.status IN ('present', 'late') THEN 1 ELSE 0 END) / COUNT(DISTINCT ar.session_id)) * 100, 2) as attendance_percentage
            FROM attendance_records ar
            WHERE ar.student_id = ?
        `, [studentId]);
        
        // Get detailed session history
        const [history] = await req.pool.query(`
            SELECT 
                asess.date,
                asess.start_time,
                asess.end_time,
                ar.status,
                ar.check_in_time,
                courses.course_name
            FROM attendance_records ar
            JOIN attendance_sessions asess ON ar.session_id = asess.id
            LEFT JOIN schedules s ON asess.schedule_id = s.id
            LEFT JOIN courses ON s.course_id = courses.id
            WHERE ar.student_id = ?
            ORDER BY asess.date DESC
            LIMIT 20
        `, [studentId]);
        
        res.json({
            success: true,
            data: {
                summary: summary[0] || {},
                history: history
            }
        });
    } catch (error) {
        console.error('Error fetching student summary:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Offline sync endpoint
app.post('/offline/sync', protect, async (req, res) => {
    try {
        const { offline_data } = req.body;
        
        // Save to offline queue
        await req.pool.query(
            'INSERT INTO offline_attendance_queue (session_data) VALUES (?)',
            [JSON.stringify(offline_data)]
        );
        
        res.json({
            success: true,
            message: 'Offline data queued for sync'
        });
    } catch (error) {
        console.error('Error saving offline data:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Assign lab assistant to session (Dean/Lab Manager)
app.post('/assign-assistant', protect, authorize('dean', 'lab_manager'), async (req, res) => {
    try {
        const { session_id, lab_assistant_id, assignment_date } = req.body;
        
        await req.pool.query(`
            INSERT INTO lab_assistant_assignments 
            (session_id, lab_assistant_id, assigned_by, assignment_date, status)
            VALUES (?, ?, ?, ?, 'approved')
        `, [session_id, lab_assistant_id, req.user.id, assignment_date]);
        
        // Update session with lab assistant
        await req.pool.query(`
            UPDATE attendance_sessions 
            SET lab_assistant_id = ? 
            WHERE id = ?
        `, [lab_assistant_id, session_id]);
        
        res.json({
            success: true,
            message: 'Lab assistant assigned to session'
        });
    } catch (error) {
        console.error('Error assigning assistant:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// Get attendance by schedule
app.get('/api/attendance/schedule/:scheduleId', async (req, res) => {
    try {
        const { scheduleId } = req.params;
        
        const [rows] = await pool.query(`
            SELECT 
                a.id,
                a.schedule_id,
                a.student_id,
                u.name as student_name,
                u.student_id as student_number,
                a.status,
                a.remarks as notes,
                a.check_in_time,
                a.late_minutes,
                a.created_at as marked_at
            FROM attendance a
            JOIN users u ON a.student_id = u.id
            WHERE a.schedule_id = ?
            ORDER BY u.name
        `, [scheduleId]);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get students for a schedule
app.get('/api/schedules/:scheduleId/students', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.id,
                u.name,
                u.student_id,
                u.email
            FROM users u
            WHERE u.role = 'student'
            ORDER BY u.name
        `);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching students:', error);
        // Return mock data for development
        res.json({ 
            success: true, 
            data: [
                { id: 1, name: 'Abebe Kebede', student_id: 'STU-001', email: 'abebe@clms.com' },
                { id: 2, name: 'Almaz Wondimu', student_id: 'STU-002', email: 'almaz@clms.com' },
                { id: 3, name: 'Biruk Assefa', student_id: 'STU-003', email: 'biruk@clms.com' }
            ]
        });
    }
});

// Mark attendance for a student
app.post('/api/attendance/mark', async (req, res) => {
    try {
        const { schedule_id, student_id, status, notes, late_minutes } = req.body;
        
        const token = req.headers.authorization?.split(' ')[1];
        let marked_by = null;
        if (token) {
            const decoded = jwt.verify(token, 'secret-key');
            marked_by = decoded.id;
        }
        
        const checkInTime = status === 'late' ? new Date().toTimeString().slice(0, 8) : null;
        
        const [result] = await pool.query(`
            INSERT INTO attendance (schedule_id, student_id, status, notes, marked_by, check_in_time, late_minutes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                status = VALUES(status),
                notes = VALUES(notes),
                marked_by = VALUES(marked_by),
                check_in_time = VALUES(check_in_time),
                late_minutes = VALUES(late_minutes)
        `, [schedule_id, student_id, status, notes, marked_by, checkInTime, late_minutes || 0]);
        
        res.json({ success: true, message: 'Attendance marked successfully' });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ success: false, message: 'Failed to mark attendance' });
    }
});

// Bulk mark attendance
app.post('/api/attendance/bulk', async (req, res) => {
    try {
        const { attendance } = req.body;
        
        const token = req.headers.authorization?.split(' ')[1];
        let marked_by = null;
        if (token) {
            const decoded = jwt.verify(token, 'secret-key');
            marked_by = decoded.id;
        }
        
        let inserted = 0;
        
        for (const item of attendance) {
            const checkInTime = item.status === 'late' ? new Date().toTimeString().slice(0, 8) : null;
            
            await pool.query(`
                INSERT INTO attendance (schedule_id, student_id, status, notes, marked_by, check_in_time, late_minutes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    status = VALUES(status),
                    notes = VALUES(notes),
                    marked_by = VALUES(marked_by),
                    check_in_time = VALUES(check_in_time),
                    late_minutes = VALUES(late_minutes)
            `, [item.schedule_id, item.student_id, item.status, item.notes, marked_by, checkInTime, item.late_minutes || 0]);
            inserted++;
        }
        
        res.json({ success: true, message: `${inserted} attendance records saved` });
    } catch (error) {
        console.error('Error bulk marking attendance:', error);
        res.status(500).json({ success: false, message: 'Failed to save attendance' });
    }
});

// Update attendance
app.put('/api/attendance/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        
        await pool.query(`
            UPDATE attendance 
            SET status = ?, notes = ?
            WHERE id = ?
        `, [status, notes, id]);
        
        res.json({ success: true, message: 'Attendance updated successfully' });
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ success: false, message: 'Failed to update attendance' });
    }
});

// Get my attendance (for students) - FIXED VERSION
app.get('/api/attendance/my', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const decoded = jwt.verify(token, 'secret-key');
        const studentId = decoded.id;
        
        // Get attendance records
        const [rows] = await pool.query(`
            SELECT 
                a.id,
                a.schedule_id,
                s.course_name,
                s.start_time,
                s.end_time,
                a.status,
                a.check_in_time,
                a.late_minutes,
                a.created_at as marked_at,
                DATE(s.start_time) as schedule_date
            FROM attendance a
            JOIN schedules s ON a.schedule_id = s.id
            WHERE a.student_id = ?
            ORDER BY s.start_time DESC
        `, [studentId]);
        
        // Calculate summary statistics
        const totalSessions = rows.length;
        const present = rows.filter(r => r.status === 'present').length;
        const absent = rows.filter(r => r.status === 'absent').length;
        const late = rows.filter(r => r.status === 'late').length;
        const overallAttendance = totalSessions > 0 ? ((present + late * 0.5) / totalSessions * 100).toFixed(1) : 0;
        
        res.json({
            success: true,
            data: {
                summary: {
                    overallAttendance: parseFloat(overallAttendance),
                    totalSessions,
                    present,
                    absent,
                    late
                },
                records: rows.map(row => ({
                    id: row.id,
                    scheduleId: row.schedule_id,
                    course: row.course_name,
                    date: row.schedule_date,
                    startTime: row.start_time,
                    endTime: row.end_time,
                    status: row.status,
                    checkInTime: row.check_in_time,
                    lateMinutes: row.late_minutes,
                    markedAt: row.marked_at
                }))
            }
        });
        
    } catch (error) {
        console.error('Error fetching my attendance:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch attendance', error: error.message });
    }
});

// Get attendance report
app.get('/api/attendance/report', async (req, res) => {
    try {
        const { course, student, startDate, endDate } = req.query;
        
        let query = `
            SELECT 
                a.id,
                a.schedule_id,
                s.course_name,
                s.laboratory_id,
                l.name as laboratory_name,
                a.student_id,
                u.name as student_name,
                u.student_id as student_number,
                a.status,
                a.notes,
                a.created_at as marked_at,
                a.check_in_time,
                a.late_minutes,
                s.start_time
            FROM attendance a
            JOIN schedules s ON a.schedule_id = s.id
            JOIN laboratories l ON s.laboratory_id = l.id
            JOIN users u ON a.student_id = u.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (course && course !== 'all') {
            query += ` AND s.course_name = ?`;
            params.push(course);
        }
        
        if (student && student !== 'all') {
            query += ` AND a.student_id = ?`;
            params.push(student);
        }
        
        if (startDate) {
            query += ` AND DATE(s.start_time) >= ?`;
            params.push(startDate);
        }
        
        if (endDate) {
            query += ` AND DATE(s.start_time) <= ?`;
            params.push(endDate);
        }
        
        query += ` ORDER BY s.start_time DESC`;
        
        const [rows] = await pool.query(query, params);
        
        const totalRecords = rows.length;
        const present = rows.filter(r => r.status === 'present').length;
        const absent = rows.filter(r => r.status === 'absent').length;
        const late = rows.filter(r => r.status === 'late').length;
        
        res.json({
            success: true,
            data: {
                summary: {
                    total: totalRecords,
                    present,
                    absent,
                    late,
                    attendanceRate: totalRecords > 0 ? ((present + late * 0.5) / totalRecords * 100).toFixed(1) : 0
                },
                records: rows
            }
        });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
});

// Export attendance report
app.get('/api/attendance/export', async (req, res) => {
    try {
        const { course, student, startDate, endDate, format = 'csv' } = req.query;
        
        let query = `
            SELECT 
                u.name as student_name,
                u.student_id as student_number,
                s.course_name,
                l.name as laboratory_name,
                DATE(s.start_time) as date,
                TIME(s.start_time) as start_time,
                a.status,
                a.notes,
                a.check_in_time,
                a.late_minutes
            FROM attendance a
            JOIN schedules s ON a.schedule_id = s.id
            JOIN laboratories l ON s.laboratory_id = l.id
            JOIN users u ON a.student_id = u.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (course && course !== 'all') {
            query += ` AND s.course_name = ?`;
            params.push(course);
        }
        
        if (student && student !== 'all') {
            query += ` AND a.student_id = ?`;
            params.push(student);
        }
        
        if (startDate) {
            query += ` AND DATE(s.start_time) >= ?`;
            params.push(startDate);
        }
        
        if (endDate) {
            query += ` AND DATE(s.start_time) <= ?`;
            params.push(endDate);
        }
        
        query += ` ORDER BY s.start_time DESC`;
        
        const [rows] = await pool.query(query, params);
        
        let csv = 'Student Name,Student Number,Course,Laboratory,Date,Start Time,Status,Check In Time,Late Minutes,Notes\n';
        
        for (const row of rows) {
            csv += `"${row.student_name}",`;
            csv += `"${row.student_number}",`;
            csv += `"${row.course_name}",`;
            csv += `"${row.laboratory_name}",`;
            csv += `${row.date},`;
            csv += `${row.start_time},`;
            csv += `${row.status},`;
            csv += `${row.check_in_time || ''},`;
            csv += `${row.late_minutes || 0},`;
            csv += `"${(row.notes || '').replace(/"/g, '""')}"\n`;
        }
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="attendance_report.csv"');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting report:', error);
        res.status(500).json({ success: false, message: 'Failed to export report' });
    }
});

// ============================================
// REPORTS ROUTES
// ============================================

// Generate attendance report
app.post('/api/reports/attendance', async (req, res) => {
    try {
        console.log('Generating attendance report...');
        const { startDate, endDate, format = 'json' } = req.body;
        
        const [rows] = await pool.query(`YOUR QUERY HERE`);
        
        // CSV EXPORT - THIS IS THE IMPORTANT PART
        if (format === 'csv') {
            let csv = 'Student Name,Student Number,Status,Date\n';
            for (const row of rows) {
                csv += `"${row.student_name}","${row.student_number}","${row.status}","${row.date}"\n`;
            }
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${Date.now()}.csv`);
            return res.send(csv);
        }
        
        // JSON RESPONSE FOR PREVIEW
        res.json({ success: true, data: { summary, records: rows } });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
});

// Generate computer report - FIXED for your table structure

app.post('/api/reports/computers', async (req, res) => {
    try {
        console.log('Generating computer report...');
        const { format = 'json' } = req.body;
        
        // ... your existing query code ...
        
        // LOOK FOR THIS SECTION - Add/Update CSV export here:
        if (format === 'csv') {
            let csv = 'Asset Tag,Computer Name,Model,Laboratory,Processor,RAM,Storage,OS,Status\n';
            for (const row of rows) {
                csv += `"${row.asset_tag || ''}","${row.name || ''}","${row.model || ''}","${row.laboratory || ''}","${row.processor || ''}","${row.ram || ''}","${row.storage || ''}","${row.os || ''}","${row.status || ''}"\n`;
            }
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=computer_report_${Date.now()}.csv`);
            return res.send(csv);
        }
        
        res.json({ success: true, data: reportData });
    } catch (error) {
        // error handling
    }
});

// Generate maintenance report - FIXED

app.post('/api/reports/maintenance', async (req, res) => {
    try {
        console.log('Generating maintenance report...');
        const { format = 'json' } = req.body;
        
        // ... your existing query code ...
        
        // LOOK FOR THIS SECTION - Add/Update CSV export here:
        if (format === 'csv') {
            let csv = 'ID,Issue Type,Priority,Status,Computer,Requester,Created Date\n';
            for (const row of rows) {
                csv += `${row.id},"${row.issue_type || ''}","${row.priority || ''}","${row.status || ''}","${row.computer_name || ''}","${row.requester_name || ''}","${row.created_at || ''}"\n`;
            }
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=maintenance_report_${Date.now()}.csv`);
            return res.send(csv);
        }
        
        res.json({ success: true, data: reportData });
    } catch (error) {
        // error handling
    }
});

// Export report helper functions
function exportReportAsCSV(reportData, filename, res) {
    try {
        const { records } = reportData;
        if (!records || records.length === 0) {
            return res.status(404).json({ success: false, message: 'No data to export' });
        }
        
        // Get headers from first record
        const headers = Object.keys(records[0]);
        let csv = headers.join(',') + '\n';
        
        for (const record of records) {
            const row = headers.map(header => {
                let value = record[header];
                if (value === null || value === undefined) value = '';
                if (typeof value === 'string' && value.includes(',')) {
                    value = `"${value}"`;
                }
                return value;
            }).join(',');
            csv += row + '\n';
        }
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}_${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        res.status(500).json({ success: false, message: 'Failed to export report' });
    }
}

function exportReportAsExcel(reportData, filename, res) {
    try {
        const { records, summary } = reportData;
        
        // Simple CSV export for now (Excel can open CSV)
        let csv = '';
        
        // Add summary section
        csv += 'REPORT SUMMARY\n';
        for (const [key, value] of Object.entries(summary)) {
            if (typeof value === 'object') {
                for (const [subKey, subValue] of Object.entries(value)) {
                    csv += `${key}_${subKey},${subValue}\n`;
                }
            } else {
                csv += `${key},${value}\n`;
            }
        }
        
        csv += '\n\nDETAILED RECORDS\n';
        
        if (records && records.length > 0) {
            const headers = Object.keys(records[0]);
            csv += headers.join(',') + '\n';
            
            for (const record of records) {
                const row = headers.map(header => {
                    let value = record[header];
                    if (value === null || value === undefined) value = '';
                    if (typeof value === 'string' && value.includes(',')) {
                        value = `"${value}"`;
                    }
                    return value;
                }).join(',');
                csv += row + '\n';
            }
        }
        
        res.setHeader('Content-Type', 'application/vnd.ms-excel');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}_${Date.now()}.xls`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting Excel:', error);
        res.status(500).json({ success: false, message: 'Failed to export report' });
    }
}

// Get saved reports (mock data for now)
app.get('/api/reports/saved', async (req, res) => {
    try {
        // Return mock saved reports
        const savedReports = [
            { id: 1, name: 'March Attendance Summary', type: 'attendance', date: '2026-04-01', size: '245 KB' },
            { id: 2, name: 'Q1 Equipment Report', type: 'equipment', date: '2026-03-31', size: '1.2 MB' },
            { id: 3, name: 'February Maintenance Log', type: 'maintenance', date: '2026-03-01', size: '512 KB' }
        ];
        res.json({ success: true, data: savedReports });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch saved reports' });
    }
});

// Save report
app.post('/api/reports/save', async (req, res) => {
    try {
        const { name, data, filters } = req.body;
        // In production, save to database
        res.json({ success: true, message: 'Report saved successfully', data: { id: Date.now() } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to save report' });
    }
});

// Delete saved report
app.delete('/api/reports/saved/:id', async (req, res) => {
    try {
        const { id } = req.params;
        res.json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete report' });
    }
});

// Export report by ID (for saved reports)
app.get('/api/reports/export/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { format } = req.query;
        
        // Mock data for demonstration
        const mockData = {
            summary: { total: 10, present: 8, absent: 2, late: 0, attendanceRate: 80 },
            records: [
                { student_name: 'John Doe', status: 'present', date: '2026-04-01' },
                { student_name: 'Jane Smith', status: 'present', date: '2026-04-01' }
            ]
        };
        
        if (format === 'csv') {
            return exportReportAsCSV(mockData, `report_${id}`, res);
        }
        
        res.json({ success: true, data: mockData });
    } catch (error) {
        console.error('Error exporting report:', error);
        res.status(500).json({ success: false, message: 'Failed to export report' });
    }
});

// Get scheduled reports
app.get('/api/reports/scheduled', async (req, res) => {
    try {
        // Return mock scheduled reports data
        const scheduledReports = [
            {
                id: 1,
                name: 'Weekly Attendance Report',
                reportType: 'attendance',
                frequency: 'weekly',
                dayOfWeek: 'monday',
                time: '09:00',
                format: 'pdf',
                recipients: ['admin@clms.com'],
                status: 'active',
                lastRun: '2026-04-18T09:00:00',
                nextRun: '2026-04-25T09:00:00'
            },
            {
                id: 2,
                name: 'Computer Inventory Report',
                reportType: 'computers',
                frequency: 'monthly',
                dayOfMonth: 1,
                time: '08:00',
                format: 'excel',
                recipients: ['ict@clms.com'],
                status: 'active',
                lastRun: '2026-04-01T08:00:00',
                nextRun: '2026-05-01T08:00:00'
            }
        ];
        res.json({ success: true, data: scheduledReports });
    } catch (error) {
        console.error('Error fetching scheduled reports:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch scheduled reports' });
    }
});

// Create scheduled report
app.post('/api/reports/schedule', async (req, res) => {
    try {
        const scheduleData = req.body;
        console.log('Creating scheduled report:', scheduleData);
        res.json({ success: true, message: 'Report scheduled successfully', data: { id: Date.now() } });
    } catch (error) {
        console.error('Error creating scheduled report:', error);
        res.status(500).json({ success: false, message: 'Failed to schedule report' });
    }
});

// Update scheduled report
app.put('/api/reports/scheduled/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const scheduleData = req.body;
        console.log('Updating scheduled report:', id, scheduleData);
        res.json({ success: true, message: 'Schedule updated successfully' });
    } catch (error) {
        console.error('Error updating scheduled report:', error);
        res.status(500).json({ success: false, message: 'Failed to update schedule' });
    }
});

// Delete scheduled report
app.delete('/api/reports/scheduled/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting scheduled report:', id);
        res.json({ success: true, message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Error deleting scheduled report:', error);
        res.status(500).json({ success: false, message: 'Failed to delete schedule' });
    }
});

// Run scheduled report
app.post('/api/reports/scheduled/:id/run', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Running scheduled report:', id);
        res.json({ success: true, message: 'Report generated and sent successfully' });
    } catch (error) {
        console.error('Error running scheduled report:', error);
        res.status(500).json({ success: false, message: 'Failed to run report' });
    }
});


// ============================================
// DEAN REPORTS ENDPOINTS
// ============================================

// Export Lab Utilization Report as CSV
app.get('/api/reports/lab-utilization/export', async (req, res) => {
    try {
        const { startDate, endDate, department, lab } = req.query;
        
        let query = `
            SELECT 
                l.name as laboratory_name,
                l.capacity,
                COUNT(DISTINCT c.id) as totalComputers,
                COUNT(DISTINCT s.id) as totalSchedules,
                ROUND(COUNT(DISTINCT s.id) * 100.0 / NULLIF((
                    SELECT COUNT(*) FROM schedules 
                    WHERE laboratory_id = l.id 
                    AND DATE(start_time) BETWEEN ? AND ?
                ), 0), 1) as utilizationRate
            FROM laboratories l
            LEFT JOIN computers c ON c.laboratory_id = l.id
            LEFT JOIN schedules s ON s.laboratory_id = l.id
            WHERE 1=1
        `;
        
        const params = [startDate || '2026-01-01', endDate || '2026-12-31'];
        
        if (department && department !== 'all') {
            query += ` AND l.department = ?`;
            params.push(department);
        }
        
        if (lab && lab !== 'all') {
            query += ` AND l.id = ?`;
            params.push(lab);
        }
        
        query += ` GROUP BY l.id ORDER BY utilizationRate DESC`;
        
        const [rows] = await pool.query(query, params);
        
        let csv = 'Laboratory,Capacity,Total Computers,Total Schedules,Utilization Rate (%)\n';
        for (const row of rows) {
            csv += `"${row.laboratory_name}","${row.capacity || 0}","${row.totalComputers || 0}","${row.totalSchedules || 0}","${row.utilizationRate || 0}"\n`;
        }
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=lab_utilization_report_${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting lab utilization report:', error);
        res.status(500).json({ success: false, message: 'Failed to export report' });
    }
});

// ============================================
// LAB UTILIZATION REPORT ENDPOINT (for Dean)
// ============================================
app.get('/api/reports/lab-utilization', async (req, res) => {
    try {
        const { startDate, endDate, lab, format = 'json' } = req.query;
        
        let query = `
            SELECT 
                l.id,
                l.name as laboratory_name,
                l.code,
                l.capacity,
                COUNT(DISTINCT c.id) as total_computers,
                COUNT(DISTINCT s.id) as total_sessions,
                ROUND(COUNT(DISTINCT s.id) * 100.0 / NULLIF((
                    SELECT COUNT(*) FROM schedules 
                    WHERE laboratory_id = l.id 
                    AND DATE(start_time) BETWEEN ? AND ?
                ), 0), 1) as utilization_rate
            FROM laboratories l
            LEFT JOIN computers c ON c.laboratory_id = l.id
            LEFT JOIN schedules s ON s.laboratory_id = l.id
            WHERE 1=1
        `;
        
        const params = [startDate || '2026-01-01', endDate || '2026-12-31'];
        
        if (lab && lab !== 'all' && lab !== 'undefined') {
            query += ` AND l.id = ?`;
            params.push(lab);
        }
        
        if (startDate && startDate !== 'undefined') {
            query += ` AND DATE(s.start_time) >= ?`;
            params.push(startDate);
        }
        
        if (endDate && endDate !== 'undefined') {
            query += ` AND DATE(s.start_time) <= ?`;
            params.push(endDate);
        }
        
        query += ` GROUP BY l.id ORDER BY utilization_rate DESC`;
        
        const [rows] = await pool.query(query, params);
        
        if (format === 'csv') {
            let csv = 'Laboratory,Code,Capacity,Total Computers,Total Sessions,Utilization Rate (%)\n';
            for (const row of rows) {
                csv += `"${row.laboratory_name || ''}","${row.code || ''}",${row.capacity || 0},${row.total_computers || 0},${row.total_sessions || 0},${row.utilization_rate || 0}\n`;
            }
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="lab_utilization_report_${Date.now()}.csv"`);
            return res.send(csv);
        }
        
        res.json({
            success: true,
            data: rows
        });
        
    } catch (error) {
        console.error('Error generating lab utilization report:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// ============================================
// COURSE REPORT ENDPOINT (for Dean)
// ============================================
app.get('/api/reports/course', async (req, res) => {
    try {
        const { startDate, endDate, course, format = 'json' } = req.query;
        
        let query = `
            SELECT 
                s.course_name as course,
                COUNT(DISTINCT s.id) as total_sessions,
                COUNT(DISTINCT s.requester_id) as total_teachers,
                COUNT(DISTINCT a.id) as total_attendance,
                SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
                ROUND(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(a.id), 0), 1) as attendance_rate,
                COUNT(DISTINCT s.laboratory_id) as laboratories_used
            FROM schedules s
            LEFT JOIN attendance a ON a.schedule_id = s.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (startDate) {
            query += ` AND DATE(s.start_time) >= ?`;
            params.push(startDate);
        }
        
        if (endDate) {
            query += ` AND DATE(s.start_time) <= ?`;
            params.push(endDate);
        }
        
        if (course && course !== 'all' && course !== 'undefined') {
            query += ` AND s.course_name LIKE ?`;
            params.push(`%${course}%`);
        }
        
        query += ` GROUP BY s.course_name ORDER BY attendance_rate DESC`;
        
        const [rows] = await pool.query(query, params);
        
        const totalCourses = rows.length;
        const avgAttendance = rows.length > 0 ? rows.reduce((sum, r) => sum + (parseFloat(r.attendance_rate) || 0), 0) / rows.length : 0;
        
        const summary = {
            totalCourses,
            averageAttendance: Math.round(avgAttendance),
            totalSessions: rows.reduce((sum, r) => sum + (r.total_sessions || 0), 0),
            totalTeachers: rows.reduce((sum, r) => sum + (r.total_teachers || 0), 0)
        };
        
        if (format === 'csv') {
            let csv = 'Course,Total Sessions,Total Teachers,Present,Absent,Late,Attendance Rate (%),Laboratories Used\n';
            for (const row of rows) {
                csv += `"${row.course || ''}",${row.total_sessions || 0},${row.total_teachers || 0},${row.present_count || 0},${row.absent_count || 0},${row.late_count || 0},${row.attendance_rate || 0},${row.laboratories_used || 0}\n`;
            }
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="course_report_${Date.now()}.csv"`);
            return res.send(csv);
        }
        
        res.json({
            success: true,
            data: {
                summary,
                records: rows
            }
        });
        
    } catch (error) {
        console.error('Error generating course report:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Export Department Report as CSV
app.get('/api/reports/department/export', async (req, res) => {
    try {
        const { startDate, endDate, department, format } = req.query;
        
        let query = `
            SELECT 
                u.department,
                COUNT(DISTINCT u.id) as totalStudents,
                COUNT(DISTINCT s.id) as totalSchedules,
                ROUND(COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) * 100.0 / NULLIF(COUNT(DISTINCT a.id), 0), 1) as attendanceRate
            FROM users u
            LEFT JOIN schedules s ON s.requester_id = u.id
            LEFT JOIN attendance a ON a.student_id = u.id
            WHERE u.role = 'student'
        `;
        
        const params = [];
        
        if (department && department !== 'all') {
            query += ` AND u.department = ?`;
            params.push(department);
        }
        
        if (startDate) {
            query += ` AND DATE(s.start_time) >= ?`;
            params.push(startDate);
        }
        
        if (endDate) {
            query += ` AND DATE(s.start_time) <= ?`;
            params.push(endDate);
        }
        
        query += ` GROUP BY u.department`;
        
        const [rows] = await pool.query(query, params);
        
        let csv = 'Department,Total Students,Total Schedules,Attendance Rate (%)\n';
        for (const row of rows) {
            csv += `"${row.department}","${row.totalStudents || 0}","${row.totalSchedules || 0}","${row.attendanceRate || 0}"\n`;
        }
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=department_report_${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting department report:', error);
        res.status(500).json({ success: false, message: 'Failed to export report' });
    }
});



// Export Course Report as CSV
app.get('/api/reports/course/export', async (req, res) => {
    try {
        const { startDate, endDate, department, course } = req.query;
        
        let query = `
            SELECT 
                s.course_name,
                COUNT(DISTINCT s.id) as totalSessions,
                COUNT(DISTINCT s.requester_id) as teachers,
                ROUND(COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) * 100.0 / NULLIF(COUNT(DISTINCT a.id), 0), 1) as attendanceRate
            FROM schedules s
            LEFT JOIN attendance a ON a.schedule_id = s.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (course && course !== 'all') {
            query += ` AND s.course_name = ?`;
            params.push(course);
        }
        
        if (department && department !== 'all') {
            query += ` AND s.department = ?`;
            params.push(department);
        }
        
        if (startDate) {
            query += ` AND DATE(s.start_time) >= ?`;
            params.push(startDate);
        }
        
        if (endDate) {
            query += ` AND DATE(s.start_time) <= ?`;
            params.push(endDate);
        }
        
        query += ` GROUP BY s.course_name ORDER BY attendanceRate DESC`;
        
        const [rows] = await pool.query(query, params);
        
        let csv = 'Course Name,Total Sessions,Teachers,Attendance Rate (%)\n';
        for (const row of rows) {
            csv += `"${row.course_name}","${row.totalSessions || 0}","${row.teachers || 0}","${row.attendanceRate || 0}"\n`;
        }
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=course_report_${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting course report:', error);
        res.status(500).json({ success: false, message: 'Failed to export report' });
    }
});

// ============================================
// DEPARTMENT REPORT ENDPOINT (for Dean)
// ============================================
app.get('/api/reports/department', async (req, res) => {
    try {
        const { startDate, endDate, department, format = 'json' } = req.query;
        
        let query = `
            SELECT 
                u.department,
                COUNT(DISTINCT u.id) as total_students,
                COUNT(DISTINCT a.schedule_id) as total_sessions,
                SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
                ROUND(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(a.id), 0), 1) as attendance_rate
            FROM users u
            LEFT JOIN attendance a ON a.student_id = u.id
            WHERE u.role = 'student'
        `;
        
        const params = [];
        
        if (startDate) {
            query += ` AND DATE(a.created_at) >= ?`;
            params.push(startDate);
        }
        
        if (endDate) {
            query += ` AND DATE(a.created_at) <= ?`;
            params.push(endDate);
        }
        
        if (department && department !== 'all' && department !== 'undefined') {
            query += ` AND u.department = ?`;
            params.push(department);
        }
        
        query += ` GROUP BY u.department ORDER BY attendance_rate DESC`;
        
        const [rows] = await pool.query(query, params);
        
        if (format === 'csv') {
            let csv = 'Department,Total Students,Total Sessions,Present,Absent,Late,Attendance Rate (%)\n';
            for (const row of rows) {
                csv += `"${row.department || 'Unknown'}",${row.total_students || 0},${row.total_sessions || 0},${row.present_count || 0},${row.absent_count || 0},${row.late_count || 0},${row.attendance_rate || 0}\n`;
            }
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="department_report_${Date.now()}.csv"`);
            return res.send(csv);
        }
        
        res.json({
            success: true,
            data: rows
        });
        
    } catch (error) {
        console.error('Error generating department report:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Export Course Report as CSV
app.get('/api/reports/course/export', async (req, res) => {
    try {
        const { startDate, endDate, course, department } = req.query;
        
        let query = `
            SELECT 
                s.course_name,
                COUNT(DISTINCT s.id) as totalSessions,
                COUNT(DISTINCT s.requester_id) as totalTeachers,
                ROUND(COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) * 100.0 / NULLIF(COUNT(DISTINCT a.id), 0), 1) as attendanceRate
            FROM schedules s
            LEFT JOIN attendance a ON a.schedule_id = s.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (course && course !== 'all') {
            query += ` AND s.course_name = ?`;
            params.push(course);
        }
        
        if (department && department !== 'all') {
            query += ` AND s.department = ?`;
            params.push(department);
        }
        
        if (startDate) {
            query += ` AND DATE(s.start_time) >= ?`;
            params.push(startDate);
        }
        
        if (endDate) {
            query += ` AND DATE(s.start_time) <= ?`;
            params.push(endDate);
        }
        
        query += ` GROUP BY s.course_name ORDER BY attendanceRate DESC`;
        
        const [rows] = await pool.query(query, params);
        
        let csv = 'Course Name,Total Sessions,Total Teachers,Attendance Rate (%)\n';
        for (const row of rows) {
            csv += `"${row.course_name}","${row.totalSessions || 0}","${row.totalTeachers || 0}","${row.attendanceRate || 0}"\n`;
        }
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=course_report_${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Failed to export report' });
    }
});

// Report Statistics (for dashboard)
app.get('/api/reports/stats', async (req, res) => {
    try {
        const [deptCount] = await pool.query('SELECT COUNT(DISTINCT department) as count FROM users WHERE department IS NOT NULL');
        const [courseCount] = await pool.query('SELECT COUNT(DISTINCT course_name) as count FROM schedules WHERE course_name IS NOT NULL');
        const [labCount] = await pool.query('SELECT COUNT(*) as count FROM laboratories WHERE is_active = 1');
        const [reportCount] = await pool.query('SELECT COUNT(*) as count FROM reports');
        
        res.json({
            success: true,
            data: {
                departments: deptCount[0]?.count || 4,
                courses: courseCount[0]?.count || 8,
                laboratories: labCount[0]?.count || 5,
                totalReports: reportCount[0]?.count || 45
            }
        });
    } catch (error) {
        res.json({
            success: true,
            data: {
                departments: 4,
                courses: 8,
                laboratories: 5,
                totalReports: 45
            }
        });
    }
});

// 1. ATTENDANCE REPORT
app.get('/api/reports/attendance', async (req, res) => {
    try {
        const { startDate, endDate, department, course } = req.query;
        
        let query = `
            SELECT 
                a.id,
                u.name as student_name,
                u.student_id as student_number,
                u.department,
                s.course_name,
                l.name as laboratory,
                a.status,
                a.notes,
                DATE(a.created_at) as attendance_date,
                TIME(a.created_at) as attendance_time
            FROM attendance a
            JOIN users u ON a.student_id = u.id
            JOIN schedules s ON a.schedule_id = s.id
            JOIN laboratories l ON s.laboratory_id = l.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (startDate) {
            query += ` AND DATE(a.created_at) >= ?`;
            params.push(startDate);
        }
        
        if (endDate) {
            query += ` AND DATE(a.created_at) <= ?`;
            params.push(endDate);
        }
        
        if (department && department !== 'all') {
            query += ` AND u.department = ?`;
            params.push(department);
        }
        
        if (course && course !== 'all') {
            query += ` AND s.course_name = ?`;
            params.push(course);
        }
        
        query += ` ORDER BY a.created_at DESC LIMIT 100`;
        
        const [rows] = await pool.query(query, params);
        
        // Calculate summary statistics
        const total = rows.length;
        const present = rows.filter(r => r.status === 'present').length;
        const absent = rows.filter(r => r.status === 'absent').length;
        const late = rows.filter(r => r.status === 'late').length;
        const attendanceRate = total > 0 ? ((present + late * 0.5) / total * 100).toFixed(1) : 0;
        
        res.json({
            success: true,
            data: {
                summary: {
                    total,
                    present,
                    absent,
                    late,
                    attendanceRate: parseFloat(attendanceRate)
                },
                records: rows
            }
        });
    } catch (error) {
        console.error('Error generating attendance report:', error);
        res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
    }
});
// ============================================
// EQUIPMENT ROUTES
// ============================================

// Get all equipment - FIXED (use laboratory_id, not laboratory)
app.get('/api/equipment', async (req, res) => {
    try {
        const { search, category, status, lab } = req.query;
        
        let query = `
            SELECT 
                e.*,
                l.name as laboratory_name
            FROM equipment e
            LEFT JOIN laboratories l ON e.laboratory_id = l.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (search) {
            query += ' AND (e.name LIKE ? OR e.code LIKE ? OR e.serial_number LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        if (category && category !== 'undefined' && category !== 'all') {
            query += ' AND e.category = ?';
            params.push(category);
        }
        
        if (status && status !== 'undefined' && status !== 'all') {
            query += ' AND e.status = ?';
            params.push(status);
        }
        
        if (lab && lab !== 'undefined' && lab !== 'all') {
            // Use laboratory_id instead of laboratory
            query += ' AND e.laboratory_id = ?';
            params.push(lab);
        }
        
        query += ' ORDER BY e.id DESC';
        
        const [rows] = await pool.query(query, params);
        
        // Transform data for frontend
        const transformedRows = rows.map(row => ({
            id: row.id,
            code: row.code,
            name: row.name,
            category: row.category,
            laboratory: row.laboratory_name || row.laboratory,
            laboratory_id: row.laboratory_id,
            serial_number: row.serial_number,
            model: row.model,
            manufacturer: row.manufacturer,
            purchase_date: row.purchase_date,
            purchase_cost: row.purchase_cost,
            warranty_expiry: row.warranty_expiry,
            condition: row.condition,
            status: row.status,
            notes: row.notes,
            created_at: row.created_at,
            updated_at: row.updated_at
        }));
        
        res.json({ success: true, data: transformedRows });
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
app.get('/api/equipment/available', protect, async (req, res) => {
    try {
        console.log('Fetching available equipment...');
        
        const [equipment] = await pool.query(`
            SELECT 
                id,
                code,
                name,
                category,
                model,
                manufacturer,
                quantity,
                available_quantity,
                equipment_status
            FROM equipment 
            WHERE equipment_status = 'available' 
            AND available_quantity > 0
            ORDER BY name
        `);
        
        console.log(`Found ${equipment.length} equipment items`);
        
        res.json({
            success: true,
            data: equipment
        });
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// Get single equipment
app.get('/api/equipment/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM equipment WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Equipment not found' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch equipment' });
    }
});

// Register new equipment
app.post('/api/equipment', async (req, res) => {
    try {
        const { code, name, category, laboratory, serial_number, model, manufacturer, purchase_date, purchase_cost, warranty_expiry, condition, status, notes } = req.body;
        
        const [result] = await pool.query(`
            INSERT INTO equipment (code, name, category, laboratory, serial_number, model, manufacturer, purchase_date, purchase_cost, warranty_expiry, condition, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [code, name, category, laboratory, serial_number, model, manufacturer, purchase_date, purchase_cost, warranty_expiry, condition || 'good', status || 'available', notes]);
        
        res.status(201).json({ success: true, message: 'Equipment registered successfully', data: { id: result.insertId } });
    } catch (error) {
        console.error('Error registering equipment:', error);
        res.status(500).json({ success: false, message: 'Failed to register equipment' });
    }
});

// Update equipment
app.put('/api/equipment/:id', async (req, res) => {
    try {
        const { code, name, category, laboratory, serial_number, model, manufacturer, purchase_date, purchase_cost, warranty_expiry, condition, status, notes } = req.body;
        
        await pool.query(`
            UPDATE equipment 
            SET code = ?, name = ?, category = ?, laboratory = ?, serial_number = ?, model = ?, manufacturer = ?, 
                purchase_date = ?, purchase_cost = ?, warranty_expiry = ?, condition = ?, status = ?, notes = ?
            WHERE id = ?
        `, [code, name, category, laboratory, serial_number, model, manufacturer, purchase_date, purchase_cost, warranty_expiry, condition, status, notes, req.params.id]);
        
        res.json({ success: true, message: 'Equipment updated successfully' });
    } catch (error) {
        console.error('Error updating equipment:', error);
        res.status(500).json({ success: false, message: 'Failed to update equipment' });
    }
});

// Delete equipment
app.delete('/api/equipment/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM equipment WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Equipment deleted successfully' });
    } catch (error) {
        console.error('Error deleting equipment:', error);
        res.status(500).json({ success: false, message: 'Failed to delete equipment' });
    }
});


// ============================================
// EQUIPMENT BORROWING API FOR LAB ASSISTANT
// ============================================



// Create borrowing request
app.post('/api/borrowings', protect, authorize('asset'), async (req, res) => {
    try {
        const { 
            schedule_id, 
            session_date, 
            start_time, 
            end_time,
            purpose,
            items,
            teacher_id
        } = req.body;
        
        const labAssistantId = req.user.id;
        
        // Generate unique borrowing code
        const borrowing_code = `BRW-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        
        // Create borrowing record
        const [result] = await pool.query(`
            INSERT INTO equipment_borrowings 
            (borrowing_code, schedule_id, lab_assistant_id, teacher_id, session_date, start_time, end_time, purpose, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `, [borrowing_code, schedule_id, labAssistantId, teacher_id, session_date, start_time, end_time, purpose]);
        
        const borrowingId = result.insertId;
        
        // Add borrowing items
        for (const item of items) {
            await pool.query(`
                INSERT INTO borrowing_items (borrowing_id, equipment_id, quantity, status)
                VALUES (?, ?, ?, 'pending')
            `, [borrowingId, item.equipment_id, item.quantity]);
            
            // Update equipment available quantity
            await pool.query(`
                UPDATE equipment 
                SET available_quantity = available_quantity - ? 
                WHERE id = ?
            `, [item.quantity, item.equipment_id]);
        }
        
        res.status(201).json({
            success: true,
            message: 'Borrowing request created successfully',
            data: { id: borrowingId, borrowing_code }
        });
        
    } catch (error) {
        console.error('Error creating borrowing:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/borrowings/my', protect, authorize('lab_assistant,'), async (req, res) => {
    try {
        const labAssistantId = req.user.id;
        const { status } = req.query;
        
        let query = `
            SELECT 
                eb.*,
                s.course_name,
                s.batch_name,
                l.name as lab_name,
                u.name as teacher_name,
                COUNT(bi.id) as items_count
            FROM equipment_borrowings eb
            LEFT JOIN schedules s ON eb.schedule_id = s.id
            LEFT JOIN laboratories l ON s.laboratory_id = l.id
            LEFT JOIN users u ON eb.teacher_id = u.id
            LEFT JOIN borrowing_items bi ON eb.id = bi.borrowing_id
            WHERE eb.lab_assistant_id = ?
        `;
        
        const params = [labAssistantId];
        
        if (status) {
            query += ` AND eb.status = ?`;
            params.push(status);
        }
        
        query += ` GROUP BY eb.id ORDER BY eb.created_at DESC`;
        
        const [borrowings] = await pool.query(query, params);
        
        res.json({
            success: true,
            data: borrowings
        });
    } catch (error) {
        console.error('Error fetching borrowings:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/borrowings/:id', protect, async (req, res) => {
    try {
        const borrowingId = req.params.id;
        
        const [borrowing] = await pool.query(`
            SELECT 
                eb.*,
                s.course_name,
                s.batch_name,
                l.name as lab_name,
                u.name as teacher_name
            FROM equipment_borrowings eb
            LEFT JOIN schedules s ON eb.schedule_id = s.id
            LEFT JOIN laboratories l ON s.laboratory_id = l.id
            LEFT JOIN users u ON eb.teacher_id = u.id
            WHERE eb.id = ?
        `, [borrowingId]);
        
        if (borrowing.length === 0) {
            return res.status(404).json({ success: false, message: 'Borrowing not found' });
        }
        
        const [items] = await pool.query(`
            SELECT 
                bi.*,
                e.name as equipment_name,
                e.code as equipment_code,
                e.category
            FROM borrowing_items bi
            JOIN equipment e ON bi.equipment_id = e.id
            WHERE bi.borrowing_id = ?
        `, [borrowingId]);
        
        res.json({
            success: true,
            data: {
                ...borrowing[0],
                items: items
            }
        });
    } catch (error) {
        console.error('Error fetching borrowing details:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// Issue equipment (Asset Division/Admin)
app.put('/api/borrowings/:id/issue', protect, authorize('asset', 'admin'), async (req, res) => {
    try {
        const borrowingId = req.params.id;
        
        // Update borrowing status
        await pool.query(`
            UPDATE equipment_borrowings 
            SET status = 'borrowed', approved_by = ?, approved_at = NOW()
            WHERE id = ?
        `, [req.user.id, borrowingId]);
        
        // Update all borrowing items status
        await pool.query(`
            UPDATE borrowing_items 
            SET status = 'issued', issued_at = NOW()
            WHERE borrowing_id = ?
        `, [borrowingId]);
        
        res.json({
            success: true,
            message: 'Equipment issued successfully'
        });
    } catch (error) {
        console.error('Error issuing equipment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Return equipment
app.put('/api/borrowings/:id/return', protect, authorize('lab_assistant', 'asset'), async (req, res) => {
    try {
        const borrowingId = req.params.id;
        const { items_condition } = req.body;
        
        // Update borrowing status
        await pool.query(`
            UPDATE equipment_borrowings 
            SET status = 'returned', returned_at = NOW()
            WHERE id = ?
        `, [borrowingId]);
        
        // Update items status and return equipment to inventory
        const [items] = await pool.query(`
            SELECT equipment_id, quantity FROM borrowing_items WHERE borrowing_id = ?
        `, [borrowingId]);
        
        for (const item of items) {
            // Update borrowing item
            await pool.query(`
                UPDATE borrowing_items 
                SET status = 'returned', returned_at = NOW(), notes = ?
                WHERE borrowing_id = ? AND equipment_id = ?
            `, [items_condition?.[item.equipment_id] || null, borrowingId, item.equipment_id]);
            
            // Return quantity to inventory
            await pool.query(`
                UPDATE equipment 
                SET available_quantity = available_quantity + ?
                WHERE id = ?
            `, [item.quantity, item.equipment_id]);
        }
        
        res.json({
            success: true,
            message: 'Equipment returned successfully'
        });
    } catch (error) {
        console.error('Error returning equipment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// AUDIT ROUTES
// ============================================

// Get all audits
app.get('/api/audits', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                a.id,
                a.laboratory_id,
                l.name as lab,
                a.auditor,
                a.audit_date as date,
                a.total_items,
                a.present_items,
                a.missing_items,
                a.damaged_items,
                a.compliance_rate,
                a.status,
                a.notes,
                a.created_at
            FROM audits a
            LEFT JOIN laboratories l ON a.laboratory_id = l.id
            ORDER BY a.audit_date DESC
        `);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching audits:', error);
        // Return mock data for development
        res.json({ success: true, data: [] });
    }
});

// Get single audit
app.get('/api/audits/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                a.*,
                l.name as lab
            FROM audits a
            LEFT JOIN laboratories l ON a.laboratory_id = l.id
            WHERE a.id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Audit not found' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch audit' });
    }
});

// Create new audit
app.post('/api/audits', async (req, res) => {
    try {
        const { 
            laboratory_id, 
            auditor, 
            audit_date, 
            total_items, 
            present_items, 
            missing_items, 
            damaged_items, 
            compliance_rate, 
            status, 
            notes,
            checklist_items 
        } = req.body;
        
        const [result] = await pool.query(`
            INSERT INTO audits (
                laboratory_id, auditor, audit_date, total_items, present_items, 
                missing_items, damaged_items, compliance_rate, status, notes, checklist_items
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [laboratory_id, auditor, audit_date, total_items, present_items, missing_items, damaged_items, compliance_rate, status || 'completed', notes, JSON.stringify(checklist_items || [])]);
        
        res.status(201).json({ success: true, message: 'Audit completed successfully', data: { id: result.insertId } });
    } catch (error) {
        console.error('Error creating audit:', error);
        res.status(500).json({ success: false, message: 'Failed to create audit' });
    }
});
// Add to your server.js


// ============================================
// CONTACT MESSAGES TABLE
// ============================================
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

// In your server-final.js, replace the contact submit endpoint with:

// ============================================
// SUBMIT CONTACT MESSAGE (Public - No authentication required)
// ============================================
app.post('/api/contact/submit', async (req, res) => {
  try {
    const { name, email, subject, message, category, priority } = req.body;
    
    console.log('📧 Contact form submission:', { name, email, subject });
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }
    
    // Generate unique ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Check if contact_messages table exists, if not create it
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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (tableError) {
      console.log('Table creation error:', tableError.message);
    }
    
    // Insert message into database
    const [result] = await pool.query(`
      INSERT INTO contact_messages 
      (name, email, subject, message, category, priority, ticket_number, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [name, email, subject, message, category || 'general', priority || 'normal', ticketNumber]);
    
    console.log(`✅ Contact message saved - Ticket: ${ticketNumber}`);
    
    // Try to send email notification (don't fail if email fails)
    try {
      // Send email notification to Lab Manager (configure your email service)
      console.log(`📧 Email notification would be sent to labmanager@clms.com`);
    } catch (emailError) {
      console.log('Email notification failed but message was saved');
    }
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully! Our team will respond within 24 hours.',
      ticket: {
        ticketNumber,
        status: 'pending'
      }
    });
    
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again later.' 
    });
  }
});

// ============================================
// GET CONTACT MESSAGES (Lab Manager Only)
// ============================================
app.get('/api/contact/messages', protect, authorize('lab_manager', 'admin'), async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    
    let query = `
      SELECT 
        cm.*,
        u.name as replied_by_name
      FROM contact_messages cm
      LEFT JOIN users u ON cm.replied_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status && status !== 'all') {
      query += ` AND cm.status = ?`;
      params.push(status);
    }
    
    if (category && category !== 'all') {
      query += ` AND cm.category = ?`;
      params.push(category);
    }
    
    if (priority && priority !== 'all') {
      query += ` AND cm.priority = ?`;
      params.push(priority);
    }
    
    query += ` ORDER BY 
      CASE cm.priority 
        WHEN 'urgent' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'normal' THEN 3 
        ELSE 4 
      END ASC,
      cm.created_at DESC`;
    
    const [rows] = await pool.query(query, params);
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// REPLY TO CONTACT MESSAGE (Lab Manager Only)
// ============================================
app.post('/api/contact/messages/:id/reply', protect, authorize('lab_manager', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const repliedBy = req.user.id;
    
    if (!reply) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reply message is required' 
      });
    }
    
    // Get the original message
    const [messages] = await pool.query(
      'SELECT name, email, subject, message, ticket_number FROM contact_messages WHERE id = ?',
      [id]
    );
    
    if (messages.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }
    
    const message = messages[0];
    
    // Update message with reply
    await pool.query(`
      UPDATE contact_messages 
      SET reply = ?, status = 'replied', replied_by = ?, replied_at = NOW()
      WHERE id = ?
    `, [reply, repliedBy, id]);
    
    // Send email response to the client
    await sendEmailResponse({
      to: message.email,
      subject: `Re: ${message.subject} (Ticket: ${message.ticket_number})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">CLMS Support Team Response</h2>
          <p>Dear <strong>${message.name}</strong>,</p>
          <p>Thank you for contacting CLMS. Your message has been reviewed by our Lab Manager.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4 style="margin: 0 0 10px 0; color: #667eea;">Your Original Message:</h4>
            <p style="margin: 0;"><strong>Subject:</strong> ${message.subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.message}</p>
          </div>
          
          <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4 style="margin: 0 0 10px 0; color: #10b981;">Our Response:</h4>
            <p>${reply}</p>
          </div>
          
          <hr>
          <p style="font-size: 12px; color: #666;">
            Ticket Number: <strong>${message.ticket_number}</strong><br>
            If you have further questions, please reply to this email or submit a new message through the contact form.
          </p>
          <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
            CLMS - Computer Laboratory Management System<br>
            Injibara University
          </p>
        </div>
      `
    });
    
    res.json({
      success: true,
      message: 'Reply sent successfully'
    });
    
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send reply' 
    });
  }
});

// ============================================
// EMAIL HELPER FUNCTIONS
// ============================================

async function sendEmailNotification({ to, subject, html }) {
  // Configure your email service (nodemailer, sendgrid, etc.)
  // This is a placeholder - configure with your email provider
  console.log(`📧 Email would be sent to ${to}: ${subject}`);
  return true;
}

async function sendEmailResponse({ to, subject, html }) {
  // Configure your email service
  console.log(`📧 Response email would be sent to ${to}: ${subject}`);
  return true;
}

// Call this when starting the server
//await createContactMessagesTable();

async function start() {
    await testDB();
    await initSettings();
    await createEquipmentTable();
    app.listen(PORT, () => {
        console.log(`\n========================================`);
        console.log(` CLMS BACKEND`);
        console.log(` http://localhost:${PORT}`);
        console.log(` Database: ${dbConnected ? 'CONNECTED ✅' : 'NOT CONNECTED '}`);
        console.log(`========================================\n`);
    });
}

start();