const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
require('dotenv').config();

// JWT Secret - defined here since it's used
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';

/**
 * PROTECT Middleware - Verifies JWT token
 * Traceability: NFR-SEC-JWT-EXPIRY-002, FR-AUTH-TOKEN-002
 */
const protect = async (req, res, next) => {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized. No token provided.',
            traceId: 'NFR-SEC-JWT-EXPIRY-002'
        });
    }
    
    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user from database
        const [rows] = await pool.query(
            `SELECT id, email, name, role, department, student_id as studentId, 
                    phone, is_active as isActive 
             FROM users WHERE id = ? AND is_active = 1`,
            [decoded.id]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found or account deactivated',
                traceId: 'FR-AUTH-TOKEN-002'
            });
        }
        
        // Attach user to request
        req.user = rows[0];
        next();
        
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.',
                traceId: 'NFR-SEC-JWT-EXPIRY-002'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.',
                traceId: 'NFR-SEC-JWT-EXPIRY-002'
            });
        }
        
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Not authorized',
            traceId: 'NFR-SEC-JWT-EXPIRY-002'
        });
    }
};

/**
 * AUTHORIZE Middleware - Checks user role
 * Traceability: FR-AUTH-ROLE-REDIRECT-007
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
        }
        
        // Admin has access to everything
        if (req.user.role === 'admin') {
            return next();
        }
        
        // Normalize roles (handle both hyphen and underscore formats)
        const normalizeRole = (role) => {
            if (role === 'lab-manager') return 'lab_manager';
            if (role === 'lab-assistant') return 'lab_assistant';
            return role;
        };
        
        const userRole = normalizeRole(req.user.role);
        const normalizedAllowed = allowedRoles.map(r => normalizeRole(r));
        
        if (!normalizedAllowed.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Role '${req.user.role}' not authorized. Required: ${allowedRoles.join(', ')}`,
                requiredRoles: allowedRoles,
                userRole: req.user.role,
                traceId: 'FR-AUTH-ROLE-REDIRECT-007'
            });
        }
        
        next();
    };
};

/**
 * CHECK OWNERSHIP - Verifies user owns the resource
 * Traceability: FR-ALL-USER-PROFILE-010
 */
const checkOwnership = (getResourceUserId) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        
        // Admin can access any resource
        if (req.user.role === 'admin') {
            return next();
        }
        
        try {
            const resourceUserId = await getResourceUserId(req);
            if (req.user.id !== resourceUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to access this resource',
                    traceId: 'FR-ALL-USER-PROFILE-010'
                });
            }
            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error checking resource ownership'
            });
        }
    };
};

// Export ALL functions
module.exports = {
    protect,        // ✅ NOW DEFINED
    authorize,      // ✅ DEFINED
    checkOwnership, // ✅ OPTIONAL
    JWT_SECRET      // ✅ NOW DEFINED
};