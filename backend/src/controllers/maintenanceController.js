const jwt = require('jsonwebtoken');

const exportMaintenance = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const getMaintenanceStats = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const getMaintenanceRequests = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const getMaintenanceById = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
        const { id } = req.params;
        const userRole = req.user.role;
        const userId = req.user.id;
        
        const [rows] = await pool.query(`
            SELECT 
                m.*,
                c.workstation_number as computer_name,
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
};

const createMaintenance = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
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
};

const updateMaintenance = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const assignMaintenance = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const startMaintenance = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const completeMaintenance = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const cancelMaintenance = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

module.exports = {
    exportMaintenance,
    getMaintenanceStats,
    getMaintenanceRequests,
    getMaintenanceById,
    createMaintenance,
    updateMaintenance,
    assignMaintenance,
    startMaintenance,
    completeMaintenance,
    cancelMaintenance
};
