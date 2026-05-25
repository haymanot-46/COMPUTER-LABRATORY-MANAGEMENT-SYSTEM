const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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

const register = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
        const { email, name, password, role, department, student_id, phone, profile_image } = req.body;

        console.log('📝 Registration attempt:', email);

        if (!email || !name || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email, name and password are required'
            });
        }

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

        const hashedPassword = await bcrypt.hash(password, 10);

        const userRole = role || 'student';

        const [result] = await pool.query(
            `INSERT INTO users 
            (email, name, password, role, department, student_id, phone, profile_image, is_active, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
            [email.toLowerCase(), name, hashedPassword, userRole, department || null, student_id || null, phone || null, profile_image || null]
        );

        console.log('✅ User registered successfully:', email);

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
                id: result.insertId,
                email: email,
                name: name,
                role: userRole,
                department: department || null,
                profile_image: profile_image || null
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed: ' + error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
        const { email, password } = req.body;

        console.log(' Login attempt:', email);

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
};

const changePassword = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const forgotPassword = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
        const { email } = req.body;

        console.log('📧 Forgot password request for:', email);

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        try {
            await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255) NULL');
            await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expiry DATETIME NULL');
        } catch (err) {
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
};

const resetPassword = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const verifyResetToken = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

module.exports = { register, login, changePassword, forgotPassword, resetPassword, verifyResetToken };
