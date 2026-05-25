const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'teacher', 'student', 'lab_manager', 'dean', 'ict', 'asset', 'lab_assistant'),
        defaultValue: 'student'
    },
    department: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    studentId: {
        type: DataTypes.STRING(100),
        unique: true,
        field: 'student_id'
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    profileImage: {
        type: DataTypes.STRING(500),
        field: 'profile_image'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_email_verified'
    },
    emailVerificationToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'email_verification_token'
    },
    resetPasswordToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'reset_password_token'
    },
    resetPasswordExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reset_password_expiry'
    },
    lastLogin: {
        type: DataTypes.DATE,
        field: 'last_login'
    },
    lastLoginIp: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: 'last_login_ip'
    },
    failedLoginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'failed_login_attempts'
    },
    lockedUntil: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'locked_until'
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = User;