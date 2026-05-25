const pool = global.dbPool || require('../config/database').pool;
const jwt = require('jsonwebtoken');

const getAttendanceBySchedule = async (req, res) => {
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
};

const getScheduleStudents = async (req, res) => {
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
};

const markAttendanceApi = async (req, res) => {
    try {
        const { schedule_id, student_id, status, notes, late_minutes } = req.body;

        const token = req.headers.authorization?.split(' ')[1];
        let marked_by = null;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
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
};

const bulkMarkAttendanceApi = async (req, res) => {
    try {
        const { attendance } = req.body;

        const token = req.headers.authorization?.split(' ')[1];
        let marked_by = null;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
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
};

const updateAttendance = async (req, res) => {
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
};

const getMyAttendance = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
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
};

const getAttendanceReport = async (req, res) => {
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
};

const exportAttendance = async (req, res) => {
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
};

module.exports = {
    getAttendanceBySchedule,
    getScheduleStudents,
    markAttendanceApi,
    bulkMarkAttendanceApi,
    updateAttendance,
    getMyAttendance,
    getAttendanceReport,
    exportAttendance
};
