function getPool() { return global.dbPool; }

const getComputers = async (req, res) => {
    try {
        const [rows] = await getPool().query(`
            SELECT 
                c.id,
                c.code as asset_tag,
                c.workstation_number as name,
                c.model,
                c.serial_number,
                c.laboratory_id,
                c.processor,
                c.ram,
                c.storage,
                c.operating_system as os,
                c.ip_address,
                c.mac_address,
                c.status,
                c.purchase_date,
                c.warranty_expiry,
                c.notes,
                c.created_at,
                l.name as laboratory_name,
                l.code as laboratory_code
            FROM computers c
            LEFT JOIN laboratories l ON c.laboratory_id = l.id
            ORDER BY c.id DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching computers:', error);
        res.json({ success: true, data: [] });
    }
};

const getComputerById = async (req, res) => {
    try {
        const [rows] = await getPool().query(`
            SELECT 
                c.id,
                c.code as asset_tag,
                c.workstation_number as name,
                c.model,
                c.serial_number,
                c.laboratory_id,
                c.processor,
                c.ram,
                c.storage,
                c.operating_system as os,
                c.ip_address,
                c.mac_address,
                c.status,
                c.purchase_date,
                c.warranty_expiry,
                c.notes,
                c.created_at,
                l.name as laboratory_name,
                l.code as laboratory_code
            FROM computers c
            LEFT JOIN laboratories l ON c.laboratory_id = l.id
            WHERE c.id = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Computer not found' });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching computer:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch computer' });
    }
};

const createComputer = async (req, res) => {
    try {
        const {
            asset_tag,
            name,
            model,
            serial_number,
            laboratory_id,
            processor,
            ram,
            storage,
            os,
            ip_address,
            mac_address,
            status,
            purchase_date,
            warranty_expiry,
            notes
        } = req.body;

        console.log('Creating computer:', { asset_tag, name, model, laboratory_id });

        if (!asset_tag) {
            return res.status(400).json({ success: false, message: 'Asset tag is required' });
        }
        if (!name) {
            return res.status(400).json({ success: false, message: 'Workstation number is required' });
        }
        if (!model) {
            return res.status(400).json({ success: false, message: 'Model is required' });
        }
        if (!laboratory_id) {
            return res.status(400).json({ success: false, message: 'Laboratory ID is required' });
        }

        const [existing] = await getPool().query('SELECT id FROM computers WHERE code = ?', [asset_tag]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Asset tag already exists' });
        }

        const [result] = await getPool().query(`
            INSERT INTO computers (
                code,
                workstation_number,
                model,
                serial_number,
                laboratory_id,
                processor,
                ram,
                storage,
                operating_system,
                ip_address,
                mac_address,
                status,
                purchase_date,
                warranty_expiry,
                notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            asset_tag,
            name,
            model,
            serial_number || null,
            laboratory_id,
            processor || null,
            ram || null,
            storage || null,
            os || null,
            ip_address || null,
            mac_address || null,
            status || 'active',
            purchase_date || null,
            warranty_expiry || null,
            notes || null
        ]);

        await getPool().query('UPDATE laboratories SET computer_count = computer_count + 1 WHERE id = ?', [laboratory_id]);

        console.log('✅ Computer created! ID:', result.insertId);

        res.status(201).json({
            success: true,
            message: 'Computer added successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating computer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create computer',
            error: error.message
        });
    }
};

const updateComputer = async (req, res) => {
    try {
        const {
            asset_tag,
            name,
            model,
            serial_number,
            laboratory_id,
            processor,
            ram,
            storage,
            os,
            ip_address,
            mac_address,
            status,
            purchase_date,
            warranty_expiry,
            notes
        } = req.body;

        const [result] = await getPool().query(`
            UPDATE computers 
            SET code = ?, workstation_number = ?, model = ?, serial_number = ?, laboratory_id = ?,
                processor = ?, ram = ?, storage = ?, operating_system = ?, 
                ip_address = ?, mac_address = ?, status = ?, 
                purchase_date = ?, warranty_expiry = ?, notes = ?
            WHERE id = ?
        `, [
            asset_tag, name, model, serial_number, laboratory_id,
            processor, ram, storage, os,
            ip_address, mac_address, status,
            purchase_date, warranty_expiry, notes, req.params.id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Computer not found' });
        }

        res.json({ success: true, message: 'Computer updated successfully' });
    } catch (error) {
        console.error('Error updating computer:', error);
        res.status(500).json({ success: false, message: 'Failed to update computer' });
    }
};

const deleteComputer = async (req, res) => {
    try {
        const [computer] = await getPool().query('SELECT laboratory_id FROM computers WHERE id = ?', [req.params.id]);
        const labId = computer[0]?.laboratory_id;

        const [result] = await getPool().query('DELETE FROM computers WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Computer not found' });
        }

        if (labId) {
            await getPool().query('UPDATE laboratories SET computer_count = computer_count - 1 WHERE id = ?', [labId]);
        }

        res.json({ success: true, message: 'Computer deleted successfully' });
    } catch (error) {
        console.error('Error deleting computer:', error);
        res.status(500).json({ success: false, message: 'Failed to delete computer' });
    }
};

module.exports = { getComputers, getComputerById, createComputer, updateComputer, deleteComputer };
