// backend/src/controllers/deanController.js
const { pool } = require('../config/database');

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

// Get department statistics
const getDepartmentStats = async (req, res) => {
    try {
        // Get department breakdown
        const [departments] = await pool.query(`
            SELECT 
                u.department,
                COUNT(DISTINCT CASE WHEN u.role = 'teacher' THEN u.id END) as teachers,
                COUNT(DISTINCT CASE WHEN u.role = 'student' THEN u.id END) as students,
                COUNT(DISTINCT l.id) as labs,
                COUNT(DISTINCT c.id) as computers
            FROM users u
            LEFT JOIN laboratories l ON l.department = u.department
            LEFT JOIN computers c ON c.laboratory_id = l.id
            WHERE u.department IS NOT NULL AND u.department != ''
            GROUP BY u.department
        `);
        
        const [totalStats] = await pool.query(`
            SELECT 
                COUNT(DISTINCT CASE WHEN role = 'teacher' THEN id END) as totalTeachers,
                COUNT(DISTINCT CASE WHEN role = 'student' THEN id END) as totalStudents,
                COUNT(DISTINCT department) as totalDepartments
            FROM users
            WHERE department IS NOT NULL AND department != ''
        `);
        
        const [labStats] = await pool.query('SELECT COUNT(*) as totalLabs FROM laboratories WHERE is_active = 1');
        const [computerStats] = await pool.query('SELECT COUNT(*) as totalComputers FROM computers');
        
        res.json({
            success: true,
            data: {
                totalDepartments: totalStats[0]?.totalDepartments || 0,
                totalTeachers: totalStats[0]?.totalTeachers || 0,
                totalStudents: totalStats[0]?.totalStudents || 0,
                totalLabs: labStats[0]?.totalLabs || 0,
                totalComputers: computerStats[0]?.totalComputers || 0,
                departmentBreakdown: departments
            }
        });
    } catch (error) {
        console.error('Error fetching department stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch department statistics' });
    }
};

// Get department performance
const getDepartmentPerformance = async (req, res) => {
    try {
        const [performance] = await pool.query(`
            SELECT 
                u.department,
                COUNT(DISTINCT s.id) as totalSchedules,
                COUNT(DISTINCT a.id) as totalAttendance,
                ROUND(AVG(CASE WHEN a.status = 'present' THEN 100 ELSE 0 END), 1) as attendanceRate,
                COUNT(DISTINCT mr.id) as maintenanceRequests
            FROM users u
            LEFT JOIN schedules s ON s.requester_id = u.id
            LEFT JOIN attendance a ON a.student_id = u.id
            LEFT JOIN maintenance_requests mr ON mr.requester_id = u.id
            WHERE u.department IS NOT NULL AND u.department != ''
            GROUP BY u.department
        `);
        
        res.json({ success: true, data: performance });
    } catch (error) {
        console.error('Error fetching department performance:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch department performance' });
    }
};

// Get lab utilization
const getLabUtilization = async (req, res) => {
    try {
        const [utilization] = await pool.query(`
            SELECT 
                l.id,
                l.name,
                l.code,
                l.capacity,
                COUNT(DISTINCT c.id) as totalComputers,
                COUNT(DISTINCT s.id) as scheduleCount,
                ROUND((COUNT(DISTINCT s.id) / (SELECT COUNT(*) FROM schedules) * 100), 1) as utilizationRate
            FROM laboratories l
            LEFT JOIN computers c ON c.laboratory_id = l.id
            LEFT JOIN schedules s ON s.laboratory_id = l.id
            WHERE l.is_active = 1
            GROUP BY l.id
            ORDER BY utilizationRate DESC
        `);
        
        res.json({ success: true, data: utilization });
    } catch (error) {
        console.error('Error fetching lab utilization:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch lab utilization' });
    }
};

// Get attendance overview
const getAttendanceOverview = async (req, res) => {
    try {
        const [overview] = await pool.query(`
            SELECT 
                DATE(a.created_at) as date,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent,
                COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late,
                COUNT(*) as total
            FROM attendance a
            WHERE a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(a.created_at)
            ORDER BY date DESC
        `);
        
        res.json({ success: true, data: overview });
    } catch (error) {
        console.error('Error fetching attendance overview:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch attendance overview' });
    }
};

// ============================================
// BATCH SCHEDULE FUNCTIONS
// ============================================

// Get batch schedules
const getBatchSchedule = async (req, res) => {
    try {
        const [batches] = await pool.query(`
            SELECT 
                id,
                batch_name,
                semester,
                course_name,
                laboratory_id,
                start_time,
                end_time,
                status,
                created_at
            FROM schedules
            WHERE batch_name IS NOT NULL
            ORDER BY created_at DESC
        `);
        
        res.json({ success: true, data: batches });
    } catch (error) {
        console.error('Error fetching batch schedules:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch batch schedules' });
    }
};

// Create batch schedule
const createBatchSchedule = async (req, res) => {
    try {
        const { batchName, semester, courses, labPreferences, startDate, endDate, daysOfWeek, timeSlots } = req.body;
        const requesterId = req.user.id;
        
        // Parse dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Get all dates between start and end for specified days of week
        const scheduleDates = [];
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
};

// Approve batch schedule
const approveBatchSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.query(`
            UPDATE schedules 
            SET status = 'approved', approved_by = ?, approved_at = NOW()
            WHERE id = ?
        `, [req.user.id, id]);
        
        res.json({ success: true, message: 'Batch schedule approved successfully' });
    } catch (error) {
        console.error('Error approving batch schedule:', error);
        res.status(500).json({ success: false, message: 'Failed to approve batch schedule' });
    }
};

// ============================================
// APPROVAL FUNCTIONS
// ============================================

// Get pending approvals
const getPendingApprovals = async (req, res) => {
    try {
        const [pending] = await pool.query(`
            SELECT 
                s.id,
                s.course_name as title,
                l.name as lab,
                u.name as instructor,
                u.department,
                s.expected_students as students,
                s.notes as description,
                DATE(s.start_time) as date,
                TIME(s.start_time) as startTime,
                TIME(s.end_time) as endTime,
                s.created_at,
                CASE 
                    WHEN s.created_at > NOW() - INTERVAL 1 DAY THEN 'urgent'
                    WHEN s.created_at > NOW() - INTERVAL 3 DAY THEN 'high'
                    ELSE 'medium'
                END as priority
            FROM schedules s
            LEFT JOIN laboratories l ON s.laboratory_id = l.id
            LEFT JOIN users u ON s.requester_id = u.id
            WHERE s.status = 'pending'
            ORDER BY s.created_at ASC
        `);
        
        res.json({ success: true, data: pending });
    } catch (error) {
        console.error('Error fetching pending approvals:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending approvals' });
    }
};

// Approve schedule
const approveSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;
        
        await pool.query(`
            UPDATE schedules 
            SET status = 'approved', 
                approver_id = ?, 
                approved_at = NOW(),
                rejection_reason = NULL,
                notes = CONCAT(notes, ' Approved by Dean: ', ?)
            WHERE id = ?
        `, [req.user.id, comments || '', id]);
        
        res.json({ success: true, message: 'Schedule approved successfully' });
    } catch (error) {
        console.error('Error approving schedule:', error);
        res.status(500).json({ success: false, message: 'Failed to approve schedule' });
    }
};

// Reject schedule
const rejectSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        await pool.query(`
            UPDATE schedules 
            SET status = 'rejected', 
                approver_id = ?, 
                rejection_reason = ?
            WHERE id = ?
        `, [req.user.id, reason || 'No reason provided', id]);
        
        res.json({ success: true, message: 'Schedule rejected' });
    } catch (error) {
        console.error('Error rejecting schedule:', error);
        res.status(500).json({ success: false, message: 'Failed to reject schedule' });
    }
};

// ============================================
// REPORT FUNCTIONS
// ============================================

// Get department reports
const getDepartmentReports = async (req, res) => {
    try {
        const [reports] = await pool.query(`
            SELECT 
                d.name as department,
                COUNT(DISTINCT u.id) as totalUsers,
                COUNT(DISTINCT s.id) as totalSchedules,
                COUNT(DISTINCT a.id) as totalAttendance,
                ROUND(AVG(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100, 1) as attendanceRate
            FROM (SELECT 'Computer Science' as name UNION SELECT 'Software Engineering' UNION SELECT 'Information Technology') d
            LEFT JOIN users u ON u.department = d.name
            LEFT JOIN schedules s ON s.requester_id = u.id
            LEFT JOIN attendance a ON a.student_id = u.id
            GROUP BY d.name
        `);
        
        res.json({ success: true, data: reports });
    } catch (error) {
        console.error('Error fetching department reports:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch department reports' });
    }
};

// Generate department report
const generateDepartmentReport = async (req, res) => {
    try {
        const { department, startDate, endDate, format } = req.body;
        
        const [data] = await pool.query(`
            SELECT 
                u.name,
                u.email,
                u.role,
                COUNT(s.id) as schedules,
                COUNT(a.id) as attendance
            FROM users u
            LEFT JOIN schedules s ON s.requester_id = u.id AND DATE(s.start_time) BETWEEN ? AND ?
            LEFT JOIN attendance a ON a.student_id = u.id AND DATE(a.created_at) BETWEEN ? AND ?
            WHERE u.department = ?
            GROUP BY u.id
        `, [startDate, endDate, startDate, endDate, department]);
        
        res.json({ 
            success: true, 
            data: {
                department,
                period: { startDate, endDate },
                generatedAt: new Date().toISOString(),
                records: data
            }
        });
    } catch (error) {
        console.error('Error generating department report:', error);
        res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
};

// ============================================
// FACULTY MANAGEMENT
// ============================================

// Get faculty list
const getFacultyList = async (req, res) => {
    try {
        const [faculty] = await pool.query(`
            SELECT 
                u.id,
                u.name,
                u.email,
                u.department,
                u.phone,
                COUNT(DISTINCT s.id) as scheduleCount,
                COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) as attendanceCount
            FROM users u
            LEFT JOIN schedules s ON s.requester_id = u.id
            LEFT JOIN attendance a ON a.marked_by = u.id
            WHERE u.role IN ('teacher', 'lab_manager')
            GROUP BY u.id
            ORDER BY u.name
        `);
        
        res.json({ success: true, data: faculty });
    } catch (error) {
        console.error('Error fetching faculty list:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch faculty list' });
    }
};

// Get faculty performance
const getFacultyPerformance = async (req, res) => {
    try {
        const [performance] = await pool.query(`
            SELECT 
                u.id,
                u.name,
                u.department,
                COUNT(DISTINCT s.id) as totalSchedules,
                COUNT(DISTINCT a.id) as totalAttendance,
                ROUND(AVG(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100, 1) as attendanceRate,
                COUNT(DISTINCT mr.id) as maintenanceRequests
            FROM users u
            LEFT JOIN schedules s ON s.requester_id = u.id
            LEFT JOIN attendance a ON a.marked_by = u.id
            LEFT JOIN maintenance_requests mr ON mr.requester_id = u.id
            WHERE u.role IN ('teacher', 'lab_manager')
            GROUP BY u.id
            ORDER BY attendanceRate DESC
        `);
        
        res.json({ success: true, data: performance });
    } catch (error) {
        console.error('Error fetching faculty performance:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch faculty performance' });
    }
};

// ============================================
// NOTIFICATIONS
// ============================================

// Get my notifications
const getMyNotifications = async (req, res) => {
    try {
        const [notifications] = await pool.query(`
            SELECT 
                id,
                title,
                message,
                type,
                is_read,
                created_at
            FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 20
        `, [req.user.id]);
        
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
};

// ============================================
// PROFILE FUNCTIONS
// ============================================

// Update profile
const updateProfile = async (req, res) => {
    try {
        const { phone, address, department } = req.body;
        
        await pool.query(`
            UPDATE users 
            SET phone = ?, address = ?, department = ?
            WHERE id = ?
        `, [phone, address, department, req.user.id]);
        
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const bcrypt = require('bcryptjs');
        
        // Get current user
        const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, users[0].password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
        
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
};

module.exports = {
    getDepartmentStats,
    getDepartmentPerformance,
    getLabUtilization,
    getAttendanceOverview,
    getBatchSchedule,
    createBatchSchedule,
    approveBatchSchedule,
    getPendingApprovals,
    approveSchedule,
    rejectSchedule,
    getDepartmentReports,
    generateDepartmentReport,
    getFacultyList,
    getFacultyPerformance,
    getMyNotifications,
    updateProfile,
    changePassword
};