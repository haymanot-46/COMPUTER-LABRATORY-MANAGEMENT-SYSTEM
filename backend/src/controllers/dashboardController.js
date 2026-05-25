function getPool() { return global.dbPool; }

const getAdminStats = async (req, res) => {
    try {
        const [userCount] = await getPool().query('SELECT COUNT(*) as total FROM users');
        const [computerCount] = await getPool().query('SELECT COUNT(*) as total FROM computers');
        const [labCount] = await getPool().query('SELECT COUNT(*) as total FROM laboratories WHERE is_active = 1');

        res.json({
            success: true,
            data: {
                totalUsers: userCount[0].total,
                totalComputers: computerCount[0].total,
                activeLabs: labCount[0].total,
                maintenanceRequests: 0
            }
        });
    } catch (error) {
        res.json({ success: true, data: { totalUsers: 0, totalComputers: 0, activeLabs: 0 } });
    }
};

module.exports = { getAdminStats };
