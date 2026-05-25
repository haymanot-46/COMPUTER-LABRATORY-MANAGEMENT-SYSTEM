// Simple Settings model without Sequelize
// Since we're using raw MySQL queries, this is just a wrapper

class Settings {
    constructor(pool) {
        this.pool = pool;
    }

    // Get all settings
    static async getAll(pool) {
        const [rows] = await pool.query('SELECT * FROM settings ORDER BY category, `order`');
        return rows;
    }

    // Get setting by key_name
    static async getByKey(pool, keyName) {
        const [rows] = await pool.query('SELECT * FROM settings WHERE key_name = ?', [keyName]);
        return rows[0];
    }

    // Get settings by category
    static async getByCategory(pool, category) {
        const [rows] = await pool.query('SELECT * FROM settings WHERE category = ? ORDER BY `order`', [category]);
        return rows;
    }

    // Update setting
    static async update(pool, keyName, value, updatedBy = null) {
        const [result] = await pool.query(
            'UPDATE settings SET value = ?, updated_by = ? WHERE key_name = ?',
            [JSON.stringify(value), updatedBy, keyName]
        );
        return result.affectedRows > 0;
    }

    // Create or update setting
    static async set(pool, keyName, value, category = 'system', type = 'string', description = '') {
        const [existing] = await pool.query('SELECT id FROM settings WHERE key_name = ?', [keyName]);
        
        if (existing.length > 0) {
            await pool.query('UPDATE settings SET value = ? WHERE key_name = ?', [JSON.stringify(value), keyName]);
        } else {
            await pool.query(
                'INSERT INTO settings (key_name, value, category, type, description) VALUES (?, ?, ?, ?, ?)',
                [keyName, JSON.stringify(value), category, type, description]
            );
        }
        return true;
    }

    // Initialize default settings
    static async initDefaults(pool) {
        const defaultSettings = {
            system_name: { value: 'CLMS - Injibara University', category: 'system', type: 'string', description: 'System name' },
            system_version: { value: '2.0.0', category: 'system', type: 'string', description: 'System version' },
            maintenance_mode: { value: false, category: 'system', type: 'boolean', description: 'Enable maintenance mode' },
            current_semester: { value: '2nd Semester 2025', category: 'academic', type: 'string', description: 'Current academic semester' },
            max_login_attempts: { value: 5, category: 'security', type: 'number', description: 'Maximum failed login attempts' },
            session_timeout_minutes: { value: 60, category: 'security', type: 'number', description: 'Session timeout in minutes' },
            email_notifications: { value: true, category: 'notification', type: 'boolean', description: 'Enable email notifications' },
            backup_enabled: { value: true, category: 'backup', type: 'boolean', description: 'Enable automatic backup' },
            backup_retention_days: { value: 30, category: 'backup', type: 'number', description: 'Backup retention in days' }
        };

        for (const [key, config] of Object.entries(defaultSettings)) {
            await this.set(pool, key, config.value, config.category, config.type, config.description);
        }
        
        console.log('Default settings initialized');
        return true;
    }
}

module.exports = Settings;
