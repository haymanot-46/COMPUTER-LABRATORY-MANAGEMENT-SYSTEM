const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Get all computers with laboratory info
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                c.id,
                c.asset_tag,
                c.name as computer_name,
                c.model,
                c.brand,
                c.serial_number,
                c.laboratory_id,
                l.name as laboratory_name,
                l.code as laboratory_code,
                c.processor,
                c.ram,
                c.storage,
                c.os,
                c.ip_address,
                c.mac_address,
                c.purchase_date,
                c.warranty_expiry,
                c.status,
                c.current_user_id,
                c.last_maintenance,
                c.notes,
                c.created_at,
                c.updated_at
            FROM computers c
            LEFT JOIN laboratories l ON c.laboratory_id = l.id
            ORDER BY c.id DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching computers:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch computers' });
    }
});

// Get single computer
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM computers WHERE id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Computer not found' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch computer' });
    }
});

// Create new computer
router.post('/', async (req, res) => {
    try {
        const {
            asset_tag,
            name,
            model,
            brand,
            serial_number,
            laboratory_id,
            processor,
            ram,
            storage,
            os,
            ip_address,
            mac_address,
            purchase_date,
            warranty_expiry,
            status,
            notes
        } = req.body;

        // Check if asset tag exists
        const [existing] = await pool.query('SELECT id FROM computers WHERE asset_tag = ?', [asset_tag]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Asset tag already exists' });
        }

        const [result] = await pool.query(`
            INSERT INTO computers (
                asset_tag, name, model, brand, serial_number, laboratory_id,
                processor, ram, storage, os, ip_address, mac_address,
                purchase_date, warranty_expiry, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            asset_tag, name, model, brand, serial_number, laboratory_id,
            processor, ram, storage, os, ip_address, mac_address,
            purchase_date, warranty_expiry, status || 'available', notes
        ]);

        res.status(201).json({ 
            success: true, 
            message: 'Computer added successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating computer:', error);
        res.status(500).json({ success: false, message: 'Failed to create computer' });
    }
});

// Update computer
router.put('/:id', async (req, res) => {
    try {
        const computerId = req.params.id;
        const {
            asset_tag,
            name,
            model,
            brand,
            serial_number,
            laboratory_id,
            processor,
            ram,
            storage,
            os,
            ip_address,
            mac_address,
            purchase_date,
            warranty_expiry,
            status,
            notes
        } = req.body;

        const [result] = await pool.query(`
            UPDATE computers SET 
                asset_tag = ?,
                name = ?,
                model = ?,
                brand = ?,
                serial_number = ?,
                laboratory_id = ?,
                processor = ?,
                ram = ?,
                storage = ?,
                os = ?,
                ip_address = ?,
                mac_address = ?,
                purchase_date = ?,
                warranty_expiry = ?,
                status = ?,
                notes = ?
            WHERE id = ?
        `, [
            asset_tag, name, model, brand, serial_number, laboratory_id,
            processor, ram, storage, os, ip_address, mac_address,
            purchase_date, warranty_expiry, status, notes, computerId
        ]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Computer not found' });
        }
        
        res.json({ success: true, message: 'Computer updated successfully' });
    } catch (error) {
        console.error('Error updating computer:', error);
        res.status(500).json({ success: false, message: 'Failed to update computer' });
    }
});

// Delete computer
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM computers WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Computer not found' });
        }
        
        res.json({ success: true, message: 'Computer deleted successfully' });
    } catch (error) {
        console.error('Error deleting computer:', error);
        res.status(500).json({ success: false, message: 'Failed to delete computer' });
    }
});

// Update computer status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE computers SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: 'Computer status updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
});

module.exports = router;