const jwt = require('jsonwebtoken');

const approveSchedule = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
        const { id } = req.params;
        const { comments, approver_id } = req.body;

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
};

const rejectSchedule = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
        const { id } = req.params;
        const { reason, approver_id } = req.body;

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
};

const createSchedule = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Please login first.'
            });
        }

        let requesterId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            requesterId = decoded.id;
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.'
            });
        }

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
};

const batchCreateSchedules = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        let requesterId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            requesterId = decoded.id;
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        if (!batchName) {
            return res.status(400).json({ success: false, message: 'Batch name is required' });
        }
        if (!courses || !Array.isArray(courses) || courses.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one course is required' });
        }
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Start and end dates are required' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const dayMap = {
            'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
            'Thursday': 4, 'Friday': 5, 'Saturday': 6
        };

        const selectedDays = (daysOfWeek && daysOfWeek.length > 0)
            ? daysOfWeek.map(day => dayMap[day]).filter(d => d !== undefined)
            : [1, 2, 3, 4, 5];

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

        const labList = labPreferences && labPreferences.length > 0 ? labPreferences : [1];

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
};

const getSchedules = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const getMySchedules = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
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
};

const cancelSchedule = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const checkAvailability = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const getCourses = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

const getBatches = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
        res.json({
            success: true,
            data: [
                { id: 1, name: 'CS 3rd Year - Batch A', semester: '1st Semester' },
                { id: 2, name: 'CS 3rd Year - Batch B', semester: '1st Semester' },
                { id: 3, name: 'CS 4th Year - Batch A', semester: '2nd Semester' },
                { id: 4, name: 'CS 4th Year - Batch B', semester: '2nd Semester' }
            ]
        });
    } catch (error) {
        console.error('Error fetching batches:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch batches' });
    }
};

const exportSchedules = async (req, res) => {
    try {
        const pool = global.dbPool || app.locals.db;
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
};

module.exports = {
    approveSchedule,
    rejectSchedule,
    createSchedule,
    batchCreateSchedules,
    getSchedules,
    getMySchedules,
    cancelSchedule,
    checkAvailability,
    getCourses,
    getBatches,
    exportSchedules
};
