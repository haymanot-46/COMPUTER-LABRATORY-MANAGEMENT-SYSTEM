function getPool() { return global.dbPool; }

const getLaboratories = async (req, res) => {
    try {
        const [rows] = await getPool().query(`
            SELECT 
                l.id,
                l.code,
                l.name,
                l.location,
                l.building,
                l.floor,
                l.capacity,
                l.computer_count,
                l.department,
                l.description,
                l.is_active as status,
                l.created_at,
                l.updated_at
            FROM laboratories l
            ORDER BY l.name
        `);

        const transformedRows = rows.map(row => ({
            ...row,
            status: row.status ? 'active' : 'inactive'
        }));

        res.json({ success: true, data: transformedRows });
    } catch (error) {
        console.error('Error fetching laboratories:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch laboratories' });
    }
};

const getLaboratoryById = async (req, res) => {
    try {
        const [rows] = await getPool().query(`
            SELECT 
                l.id,
                l.code,
                l.name,
                l.location,
                l.building,
                l.floor,
                l.capacity,
                l.computer_count,
                l.department,
                l.description,
                l.is_active as status
            FROM laboratories l
            WHERE l.id = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Laboratory not found' });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching laboratory:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch laboratory' });
    }
};

const createLaboratory = async (req, res) => {
    try {
        const { code, name, location, building, floor, capacity, department, description, status } = req.body;

        console.log('📝 Creating laboratory:', { code, name, building, capacity });

        if (!code) {
            return res.status(400).json({ success: false, message: 'Laboratory code is required' });
        }
        if (!name) {
            return res.status(400).json({ success: false, message: 'Laboratory name is required' });
        }
        if (!capacity) {
            return res.status(400).json({ success: false, message: 'Capacity is required' });
        }

        const [existing] = await getPool().query('SELECT id FROM laboratories WHERE code = ?', [code]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Laboratory code already exists' });
        }

        const isActive = status === 'active' ? 1 : 1;

        const [result] = await getPool().query(`
            INSERT INTO laboratories (
                code, name, location, building, floor, capacity, department, description, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            code,
            name,
            location || '',
            building || null,
            floor || null,
            capacity,
            department || null,
            description || null,
            isActive
        ]);

        console.log('✅ Laboratory created! ID:', result.insertId);

        res.status(201).json({
            success: true,
            message: 'Laboratory added successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating laboratory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create laboratory',
            error: error.message
        });
    }
};

const updateLaboratory = async (req, res) => {
    try {
        const { code, name, location, building, floor, capacity, department, description, status } = req.body;

        const isActive = status === 'active' ? 1 : 0;

        const [result] = await getPool().query(`
            UPDATE laboratories 
            SET code = ?, name = ?, location = ?, building = ?, 
                floor = ?, capacity = ?, department = ?, description = ?, is_active = ?
            WHERE id = ?
        `, [code, name, location, building, floor, capacity, department, description, isActive, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Laboratory not found' });
        }

        res.json({ success: true, message: 'Laboratory updated successfully' });
    } catch (error) {
        console.error('Error updating laboratory:', error);
        res.status(500).json({ success: false, message: 'Failed to update laboratory' });
    }
};

const deleteLaboratory = async (req, res) => {
    try {
        const [computers] = await getPool().query('SELECT id FROM computers WHERE laboratory_id = ? LIMIT 1', [req.params.id]);
        if (computers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete laboratory with assigned computers'
            });
        }

        const [result] = await getPool().query('DELETE FROM laboratories WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Laboratory not found' });
        }

        res.json({ success: true, message: 'Laboratory deleted successfully' });
    } catch (error) {
        console.error('Error deleting laboratory:', error);
        res.status(500).json({ success: false, message: 'Failed to delete laboratory' });
    }
};

module.exports = { getLaboratories, getLaboratoryById, createLaboratory, updateLaboratory, deleteLaboratory };
