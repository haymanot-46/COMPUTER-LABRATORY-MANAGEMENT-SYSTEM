const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { pool } = require('../config/database');

// POST /api/contact/submit - Submit a contact message (public)
router.post('/submit', async (req, res) => {
    try {
        const { name, email, subject, message, category, priority } = req.body;
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const [result] = await pool.query(
            'INSERT INTO contact_messages (name, email, subject, message, category, priority, ticket_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, subject, message, category || 'general', priority || 'normal', ticketNumber, 'pending']
        );
        res.status(201).json({
            success: true,
            message: 'Message sent successfully!',
            ticket: { ticketNumber, status: 'pending' }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/contact/messages - Get contact messages (admin/lab_manager)
router.get('/messages', protect, authorize('lab_manager', 'admin'), async (req, res) => {
    try {
        const { status, category, priority, limit = 100 } = req.query;
        let query = `SELECT cm.*, u.name as replied_by_name, u.email as replied_by_email 
                     FROM contact_messages cm LEFT JOIN users u ON cm.replied_by = u.id WHERE 1=1`;
        const params = [];
        if (status && status !== 'all') { query += ' AND cm.status = ?'; params.push(status); }
        if (category && category !== 'all') { query += ' AND cm.category = ?'; params.push(category); }
        if (priority && priority !== 'all') { query += ' AND cm.priority = ?'; params.push(priority); }
        query += ' ORDER BY CASE cm.priority WHEN "urgent" THEN 1 WHEN "high" THEN 2 WHEN "normal" THEN 3 ELSE 4 END ASC, cm.created_at DESC LIMIT ?';
        params.push(parseInt(limit));
        const [rows] = await pool.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/contact/messages/:id
router.get('/messages/:id', protect, authorize('lab_manager', 'admin'), async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT cm.*, u.name as replied_by_name FROM contact_messages cm LEFT JOIN users u ON cm.replied_by = u.id WHERE cm.id = ?',
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/contact/messages/:id/reply
router.post('/messages/:id/reply', protect, authorize('lab_manager', 'admin'), async (req, res) => {
    try {
        const { reply } = req.body;
        if (!reply) return res.status(400).json({ success: false, message: 'Reply is required' });
        const [messages] = await pool.query('SELECT id FROM contact_messages WHERE id = ?', [req.params.id]);
        if (!messages.length) return res.status(404).json({ success: false, message: 'Not found' });
        await pool.query('UPDATE contact_messages SET reply = ?, status = "replied", replied_by = ?, replied_at = NOW() WHERE id = ?',
            [reply, req.user.id, req.params.id]);
        res.json({ success: true, message: 'Reply sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/contact/messages/:id
router.delete('/messages/:id', protect, authorize('admin'), async (req, res) => {
    try {
        await pool.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
