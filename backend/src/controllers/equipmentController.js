const getEquipment = async (req, res) => {
    try {
        const pool = global.dbPool || (req.app && req.app.locals.db);
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
            query += ' AND e.laboratory_id = ?';
            params.push(lab);
        }
        
        query += ' ORDER BY e.id DESC';
        
        const [rows] = await pool.query(query, params);
        
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
};

const getAvailableEquipment = async (req, res) => {
    try {
        const pool = global.dbPool || (req.app && req.app.locals.db);
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
};

const getEquipmentById = async (req, res) => {
    try {
        const pool = global.dbPool || (req.app && req.app.locals.db);
        const [rows] = await pool.query('SELECT * FROM equipment WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Equipment not found' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch equipment' });
    }
};

const createEquipment = async (req, res) => {
    try {
        const pool = global.dbPool || (req.app && req.app.locals.db);
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
};

const updateEquipment = async (req, res) => {
    try {
        const pool = global.dbPool || (req.app && req.app.locals.db);
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
};

const deleteEquipment = async (req, res) => {
    try {
        const pool = global.dbPool || (req.app && req.app.locals.db);
        await pool.query('DELETE FROM equipment WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Equipment deleted successfully' });
    } catch (error) {
        console.error('Error deleting equipment:', error);
        res.status(500).json({ success: false, message: 'Failed to delete equipment' });
    }
};

module.exports = { getEquipment, getAvailableEquipment, getEquipmentById, createEquipment, updateEquipment, deleteEquipment };
