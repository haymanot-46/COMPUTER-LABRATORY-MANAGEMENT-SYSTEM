const getAudits = async (req, res) => {
    try {
        const pool = global.dbPool || (req.app && req.app.locals.db);
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
        res.json({ success: true, data: [] });
    }
};

const getAuditById = async (req, res) => {
    try {
        const pool = global.dbPool || (req.app && req.app.locals.db);
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
};

const createAudit = async (req, res) => {
    try {
        const pool = global.dbPool || (req.app && req.app.locals.db);
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
};

module.exports = { getAudits, getAuditById, createAudit };
