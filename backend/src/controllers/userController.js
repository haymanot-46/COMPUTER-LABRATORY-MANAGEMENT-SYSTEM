const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const getUserRoles = (req, res) => {
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
};

const getUserById = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const createUser = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const updateUser = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const deleteUser = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const uploadProfileImage = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const getProfileImage = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const updateProfileImageByAdmin = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const deleteProfileImage = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

module.exports = {
    getUsers,
    getUserRoles,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    uploadProfileImage,
    getProfileImage,
    updateProfileImageByAdmin,
    deleteProfileImage
};
