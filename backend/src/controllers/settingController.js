const mysql = require('mysql2/promise');

let pool = null;

const setPool = (dbPool) => {
    pool = dbPool;
};

// Get all settings
const getSettings = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM settings ORDER BY category, `order`');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error getting settings:', error);
        res.status(500).json({ success: false, message: 'Failed to get settings' });
    }
};

// Get single setting
const getSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const [rows] = await pool.query('SELECT * FROM settings WHERE `key` = ?', [key]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Setting not found' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get setting' });
    }
};

// Update setting
const updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        
        await pool.query('UPDATE settings SET value = ? WHERE `key` = ?', [JSON.stringify(value), key]);
        
        res.json({ success: true, message: 'Setting updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update setting' });
    }
};

// Update multiple settings
const updateMultipleSettings = async (req, res) => {
    try {
        const { settings } = req.body;
        
        for (const [key, value] of Object.entries(settings)) {
            await pool.query('UPDATE settings SET value = ? WHERE `key` = ?', [JSON.stringify(value), key]);
        }
        
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
};

// Get settings by category
const getSettingByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const [rows] = await pool.query('SELECT * FROM settings WHERE category = ? ORDER BY `order`', [category]);
        
        const result = {};
        rows.forEach(row => {
            try {
                result[row.key] = JSON.parse(row.value);
            } catch {
                result[row.key] = row.value;
            }
        });
        
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get settings' });
    }
};

// Reset settings
const resetSettings = async (req, res) => {
    try {
        const { category } = req.body;
        
        if (category) {
            await pool.query('DELETE FROM settings WHERE category = ?', [category]);
        } else {
            await pool.query('DELETE FROM settings');
        }
        
        res.json({ success: true, message: 'Settings reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to reset settings' });
    }
};

module.exports = {
    getSettings,
    getSetting,
    updateSetting,
    updateMultipleSettings,
    getSettingByCategory,
    resetSettings,
    setPool
};
