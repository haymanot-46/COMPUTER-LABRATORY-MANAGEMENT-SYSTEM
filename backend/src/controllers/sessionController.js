const getSessions = async (req, res) => {
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

        const [sessions] = await global.dbPool.query(query, params);

        res.json({
            success: true,
            data: sessions
        });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createSession = async (req, res) => {
    try {
        const { schedule_id, date, start_time, end_time, course_code } = req.body;

        // Generate unique session code
        const session_code = `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

        const [result] = await global.dbPool.query(`
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
};

const startSession = async (req, res) => {
    try {
        const sessionId = req.params.id;

        await global.dbPool.query(`
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
};

const markAttendance = async (req, res) => {
    try {
        const { session_id, student_id, status, computer_id, remarks } = req.body;
        const userId = req.user.id;
        const currentTime = new Date().toTimeString().split(' ')[0];

        // Check if user is authorized for this session
        const [session] = await global.dbPool.query(`
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
        const [existing] = await global.dbPool.query(
            'SELECT id FROM attendance_records WHERE session_id = ? AND student_id = ?',
            [session_id, student_id]
        );

        if (existing.length > 0) {
            // Update existing
            await global.dbPool.query(`
                UPDATE attendance_records 
                SET status = ?, computer_id = ?, marked_by = ?, remarks = ?, updated_at = NOW()
                WHERE session_id = ? AND student_id = ?
            `, [status, computer_id || null, userId, remarks || null, session_id, student_id]);
        } else {
            // Insert new
            await global.dbPool.query(`
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
};

const bulkMarkAttendance = async (req, res) => {
    try {
        const { session_id, student_ids, status } = req.body;
        const userId = req.user.id;
        const currentTime = new Date().toTimeString().split(' ')[0];

        // Verify authorization
        const [session] = await global.dbPool.query(`
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
            const [existing] = await global.dbPool.query(
                'SELECT id FROM attendance_records WHERE session_id = ? AND student_id = ?',
                [session_id, student_id]
            );

            if (existing.length > 0) {
                await global.dbPool.query(`
                    UPDATE attendance_records 
                    SET status = ?, marked_by = ?, updated_at = NOW()
                    WHERE session_id = ? AND student_id = ?
                `, [status, userId, session_id, student_id]);
            } else {
                await global.dbPool.query(`
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
};

const getSessionReport = async (req, res) => {
    try {
        const sessionId = req.params.id;

        const [report] = await global.dbPool.query(`
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
        const [students] = await global.dbPool.query(`
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
};

const getStudentSummary = async (req, res) => {
    try {
        const studentId = req.params.studentId;

        const [summary] = await global.dbPool.query(`
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
        const [history] = await global.dbPool.query(`
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
};

const syncOffline = async (req, res) => {
    try {
        const { offline_data } = req.body;

        // Save to offline queue
        await global.dbPool.query(
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
};

const assignAssistant = async (req, res) => {
    try {
        const { session_id, lab_assistant_id, assignment_date } = req.body;

        await global.dbPool.query(`
            INSERT INTO lab_assistant_assignments 
            (session_id, lab_assistant_id, assigned_by, assignment_date, status)
            VALUES (?, ?, ?, ?, 'approved')
        `, [session_id, lab_assistant_id, req.user.id, assignment_date]);

        // Update session with lab assistant
        await global.dbPool.query(`
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
};

module.exports = {
    getSessions,
    createSession,
    startSession,
    markAttendance,
    bulkMarkAttendance,
    getSessionReport,
    getStudentSummary,
    syncOffline,
    assignAssistant
};
