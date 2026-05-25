const { pool } = require('../config/database');

const getNotifications = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT ?',
      [req.user.id, parseInt(limit)]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

const markAsRead = async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND (user_id = ? OR user_id IS NULL)', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0', [req.user.id]);
    res.json({ success: true, message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications WHERE id = ? AND (user_id = ? OR user_id IS NULL)', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendNotification = async (req, res) => {
  try {
    const { user_id, title, message, type } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, message: 'Title and message required' });
    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, title, message, type, created_at) VALUES (?, ?, ?, ?, NOW())',
      [user_id || null, title, message, type || 'info']
    );
    res.status(201).json({ success: true, message: 'Notification sent', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0',
      [req.user.id]
    );
    res.json({ success: true, data: { unreadCount: rows[0].count } });
  } catch (error) {
    res.json({ success: true, data: { unreadCount: 0 } });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification, sendNotification, getUnreadCount };
