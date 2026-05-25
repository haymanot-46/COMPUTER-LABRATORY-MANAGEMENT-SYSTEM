const createBorrowing = async (req, res) => {
    try {
        const pool = global.dbPool || (req.app && req.app.locals.db);
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
        
        const borrowing_code = `BRW-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        
        const [result] = await pool.query(`
            INSERT INTO equipment_borrowings 
            (borrowing_code, schedule_id, lab_assistant_id, teacher_id, session_date, start_time, end_time, purpose, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `, [borrowing_code, schedule_id, labAssistantId, teacher_id, session_date, start_time, end_time, purpose]);
        
        const borrowingId = result.insertId;
        
        for (const item of items) {
            await pool.query(`
                INSERT INTO borrowing_items (borrowing_id, equipment_id, quantity, status)
                VALUES (?, ?, ?, 'pending')
            `, [borrowingId, item.equipment_id, item.quantity]);
            
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
};

const getMyBorrowings = async (req, res) => {
    try {
        const pool = global.dbPool || (req.app && req.app.locals.db);
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
};

const getBorrowingById = async (req, res) => {
    try {
        const pool = global.dbPool || (req.app && req.app.locals.db);
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
};

const issueBorrowing = async (req, res) => {
    try {
        const pool = global.dbPool || (req.app && req.app.locals.db);
        const borrowingId = req.params.id;
        
        await pool.query(`
            UPDATE equipment_borrowings 
            SET status = 'borrowed', approved_by = ?, approved_at = NOW()
            WHERE id = ?
        `, [req.user.id, borrowingId]);
        
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
};

const returnBorrowing = async (req, res) => {
    try {
        const pool = global.dbPool || (req.app && req.app.locals.db);
        const borrowingId = req.params.id;
        const { items_condition } = req.body;
        
        await pool.query(`
            UPDATE equipment_borrowings 
            SET status = 'returned', returned_at = NOW()
            WHERE id = ?
        `, [borrowingId]);
        
        const [items] = await pool.query(`
            SELECT equipment_id, quantity FROM borrowing_items WHERE borrowing_id = ?
        `, [borrowingId]);
        
        for (const item of items) {
            await pool.query(`
                UPDATE borrowing_items 
                SET status = 'returned', returned_at = NOW(), notes = ?
                WHERE borrowing_id = ? AND equipment_id = ?
            `, [items_condition?.[item.equipment_id] || null, borrowingId, item.equipment_id]);
            
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
};

module.exports = { createBorrowing, getMyBorrowings, getBorrowingById, issueBorrowing, returnBorrowing };
