const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Get all laboratories
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                l.id,
                l.name,
                l.code,
                l.building,
                l.floor,
                l.capacity,
                l.description,
                l.status,
                l.created_at,
                l.updated_at,
                COUNT(c.id) as computer_count
            FROM laboratories l
            LEFT JOIN computers c ON c.laboratory_id = l.id
            GROUP BY l.id
            ORDER BY l.id ASC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching laboratories:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch laboratories' });
    }
});

// Get single laboratory
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                l.*,
                COUNT(c.id) as computer_count,
                COUNT(DISTINCT CASE WHEN c.status = 'available' THEN c.id END) as available_computers,
                COUNT(DISTINCT CASE WHEN c.status = 'in-use' THEN c.id END) as in_use_computers
            FROM laboratories l
            LEFT JOIN computers c ON c.laboratory_id = l.id
            WHERE l.id = ?
            GROUP BY l.id
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Laboratory not found' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch laboratory' });
    }
});

// Create new laboratory
router.post('/', async (req, res) => {
    try {
        const { name, code, building, floor, capacity, description, status } = req.body;

        // Check if code exists
        const [existing] = await pool.query('SELECT id FROM laboratories WHERE code = ?', [code]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Laboratory code already exists' });
        }

        const [result] = await pool.query(`
            INSERT INTO laboratories (name, code, building, floor, capacity, description, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [name, code, building, floor, capacity || 30, description, status || 'active']);

        res.status(201).json({ 
            success: true, 
            message: 'Laboratory added successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating laboratory:', error);
        res.status(500).json({ success: false, message: 'Failed to create laboratory' });
    }
});

// Update laboratory
router.put('/:id', async (req, res) => {
    try {
        const { name, code, building, floor, capacity, description, status } = req.body;
        
        const [result] = await pool.query(`
            UPDATE laboratories 
            SET name = ?, code = ?, building = ?, floor = ?, capacity = ?, description = ?, status = ?
            WHERE id = ?
        `, [name, code, building, floor, capacity, description, status, req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Laboratory not found' });
        }
        
        res.json({ success: true, message: 'Laboratory updated successfully' });
    } catch (error) {
        console.error('Error updating laboratory:', error);
        res.status(500).json({ success: false, message: 'Failed to update laboratory' });
    }
});

// Delete laboratory
router.delete('/:id', async (req, res) => {
    try {
        // Check if lab has computers
        const [computers] = await pool.query('SELECT id FROM computers WHERE laboratory_id = ? LIMIT 1', [req.params.id]);
        if (computers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete laboratory with assigned computers. Move or remove computers first.' 
            });
        }
        
        const [result] = await pool.query('DELETE FROM laboratories WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Laboratory not found' });
        }
        
        res.json({ success: true, message: 'Laboratory deleted successfully' });
    } catch (error) {
        console.error('Error deleting laboratory:', error);
        res.status(500).json({ success: false, message: 'Failed to delete laboratory' });
    }
});

// Get laboratory computers
router.get('/:id/computers', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM computers WHERE laboratory_id = ? ORDER BY name
        `, [req.params.id]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch computers' });
    }
});

// Update laboratory status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE laboratories SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: 'Laboratory status updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
});

module.exports = router;